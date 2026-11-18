/* ===== KẾ TOÁN PS — core: tiện ích, trạng thái, lưu trữ ===== */
(function (G) {
'use strict';
const KT = G.KT = G.KT || {};

/* ---------- số ---------- */
KT.rnd = x => { x = +x || 0; return x < 0 ? -Math.round(-x) : Math.round(x); };
KT.num = v => {
  if (typeof v === 'number') return isFinite(v) ? v : 0;
  if (v == null || v === '') return 0;
  let s = String(v).trim().replace(/\s/g, '').replace(/[đ₫]/gi, '');
  if (/^-?\d{1,3}(\.\d{3})+(,\d+)?$/.test(s)) s = s.replace(/\./g, '').replace(',', '.');
  else if (/^-?\d{1,3}(,\d{3})+(\.\d+)?$/.test(s)) s = s.replace(/,/g, '');
  else s = s.replace(',', '.');
  const n = parseFloat(s); return isFinite(n) ? n : 0;
};
const grp = s => s.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
/** số tiền: 1.234.567 ; âm: -1.234 ; 0 → '' (dash=true → '-') */
KT.f = (n, dash) => { n = KT.rnd(n); if (!n) return dash ? '-' : ''; return (n < 0 ? '-' : '') + grp(String(Math.abs(n))); };
/** số tiền BCTC: âm trong ngoặc */
KT.fp = (n, dash) => { n = KT.rnd(n); if (!n) return dash === false ? '' : '-'; return n < 0 ? '(' + grp(String(-n)) + ')' : grp(String(n)); };
/** số lượng: tối đa 3 lẻ */
KT.fq = n => { n = +n || 0; if (!n) return ''; const r = Math.round(n * 1000) / 1000; const [a, b] = String(Math.abs(r)).split('.'); return (r < 0 ? '-' : '') + grp(a) + (b ? ',' + b : ''); };
KT.pct = (n, d = 1) => (n * 100).toFixed(d).replace('.', ',') + '%';
KT.esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

/* ---------- ngày (ISO yyyy-mm-dd) ---------- */
const D = KT.d = {};
const p2 = n => String(n).padStart(2, '0');
D.iso = (y, m, d) => y + '-' + p2(m) + '-' + p2(d);
D.parse = v => {
  if (v == null || v === '') return '';
  if (v instanceof Date) return isNaN(v) ? '' : D.iso(v.getFullYear(), v.getMonth() + 1, v.getDate());
  if (typeof v === 'number') { if (v > 20000 && v < 90000) { const dt = new Date(Date.UTC(1899, 11, 30) + Math.round(v) * 864e5); return D.iso(dt.getUTCFullYear(), dt.getUTCMonth() + 1, dt.getUTCDate()); } return ''; }
  const s = String(v).trim(); let m;
  if ((m = s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/))) return D.valid(D.iso(+m[1], +m[2], +m[3]));
  if ((m = s.match(/^(\d{1,2})[\/\-.](\d{1,2})[\/\-.](\d{2,4})$/))) { let y = +m[3]; if (y < 100) y += 2000; return D.valid(D.iso(y, +m[2], +m[1])); }
  if (/^\d{5}$/.test(s)) return D.parse(+s);
  return '';
};
D.valid = s => { const [y, m, d] = s.split('-').map(Number); const dt = new Date(Date.UTC(y, m - 1, d)); return dt.getUTCFullYear() === y && dt.getUTCMonth() === m - 1 && dt.getUTCDate() === d ? s : ''; };
D.fmt = s => s ? s.slice(8, 10) + '/' + s.slice(5, 7) + '/' + s.slice(0, 4) : '';
D.ym = s => s.slice(0, 7);
D.year = s => +s.slice(0, 4);
D.eom = ym => { const [y, m] = ym.split('-').map(Number); return D.iso(y, m, new Date(Date.UTC(y, m, 0)).getUTCDate()); };
D.bom = ym => ym + '-01';
D.addDays = (s, n) => { const [y, m, d] = s.split('-').map(Number); const dt = new Date(Date.UTC(y, m - 1, d + n)); return D.iso(dt.getUTCFullYear(), dt.getUTCMonth() + 1, dt.getUTCDate()); };
D.diff = (a, b) => Math.round((Date.parse(b + 'T00:00:00Z') - Date.parse(a + 'T00:00:00Z')) / 864e5);
D.addMonths = (ym, n) => { let [y, m] = ym.split('-').map(Number); m += n; y += Math.floor((m - 1) / 12); m = ((m - 1) % 12 + 12) % 12 + 1; return y + '-' + p2(m); };
D.monthsBetween = (a, b) => (+b.slice(0, 4) - +a.slice(0, 4)) * 12 + (+b.slice(5, 7) - +a.slice(5, 7));
D.quarter = ym => Math.ceil(+ym.slice(5, 7) / 3);
D.qRange = (y, q) => [D.iso(y, (q - 1) * 3 + 1, 1), D.eom(y + '-' + p2(q * 3))];
D.yRange = y => [D.iso(y, 1, 1), D.iso(y, 12, 31)];
D.today = () => D.parse(new Date());
/** ngày làm việc kế tiếp nếu rơi T7/CN */
D.nextWorkday = s => { let x = s; for (let i = 0; i < 4; i++) { const dt = new Date(x + 'T00:00:00Z'); const w = dt.getUTCDay(); if (w === 0 || w === 6) x = D.addDays(x, 1); else break; } return x; };
D.workdays = (ym, sat) => { const [y, m] = ym.split('-').map(Number); const n = new Date(Date.UTC(y, m, 0)).getUTCDate(); let c = 0; for (let d = 1; d <= n; d++) { const w = new Date(Date.UTC(y, m - 1, d)).getUTCDay(); if (w !== 0 && (sat || w !== 6)) c++; } return c; };

/* ---------- tham số pháp lý (có hiệu lực theo ngày) ---------- */
KT.defaultLegal = () => ({
  luongCoSo: [{ from: '2024-07-01', v: 2340000 }, { from: '2026-07-01', v: 2530000 }],
  luongTT: {   // lương tối thiểu tháng theo vùng
    1: [{ from: '2024-07-01', v: 4960000 }, { from: '2026-01-01', v: 5310000 }],
    2: [{ from: '2024-07-01', v: 4410000 }, { from: '2026-01-01', v: 4730000 }],
    3: [{ from: '2024-07-01', v: 3860000 }, { from: '2026-01-01', v: 4140000 }],
    4: [{ from: '2024-07-01', v: 3450000 }, { from: '2026-01-01', v: 3700000 }]
  },
  giamTru: [{ from: '2020-07-01', ban: 11000000, pt: 4400000 }, { from: '2026-01-01', ban: 15500000, pt: 6200000 }],
  bieuThue: [
    { from: '2009-01-01', b: [[5e6, .05], [10e6, .10], [18e6, .15], [32e6, .20], [52e6, .25], [80e6, .30], [null, .35]] },
    { from: '2026-01-01', b: [[10e6, .05], [30e6, .10], [60e6, .20], [100e6, .30], [null, .35]] }
  ],
  thueKhauTruVangLai: 0.10,         // khấu trừ 10% HĐ < 3 tháng / không HĐ
  nguongKhauTruVangLai: 2000000,    // thu nhập từ 2 triệu/lần
  bh: {
    nld: { bhxh: .08, bhyt: .015, bhtn: .01 },
    nsd: { bhxh: .175, bhyt: .03, bhtn: .01 },   // 17,5% = 14% hưu trí + 3% ốm đau thai sản + 0,5% TNLĐ-BNN
    kpcd: .02, capMul: 20, tnldBnn: .005
  },
  anTruaMienThue: 730000, anTruaMienThue2: 1200000,   // ăn giữa ca miễn thuế: trước và từ 01/07/2026
  nguongKhauTruVangLai2: 5000000, otMienToanBoTu: '2026-01-01', congQuaDaoTao: 0.07, bhTuNguyenTran: 1000000, bhTuNguyenTran2: 3000000,           // mức ăn giữa ca miễn thuế TNCN tối đa/tháng
  tndn: {
    thueSuatChung: .20, ts15: { tran: 3e9, v: .15 }, ts17: { tran: 50e9, v: .17 },
    tamNopTyLeToiThieu: .80, nguongTienMat: 5000000
  },
  gtgt: {
    nguongTienMat: 5000000,
    giam2: { from: '2025-07-01', to: '2026-12-31' }, // NQ 204/2025/QH15: giảm 2% (10% → 8%)
    mauTK: [{ from: '2021-01-01', ten: 'Thông tư 80/2021/TT-BTC' }, { from: '2026-07-01', ten: 'Thông tư 89/2026/TT-BTC' }]
  },
  monBai: { von10ty: 3000000, duoi10ty: 2000000, chiNhanh: 1000000 },
  ghiChu: 'Các tham số được tổng hợp từ văn bản hiện hành tại thời điểm xây dựng; kế toán cần đối chiếu và chỉnh tại đây khi quy định thay đổi.'
});
KT.at = (arr, date) => { let r = arr[0]; for (const x of arr) if (x.from <= date) r = x; return r; };

/* ---------- trạng thái ---------- */
KT.newState = () => ({
  v: 1,
  company: {
    name: 'CÔNG TY TNHH ABC', address: '', mst: '', nganh: '', dienThoai: '', email: '', coQuanThue: '', nganHang: '', tknh: '',
    giamDoc: '', ktt: '', nguoiLap: '', thuQuy: '', webSite: '',
    fyStart: '2026-01-01', vonDieuLe: 0, vung: 2, ngayDangKy: '',
    kyGTGT: 'thang', kyTNCN: 'thang', ppGTGT: 'khautru', phuongPhapGia: 'bqgq', hinhThuc: 'nkc',
    doanhThuNamTruoc: 0, nopThueTNDN: 'quy'
  },
  legal: KT.defaultLegal(),
  accounts: KT.defaultAccounts ? KT.defaultAccounts() : [],
  partners: [], items: [], orders: [], employees: [], assets: [], prepaids: [], payScale: [],
  opening: [],
  journal: [],
  vdoc: {},        // 'số CT|ngày' → { goc, luu, to, ghi } hồ sơ chứng từ gốc
  payroll: {},     // 'YYYY-MM' → { rows:{empCode:{...}}, std }
  lockedUntil: '',
  filings: {},     // lưu trạng thái đã nộp / ghi chú tờ khai
  seq: 1,
  meta: { created: new Date().toISOString(), demo: false }
});

KT.S = KT.newState();
KT.version = 0;
const listeners = [];
KT.on = fn => listeners.push(fn);
KT.touch = (silent) => { KT.version++; KT._cache = null; if (!silent) listeners.forEach(f => { try { f(); } catch (e) { console.error(e); } }); KT.scheduleSave(); };
KT.setState = s => { KT.S = s; KT.migrate(); KT.version++; KT._cache = null; listeners.forEach(f => f()); };
KT.migrate = () => {
  const S = KT.S, def = KT.newState();
  for (const k of Object.keys(def)) if (S[k] === undefined) S[k] = def[k];
  S.company = Object.assign({}, def.company, S.company);
  S.legal = Object.assign({}, def.legal, S.legal);
  if (!S.accounts.length && KT.defaultAccounts) S.accounts = KT.defaultAccounts();
  S.journal.forEach(l => { if (!l.id) l.id = KT.newId(); });
  (S.payScale || []).forEach(g => { if (g.b && g.min == null) { g.min = KT.num(g.b[0]); g.h = g.b.map(x => g.min ? Math.round(KT.num(x) / g.min * 100) / 100 : ''); } delete g.b; if (!g.h) g.h = [1, 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7]; });
};
/** mức lương một bậc của ngạch: mức bậc 1 × hệ số bậc */
KT.scaleAmt = (g, bac) => { const i = Math.round(+bac) - 1; if (!g || i < 0 || i > 7) return 0; const h = (g.h || [])[i]; return KT.rnd(KT.num(g.min) * (h === '' || h == null ? (i ? 0 : 1) : KT.num(h))); };
KT.applyScale = () => { const S = KT.S; (S.employees || []).forEach(e => { if (!e.ngach || !e.bac) return; const g = (S.payScale || []).find(x => x.code === e.ngach); const v = KT.scaleAmt(g, e.bac); if (v) e.luongCB = v; }); };
KT.newId = () => 'L' + (KT.S.seq++).toString(36) + Math.random().toString(36).slice(2, 5);

/* ---------- lưu trữ: IndexedDB → localStorage → bộ nhớ ---------- */
const KEY = 'ketoan-ps-v1';
let idb = null, saveTimer = null, saveState = { mode: 'memory', last: '' };
KT.saveInfo = () => saveState;
const openDB = () => new Promise((res, rej) => {
  try {
    const rq = indexedDB.open('ketoan-ps', 1);
    rq.onupgradeneeded = () => rq.result.createObjectStore('kv');
    rq.onsuccess = () => res(rq.result); rq.onerror = () => rej(rq.error);
  } catch (e) { rej(e); }
});
KT.initStore = async () => {
  try { idb = await openDB(); saveState.mode = 'indexeddb'; } catch (e) { idb = null; }
  let raw = null;
  if (idb) raw = await new Promise(r => { try { const rq = idb.transaction('kv').objectStore('kv').get(KEY); rq.onsuccess = () => r(rq.result); rq.onerror = () => r(null); } catch (e) { r(null); } });
  if (!raw) { try { raw = localStorage.getItem(KEY); if (raw) saveState.mode = saveState.mode === 'indexeddb' ? 'indexeddb' : 'localstorage'; } catch (e) { } }
  if (raw) { try { KT.S = JSON.parse(raw); KT.migrate(); return true; } catch (e) { console.error('Lỗi đọc dữ liệu', e); } }
  return false;
};
KT.saveNow = async () => {
  const raw = JSON.stringify(KT.S);
  if (idb) { try { await new Promise((res, rej) => { const tx = idb.transaction('kv', 'readwrite'); tx.objectStore('kv').put(raw, KEY); tx.oncomplete = res; tx.onerror = () => rej(tx.error); }); await KT.snapDaily(raw); saveState.last = new Date().toLocaleTimeString('vi-VN'); return; } catch (e) { } }
  try { localStorage.setItem(KEY, raw); saveState.mode = 'localstorage'; saveState.last = new Date().toLocaleTimeString('vi-VN'); } catch (e) { saveState.mode = 'memory'; }
};
/* bản chụp tự động mỗi ngày (giữ 7 ngày gần nhất) để cứu dữ liệu khi lỡ xóa/sửa nhầm */
KT.snapDaily = async raw => {
  if (!idb || KT.noSave) return; const day = new Date().toISOString().slice(0, 10); const key = 'snap:' + day;
  try {
    const keys = await new Promise(r => { const q = idb.transaction('kv').objectStore('kv').getAllKeys(); q.onsuccess = () => r(q.result); q.onerror = () => r([]); });
    const had = keys.includes(key); KT._snapN = (KT._snapN || 0) + 1; if (had && KT._snapN % 20) return;
    await new Promise(res => { const tx = idb.transaction('kv', 'readwrite'); const os = tx.objectStore('kv'); os.put(raw, key); const sn = [...new Set(keys.filter(k => String(k).startsWith('snap:')).concat(key))].sort(); sn.slice(0, -7).forEach(k => os.delete(k)); tx.oncomplete = res; tx.onerror = res; });
  } catch (e) { }
};
KT.snapList = async () => { if (!idb) return []; try { return await new Promise(r => { const q = idb.transaction('kv').objectStore('kv').getAllKeys(); q.onsuccess = () => r(q.result.filter(k => String(k).startsWith('snap:')).sort().reverse()); q.onerror = () => r([]); }); } catch (e) { return []; } };
KT.snapRestore = async key => { const raw = await new Promise(r => { const q = idb.transaction('kv').objectStore('kv').get(key); q.onsuccess = () => r(q.result); q.onerror = () => r(null); }); if (!raw) throw new Error('Không đọc được bản chụp'); KT.importJSON(raw); };
KT.scheduleSave = () => { if (KT.noSave) return; clearTimeout(saveTimer); saveTimer = setTimeout(() => KT.saveNow().then(() => KT.onSaved && KT.onSaved()), 600); };
KT.exportJSON = () => JSON.stringify(KT.S);
KT.importJSON = txt => { const s = JSON.parse(txt); if (!s || !s.journal) throw new Error('File không đúng định dạng sao lưu'); KT.setState(s); KT.scheduleSave(); };

/* ---------- hoàn tác (journal) ---------- */
const undoStack = [];
KT.snapshot = () => { undoStack.push(JSON.stringify({ journal: KT.S.journal, payroll: KT.S.payroll })); if (undoStack.length > 40) undoStack.shift(); };
KT.canUndo = () => undoStack.length > 0;
KT.undo = () => { const t = undoStack.pop(); if (!t) return false; const o = JSON.parse(t); KT.S.journal = o.journal; KT.S.payroll = o.payroll; KT.touch(); return true; };

})(typeof globalThis !== 'undefined' ? globalThis : window);
