/* ===== ĐỒNG BỘ: lưu dữ liệu vào cơ sở dữ liệu chung (capability db), phân quyền theo vai trò =====
   Chia dữ liệu thành các tài liệu nhỏ (mỗi tài liệu ≤ 256 KiB, dạng {j: chuỗi JSON}) để nhiều người cùng ghi ít đụng nhau:
   cfg/main            thông tin công ty, tham số pháp lý, tài khoản, khóa sổ        (chỉ Quản trị ghi)
   kt/<phần>           danh mục, số dư đầu kỳ, hồ sơ chứng từ, thang lương, bộ đếm   (Kế toán ghi)
   pay/<yyyy-mm>       bảng lương từng tháng
   jr/<yyyy-mm>_<n>    sổ PS chia theo tháng, mỗi tài liệu tối đa JR_MAX dòng
   Không có đường db (chưa đăng nhập, xem thử): dùng lưu trình duyệt như bản cũ. */
(function (G) {
'use strict';
const KT = G.KT;
const JR_MAX = 250;
const ROLE = { quantri: 'Quản trị', ketoan: 'Kế toán (nhập liệu)', xem: 'Chỉ xem', local: 'Cá nhân (trên máy này)' };
KT._saveLocal = KT.saveNow; KT._initLocal = KT.initStore; KT._saveInfoLocal = KT.saveInfo; KT._schedLocal = KT.scheduleSave;
KT.role = 'local'; KT.readOnly = false; KT.dbMode = false;
KT.roleName = () => ROLE[KT.role] || '';
KT.can = what => KT.role === 'quantri' || (what !== 'admin' && KT.role === 'ketoan') || KT.role === 'local';
KT.saveLabel = si => si.mode === 'db' ? 'cơ sở dữ liệu chung · ' + KT.roleName() + (KT.sync.state ? ' · ' + KT.sync.state : '')
  : si.mode === 'indexeddb' ? 'trong trình duyệt' : si.mode === 'localstorage' ? 'localStorage' : 'chưa lưu được (bộ nhớ tạm)';

const SEC = [   // [bộ sưu tập, id, lấy, gán, chỉ quản trị]
  ['cfg', 'main', S => ({ company: S.company, legal: S.legal, accounts: S.accounts, lockedUntil: S.lockedUntil || '', meta: S.meta }),
    (S, d) => { Object.assign(S, { company: d.company, legal: d.legal, accounts: d.accounts, lockedUntil: d.lockedUntil || '', meta: d.meta || S.meta }); }, true],
  ...['partners', 'items', 'orders', 'employees', 'assets', 'prepaids', 'opening', 'payScale'].map(k => ['kt', k, S => ({ a: S[k] || [] }), (S, d) => { S[k] = d.a || []; }, false]),
  ['kt', 'misc', S => ({ vdoc: S.vdoc || {}, filings: S.filings || {}, seq: S.seq || 1 }), (S, d) => { S.vdoc = d.vdoc || {}; S.filings = d.filings || {}; S.seq = Math.max(S.seq, d.seq || 1); }, false]
];
const sync = KT.sync = { state: '', last: {}, remote: {}, ready: {}, timer: 0, busy: false, again: false };
let db = null, unsubs = [], applying = false;

/* trạng thái → danh sách tài liệu [đường dẫn, chuỗi, chỉ quản trị] */
const serialize = () => {
  const S = KT.S, out = {};
  SEC.forEach(([c, id, get, , adm]) => { out[c + '/' + id] = [JSON.stringify(get(S)), adm]; });
  Object.keys(S.payroll || {}).forEach(ym => { out['pay/' + ym] = [JSON.stringify({ v: S.payroll[ym] }), false]; });
  const by = {};
  S.journal.forEach(l => { const k = (/^\d{4}-\d{2}/.test(l.ng || '') ? l.ng.slice(0, 7) : 'na'); (by[k] = by[k] || []).push(l); });
  Object.keys(by).forEach(k => { const a = by[k]; for (let i = 0; i * JR_MAX < a.length; i++) out['jr/' + k + '_' + i] = [JSON.stringify({ l: a.slice(i * JR_MAX, (i + 1) * JR_MAX) }), false]; });
  return out;
};
const build = remote => {
  const S = KT.newState();
  SEC.forEach(([c, id, , set]) => { const j = remote[c + '/' + id]; if (j) { try { set(S, JSON.parse(j)); } catch (e) { console.error('cfg lỗi', c, id, e); } } });
  Object.keys(remote).sort().forEach(p => {
    const j = remote[p]; try {
      if (p.startsWith('pay/')) S.payroll[p.slice(4)] = JSON.parse(j).v;
      else if (p.startsWith('jr/')) S.journal.push(...JSON.parse(j).l);
    } catch (e) { console.error('lỗi đọc', p, e); }
  });
  return S;
};
sync.pending = () => !!sync.timer || sync.busy;

/* ghi các tài liệu đã đổi */
sync.flush = async () => {
  if (!KT.dbMode || KT.readOnly) return;
  if (sync.busy) { sync.again = true; return; }
  sync.busy = true; sync.state = 'đang lưu…'; let denied = false;
  try {
    do {
      sync.again = false; const cur = serialize();
      for (const p of Object.keys(cur)) {
        const [str, adm] = cur[p]; if (sync.last[p] === str) continue;
        if (adm && KT.role !== 'quantri') { denied = true; continue; }
        const old = sync.last[p]; sync.last[p] = str;
        try { await db.doc(p).set({ j: str }); }
        catch (e) { sync.last[p] = old; throw e; }
      }
      for (const p of Object.keys(sync.last)) {
        if (cur[p] || sync.last[p] === null) continue;
        const old = sync.last[p]; sync.last[p] = null;
        try { await db.doc(p).delete(); } catch (e) { sync.last[p] = old; throw e; }
      }
    } while (sync.again);
    sync.state = 'đã lưu ' + new Date().toLocaleTimeString('vi-VN'); sync.fail = 0;
    if (denied) { KT.ui && KT.ui.toast('Chỉ Quản trị được sửa thông tin công ty, tham số pháp lý, hệ thống tài khoản, khóa sổ. Phần đó chưa được lưu.'); sync.applyRemote(true); }
  } catch (e) {
    sync.fail = (sync.fail || 0) + 1; sync.state = 'lưu lỗi';
    const code = e && e.code;
    if (code === 'invalid_argument') { KT.role = 'xem'; KT.readOnly = true; KT.ui && KT.ui.toast('Bạn không có quyền ghi dữ liệu. Chuyển sang chế độ chỉ xem.'); sync.applyRemote(true); }
    else { KT.ui && KT.ui.toast('Chưa lưu được (' + (code || 'lỗi mạng') + '). Sẽ thử lại.'); if (sync.fail < 4) sync.timer = setTimeout(() => { sync.timer = 0; sync.flush(); }, 4000 * sync.fail); }
  } finally { sync.busy = false; UI_refreshFoot(); }
};
const UI_refreshFoot = () => { const f = document.querySelector('.side-foot .savelbl'); if (f) f.textContent = KT.saveLabel(KT.saveInfo()); };
KT.scheduleSave = () => { if (!KT.dbMode) return KT._schedLocal(); if (KT.readOnly || KT.noSave) return; clearTimeout(sync.timer); sync.timer = setTimeout(() => { sync.timer = 0; sync.flush(); }, 700); };
KT.saveNow = () => KT.dbMode ? sync.flush() : KT._saveLocal(true);

/* áp dữ liệu nhận từ người khác (hoặc hoàn nguyên khi không có quyền) */
sync.applyRemote = async force => {
  if (applying) return; applying = true;
  try {
    if (!force && sync.pending()) { clearTimeout(sync.timer); sync.timer = 0; await sync.flush(); }
    const S = build(sync.remote); Object.keys(sync.remote).forEach(p => { sync.last[p] = sync.remote[p]; });
    Object.keys(sync.last).forEach(p => { if (!(p in sync.remote)) sync.last[p] = null; });
    KT.setState(S); if (!force && KT.ui) KT.ui.toast('Dữ liệu vừa được cập nhật từ người dùng khác.');
  } finally { applying = false; }
};
KT.rebuildFromRemote = () => sync.applyRemote(true);

const onSnap = (coll, snap) => {
  let ext = false;
  snap.docChanges().forEach(ch => {
    const p = coll + '/' + ch.doc.id; const d = ch.doc.data();
    if (ch.type === 'removed') { delete sync.remote[p]; if (sync.last[p] != null) ext = true; }
    else { const j = d && d.j; sync.remote[p] = j; if (sync.last[p] !== j) ext = true; }
  });
  if (!snap.metadata.fromCache) sync.ready[coll] = true;
  if (sync.booted && ext && sync.allReady()) { clearTimeout(sync.rt); sync.rt = setTimeout(() => sync.applyRemote(false), 400); }
  if (sync.onFirst && sync.allReady()) { const f = sync.onFirst; sync.onFirst = null; f(); }
};
sync.allReady = () => ['cfg', 'kt', 'pay', 'jr'].every(c => sync.ready[c]);

/* khởi động: db nếu có, nếu không dùng lưu trình duyệt */
KT.initStore = async () => {
  const withTimeout = (p, ms) => Promise.race([p, new Promise(r => setTimeout(() => r(null), ms))]);
  let user = null;
  try { db = G.claude && await withTimeout(G.claude.use('db'), 6000); user = G.claude && await withTimeout(G.claude.use('user'), 6000); } catch (e) { db = null; }
  if (!db) { KT.role = 'local'; return KT._initLocal(); }
  let admin = false, wr = null;
  try { admin = user ? await user.canEdit() : false; wr = user ? await user.can('data.write') : null; } catch (e) { }
  KT.role = admin ? 'quantri' : wr === false ? 'xem' : 'ketoan'; KT.readOnly = KT.role === 'xem'; KT.dbMode = true;
  KT.saveInfo = () => ({ mode: 'db', last: sync.state });
  sync.state = 'đang tải…';
  await new Promise(done => {
    sync.onFirst = done; setTimeout(() => { if (sync.onFirst) { sync.onFirst = null; done(); } }, 9000);
    ['cfg', 'kt', 'pay', 'jr'].forEach(c => unsubs.push(db.collection(c).onSnapshot(s => onSnap(c, s), e => { console.error('db', c, e); if (e && e.code === 'revoked') { KT.readOnly = true; } sync.state = 'mất kết nối'; sync.ready[c] = true; if (sync.onFirst && sync.allReady()) { const f = sync.onFirst; sync.onFirst = null; f(); } })));
  });
  if (!sync.allReady() && !Object.keys(sync.remote).length) { /* không đọc được: quay về lưu trình duyệt để không mất việc */
    unsubs.forEach(u => { try { u(); } catch (e) { } }); KT.dbMode = false; KT.role = 'local'; KT.readOnly = false; KT.saveInfo = KT._saveInfoLocal;
    return KT._initLocal();
  }
  const has = Object.keys(sync.remote).length > 0;
  KT.S = build(sync.remote); KT.migrate();
  Object.keys(sync.remote).forEach(p => { sync.last[p] = sync.remote[p]; });
  sync.state = 'đã đồng bộ'; sync.booted = true; sync.empty = !has;
  return has;
};

/* người không có quyền ghi: mọi thay đổi bị hủy */
const touch0 = KT.touch;
KT.touch = function (silent) {
  if (KT.readOnly && KT.dbMode) { if (KT.ui) KT.ui.toast('Bạn chỉ có quyền xem, thay đổi không được lưu.'); sync.applyRemote(true); return; }
  return touch0.apply(this, arguments);
};
const setState0 = KT.setState;
KT.setState = function (s) { return setState0.call(this, s); };
G.addEventListener('beforeunload', () => { if (KT.dbMode && sync.pending()) { try { sync.flush(); } catch (e) { } } });
})(window);
