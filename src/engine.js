/* ===== ENGINE: chuẩn hóa PS → định giá kho (BQGQ tháng) → chỉ mục sổ cái → kiểm soát lỗi ===== */
(function (G) {
'use strict';
const KT = G.KT, D = KT.d;

const grpOf = a => { const r = String(a || '').slice(0, 3); return (r === '152' || r === '153' || r === '156' || r === '158') ? 'A' : (r === '155' || r === '157') ? 'B' : ''; };
KT.invGroup = grpOf;
KT.extraChecks = [];

function pFlag(a) { return !!a && KT.acc.flag(a, 'p'); }

/** chuẩn hóa một dòng PS */
function norm(j, oi) {
  const S = KT.S;
  const no = String(j.no == null ? '' : j.no).trim(), co = String(j.co == null ? '' : j.co).trim();
  const l = {
    oi, id: j.id, ct: String(j.ct || '').trim(), vk: KT.vkey(j.ct), date: D.parse(j.ng) || '', no, co,
    st: KT.num(j.st), dg: j.dg || '', hd: j.hd == null ? '' : String(j.hd).trim(), kh: j.kh || '', nhd: D.parse(j.nhd) || '',
    vt: j.vt == null ? '' : String(j.vt).trim(), sl: KT.num(j.sl), gia: KT.num(j.gia), dh: j.dh ? String(j.dh).trim() : '',
    thue: j.thue == null ? '' : String(j.thue), gt: KT.num(j.gt), lc: j.lc || '', tn: j.tn || '', kt: j.kt || '',
    nth: j.nth || '', dvth: j.dvth || '', tag: j.tag || '', ts: j.ts || '', src: j, dn: '', dc: '', pt: '', amt: 0, auto: false, derived: false
  };
  const dt = j.dt ? String(j.dt).trim() : '', dt2 = j.dt2 ? String(j.dt2).trim() : '';
  const pn = pFlag(no), pc = pFlag(co);
  if (j.dn || j.dc) { l.dn = j.dn || ''; l.dc = j.dc || ''; }
  else if (pn && pc) { l.dn = dt; l.dc = dt2 || dt; }
  else if (pn) l.dn = dt; else if (pc) l.dc = dt;
  l.pt = dt || l.dn || l.dc || '';
  l.close = no.startsWith('911') || co.startsWith('911');
  l.validAcc = KT.acc.has(no) && KT.acc.has(co);
  return l;
}

KT.compute = function () {
  const S = KT.S;
  if (KT._cache && KT._cache.ver === KT.version) return KT._cache;
  const t0 = Date.now();
  const issues = [];
  const add = (sev, code, msg, l, extra) => issues.push(Object.assign({ sev, code, msg, ct: l ? l.ct : '', id: l ? l.id : '', date: l ? l.date : '' }, extra || {}));

  /* 1. chuẩn hóa + sắp xếp */
  const all = S.journal.map(norm);
  const dated = [], undated = [];
  all.forEach(l => (l.date && l.no && l.co && l.no !== l.co ? dated : undated).push(l));
  dated.sort((a, b) => a.date < b.date ? -1 : a.date > b.date ? 1 : a.oi - b.oi);
  dated.forEach((l, i) => l.n = i + 1);

  /* 2. định giá kho */
  const pool = new Map();            // vt → {q,v}
  const lastCost = new Map();
  const itemMap = new Map(S.items.map(x => [x.code, x]));
  for (const o of S.opening) if (o.vt) { const p = pool.get(o.vt) || { q: 0, v: 0 }; p.q += KT.num(o.sl); p.v += KT.num(o.no) - KT.num(o.co); pool.set(o.vt, p); if (p.q > 0) lastCost.set(o.vt, p.v / p.q); }
  const stockEv = new Map();         // vt → [{date, dq, dv, l}] cho thẻ kho
  const months = [];
  { let cur = null; for (const l of dated) { const ym = D.ym(l.date); if (!cur || cur.ym !== ym) { cur = { ym, ls: [] }; months.push(cur); } cur.ls.push(l); } }
  const bal154 = new Map();
  /* phương pháp tính giá xuất kho: bqgq (bình quân cả tháng) | bqdd (bình quân sau mỗi lần nhập) | fifo | dd (đích danh: nhập đơn giá ở dòng xuất) */
  const method = (S.company && S.company.phuongPhapGia) || 'bqgq'; KT.costMethod = method;
  const layers = new Map();
  if (method === 'fifo') for (const o of S.opening) if (o.vt && KT.num(o.sl) > 0) { const a = layers.get(o.vt) || []; a.push({ q: KT.num(o.sl), v: KT.num(o.no) - KT.num(o.co) }); layers.set(o.vt, a); }
  const alt = (m, isIn, isOut) => {
    const run = new Map(); const R = vt => { let r = run.get(vt); if (!r) { const p = getP(vt); r = { q: p.q, v: p.v }; run.set(vt, r); } return r; };
    for (const l of m.ls) {
      const io = isOut(l), ii = isIn(l);
      if (io && !l.manual) {
        const vt = l.vt; let amt = 0;
        if (method === 'bqdd') { const r = R(vt); const u = r.q > 1e-9 ? r.v / r.q : (lastCost.get(vt) || 0); amt = KT.rnd(l.sl * u); }
        else if (method === 'fifo') {
          const q = layers.get(vt) || []; let need = l.sl, v = 0;
          while (need > 1e-9 && q.length) { const y = q[0]; const t = Math.min(need, y.q); const part = y.q > 0 ? y.v * t / y.q : 0; y.q -= t; y.v -= part; v += part; need -= t; if (y.q <= 1e-9) q.shift(); }
          if (need > 1e-9) v += need * (lastCost.get(vt) || 0); amt = KT.rnd(v);
        } else if (method === 'dd') amt = l.gia ? KT.rnd(l.sl * l.gia) : 0;
        l.amt = amt; l.auto = method !== 'dd';
      }
      if (grpOf(l.no) === 'B' && !l.amt && l.co.startsWith('154')) { const b = bal154.get(l.dh || '') || 0; if (b > 0) { l.amt = KT.rnd(b); l.derived = true; } }
      if (l.no.startsWith('154')) bal154.set(l.dh || '', (bal154.get(l.dh || '') || 0) + l.amt);
      if (l.co.startsWith('154')) bal154.set(l.dh || '', (bal154.get(l.dh || '') || 0) - l.amt);
      if (io && !ii) { const r = R(l.vt); r.q -= l.sl; r.v -= l.amt; }
      if (ii && !io) { const r = R(l.vt); r.q += l.sl; r.v += l.amt; if (method === 'fifo' && l.amt) { const q = layers.get(l.vt) || []; q.push({ q: l.sl, v: l.amt }); layers.set(l.vt, q); } }
    }
  };
  const getP = vt => { let p = pool.get(vt); if (!p) { p = { q: 0, v: 0 }; pool.set(vt, p); } return p; };
  for (const m of months) {
    const ins = new Map();           // vt → {q,v} nhập trong tháng
    const addIn = (vt, q, v) => { const x = ins.get(vt) || { q: 0, v: 0 }; x.q += q; x.v += v; ins.set(vt, x); };
    const isIn = l => grpOf(l.no) && l.vt && l.sl > 0;
    const isOut = l => grpOf(l.co) && l.vt && l.sl > 0;
    // số tiền nhập tường minh
    for (const l of m.ls) {
      const manual = l.st || (l.sl && l.gia && !isOut(l) ? KT.rnd(l.sl * l.gia) : 0);
      l.amt = l.st ? l.st : (isOut(l) ? 0 : manual);
      l.manual = !!l.st;
    }
    if (method !== 'bqgq') alt(m, isIn, isOut); else {
    const unit = (vt, extra) => {
      const p = getP(vt), e = ins.get(vt) || { q: 0, v: 0 };
      const q = p.q + e.q, v = p.v + e.v;
      if (q > 1e-9) return v / q;
      return lastCost.get(vt) || 0;
    };
    for (const l of m.ls) if (isIn(l) && !isOut(l) && l.amt && grpOf(l.no) === 'A') addIn(l.vt, l.sl, l.amt);
    for (const l of m.ls) if (isIn(l) && !isOut(l) && l.amt && grpOf(l.no) === 'B') addIn(l.vt, l.sl, l.amt);
    // pass 1 theo thời gian
    for (const l of m.ls) {
      // xuất nhóm A
      if (isOut(l) && grpOf(l.co) === 'A' && !l.manual) { l.amt = KT.rnd(l.sl * unit(l.vt)); l.auto = true; }
      // nhập thành phẩm giá trị trống ← số dư 154 theo đơn hàng
      if (grpOf(l.no) === 'B' && !l.amt && l.co.startsWith('154')) {
        const b = bal154.get(l.dh || '') || 0; if (b > 0) { l.amt = KT.rnd(b); l.derived = true; if (l.vt && l.sl > 0) addIn(l.vt, l.sl, l.amt); }
      }
      // theo dõi 154
      if (l.no.startsWith('154')) bal154.set(l.dh || '', (bal154.get(l.dh || '') || 0) + l.amt);
      if (l.co.startsWith('154')) bal154.set(l.dh || '', (bal154.get(l.dh || '') || 0) - l.amt);
    }
    // pass 2: xuất nhóm B
    for (const l of m.ls) if (isOut(l) && grpOf(l.co) === 'B' && !l.manual) { l.amt = KT.rnd(l.sl * unit(l.vt)); l.auto = true; }
    }
    // cập nhật kho cuối tháng + làm tròn phần dư
    const lastAuto = new Map();
    for (const l of m.ls) {
      if (isOut(l) && !isIn(l)) { const p = getP(l.vt); p.q -= l.sl; p.v -= l.amt; if (l.auto) lastAuto.set(l.vt, l); stockEv.has(l.vt) || stockEv.set(l.vt, []); stockEv.get(l.vt).push({ l, dq: -l.sl, dv: -l.amt }); }
      if (isIn(l) && !isOut(l)) { const p = getP(l.vt); p.q += l.sl; p.v += l.amt; stockEv.has(l.vt) || stockEv.set(l.vt, []); stockEv.get(l.vt).push({ l, dq: l.sl, dv: l.amt }); }
    }
    for (const [vt, l] of lastAuto) { const p = getP(vt); if (Math.abs(p.q) < 1e-9 && p.v !== 0 && Math.abs(p.v) <= 50) { l.amt += p.v; p.v = 0; const ev = stockEv.get(vt); for (let k = ev.length - 1; k >= 0; k--) if (ev[k].l === l) { ev[k].dv = -l.amt; break; } } }
    for (const [vt, p] of pool) if (p.q > 1e-9) lastCost.set(vt, p.v / p.q);
  }
  // dòng ngoài tháng-định-giá (không có vt) giữ amt = st
  for (const l of dated) if (!l.vt || !l.sl) { if (!l.amt) l.amt = l.st; }

  /* 3. chỉ mục theo tài khoản (mọi tiền tố ≥ 3 ký tự) */
  const byAcc = new Map();
  const push = (a, e) => { for (let n = 3; n <= a.length; n++) { const k = a.slice(0, n); let arr = byAcc.get(k); if (!arr) byAcc.set(k, arr = []); arr.push(e); } };
  for (const l of dated) {
    push(l.no, { l, s: 'N', p: l.dn, a: l.no });
    push(l.co, { l, s: 'C', p: l.dc, a: l.co });
  }
  const openAcc = S.opening;

  const L = {
    ver: KT.version, lines: dated, all, undated, byAcc, pool, stockEv, months, issues, items: itemMap,
    first: dated.length ? dated[0].date : '', last: dated.length ? dated[dated.length - 1].date : ''
  };
  const lower = (arr, d) => { let lo = 0, hi = arr.length; while (lo < hi) { const mid = (lo + hi) >> 1; if (arr[mid].l.date < d) lo = mid + 1; else hi = mid; } return lo; };
  const upper = (arr, d) => { let lo = 0, hi = arr.length; while (lo < hi) { const mid = (lo + hi) >> 1; if (arr[mid].l.date <= d) lo = mid + 1; else hi = mid; } return lo; };

  /** Tổng phát sinh Nợ/Có của TK (tiền tố) trong [from,to].  f: {dt, vt, dh, noClose, only:'N'|'C', counter} */
  L.mov = (tk, from, to, f) => {
    f = f || {}; const arr = byAcc.get(String(tk)); let n = 0, c = 0;
    if (!arr) return { n, c };
    const i0 = from ? lower(arr, from) : 0, i1 = to ? upper(arr, to) : arr.length;
    for (let i = i0; i < i1; i++) {
      const e = arr[i], l = e.l;
      if (f.noClose && l.close) continue;
      if (f.dt != null && e.p !== f.dt) continue;
      if (f.vt != null && l.vt !== f.vt) continue;
      if (f.dh != null && l.dh !== f.dh) continue;
      if (f.counter && !(e.s === 'N' ? l.co : l.no).startsWith(f.counter)) continue;
      if (f.notCounter && (e.s === 'N' ? l.co : l.no).startsWith(f.notCounter)) continue;
      if (f.tag && !l.tag.startsWith(f.tag)) continue;
      if (f.only && f.only !== e.s) continue;
      if (e.s === 'N') n += l.amt; else c += l.amt;
    }
    return { n, c };
  };
  /** Số dư đầu kỳ nhập tay của TK (tiền tố) */
  L.openTbl = (tk, f) => {
    f = f || {}; let n = 0, c = 0, q = 0;
    for (const o of openAcc) {
      if (!String(o.tk).startsWith(String(tk))) continue;
      if (f.dt != null && (o.dt || '') !== f.dt) continue;
      if (f.vt != null && (o.vt || '') !== f.vt) continue;
      if (f.dh != null && (o.dh || '') !== f.dh) continue;
      n += KT.num(o.no); c += KT.num(o.co); q += KT.num(o.sl);
    }
    return { n, c, q };
  };
  /** Số dư thuần (Nợ − Có) trước ngày `date` (không gồm ngày đó) */
  L.balBefore = (tk, date, f) => {
    const o = L.openTbl(tk, f); const m = L.mov(tk, '', date ? D.addDays(date, -1) : '', f);
    return o.n - o.c + m.n - m.c;
  };
  /** Số dư thuần (Nợ − Có) cuối ngày `date` */
  L.bal = (tk, date, f) => { const o = L.openTbl(tk, f); const m = L.mov(tk, '', date, f); return o.n - o.c + m.n - m.c; };
  /** Số dư theo từng đối tượng cuối ngày: Map code → net (Nợ − Có) */
  L.partnerBal = (tk, date, f) => {
    const mp = new Map(); const arr = byAcc.get(String(tk)) || [];
    for (const o of openAcc) if (String(o.tk).startsWith(String(tk)) && (!f || f.noPartnerless !== false)) { const k = o.dt || ''; mp.set(k, (mp.get(k) || 0) + KT.num(o.no) - KT.num(o.co)); }
    const i1 = date ? upper(arr, date) : arr.length;
    for (let i = 0; i < i1; i++) { const e = arr[i]; const k = e.p || ''; mp.set(k, (mp.get(k) || 0) + (e.s === 'N' ? e.l.amt : -e.l.amt)); }
    return mp;
  };
  /** Lãi/lỗ thực hiện trong kỳ (từ các TK 5xx–8xx, loại trừ bút toán kết chuyển 911) */
  L.pnl = (from, to) => {
    const v = a => { const m = L.mov(a, from, to, { noClose: true }); return m.c - m.n; };   // dư Có dương
    const rev = v('511') + v('515') + v('711'), exp = -(v('521') + v('632') + v('635') + v('641') + v('642') + v('811') + v('821'));
    return rev - exp;
  };
  L.stockQty = (vt, date) => { let q = 0; const p = L.openTbl('15', { vt }); q += p.q; for (const ev of (stockEv.get(vt) || [])) if (ev.l.date <= date) q += ev.dq; return q; };

  /* 4. vouchers */
  const vmap = new Map();
  for (const l of all) {
    const k = l.vk + '|' + l.date; let v = vmap.get(k);
    if (!v) vmap.set(k, v = { key: l.vk, date: l.date, lines: [], total: 0, type: KT.vtype(l.ct) });
    v.lines.push(l); v.total += l.amt || l.st;
  }
  L.vouchers = [...vmap.values()];
  L.voucherOf = l => vmap.get(l.vk + '|' + l.date);

  /* 5. kiểm soát */
  const pm = new Map(S.partners.concat(S.employees.map(e => ({ code: e.code, name: e.name, type: 'NV' }))).map(x => [x.code, x])), om = new Map(S.orders.map(x => [x.code, x]));
  L.pm = pm; L.om = om;
  const lockedUntil = S.lockedUntil || '';
  const noPartnerAcc = a => KT.acc.flag(a, 'p');
  const seenCt = new Map();
  for (const l of all) {
    if (!l.date) { add('err', 'E04', 'Ngày chứng từ trống hoặc sai định dạng', l); continue; }
    if (!l.no || !l.co) { add('err', 'E01', 'Thiếu TK Nợ hoặc TK Có', l); continue; }
    if (l.no === l.co) { add('err', 'E02', 'TK Nợ trùng TK Có (' + l.no + ')', l); continue; }
    if (!l.validAcc) add('err', 'E01', 'TK ' + (!KT.acc.has(l.no) ? l.no : l.co) + ' không có trong hệ thống tài khoản', l);
    if (!l.amt && !(l.st)) add('err', 'E03', l.sl && grpOf(l.co) ? 'Không xác định được giá trị xuất kho (tồn kho bằng 0 hoặc chưa có giá nhập)' : l.sl && grpOf(l.no) && l.co.startsWith('154') ? 'Nhập thành phẩm nhưng chưa có chi phí dở dang (154) theo đơn hàng ' + (l.dh || '(trống)') : 'Thiếu số tiền', l);
    if (l.amt < 0) add('info', 'I01', 'Số tiền âm (bút toán ghi đỏ)', l);
    if (lockedUntil && l.date <= lockedUntil && l.src.mod && l.src.mod > lockedUntil) add('err', 'E05', 'Chứng từ thuộc kỳ đã khóa sổ (' + D.fmt(lockedUntil) + ') bị thêm/sửa', l);
    // đối tượng
    for (const [side, a, p] of [['Nợ', l.no, l.dn], ['Có', l.co, l.dc]]) {
      if (noPartnerAcc(a) && !a.startsWith('3335')) {
        if (!p && !(a.startsWith('338') && !a.startsWith('3388')) ) { if (/^(131|331|141|334|341|411|136|138|3388|244|344|332)/.test(a)) add('warn', 'W09', 'TK ' + a + ' (' + side + ') cần mã đối tượng để lên sổ chi tiết', l); }
        else if (p && !pm.has(p)) add('err', 'E10', 'Mã đối tượng "' + p + '" chưa có trong danh mục', l);
      }
    }
    if (l.vt && !itemMap.has(l.vt) && (grpOf(l.no) || grpOf(l.co))) add('err', 'E10', 'Mã hàng "' + l.vt + '" chưa có trong danh mục vật tư, hàng hóa', l);
    if ((grpOf(l.no) || grpOf(l.co)) && !l.vt && !l.sl ) add('warn', 'W10', 'Bút toán kho (' + (grpOf(l.no) ? l.no : l.co) + ') thiếu mã hàng / số lượng', l);
    if (l.dh && !om.has(l.dh)) add('warn', 'W12', 'Mã đơn hàng "' + l.dh + '" chưa có trong danh mục', l);
    if (l.vt && l.sl && l.vt && itemMap.has(l.vt)) { const it = itemMap.get(l.vt); const a = grpOf(l.no) ? l.no : l.co; if (it.tk && a && !a.startsWith(it.tk) && !(it.tk === '156' && a.startsWith('157')) && !(it.tk === '155' && a.startsWith('157')) && grpOf(a)) add('warn', 'W11', 'Mã hàng ' + l.vt + ' thuộc TK ' + it.tk + ' nhưng bút toán dùng TK ' + a, l); }
  }
  // trùng số chứng từ khác ngày
  const ctDates = new Map();
  for (const l of dated) { const s = ctDates.get(l.vk) || new Set(); s.add(l.date); ctDates.set(l.vk, s); }
  for (const [k, s] of ctDates) if (s.size > 1 && k) issues.push({ sev: 'warn', code: 'W15', msg: 'Số chứng từ "' + k + '" xuất hiện ở ' + s.size + ' ngày khác nhau (' + [...s].slice(0, 3).map(D.fmt).join(', ') + '…) – nên đánh số duy nhất', ct: k, id: '', date: [...s][0] });

  // tiền mặt âm theo ngày / TGNH âm
  const cashCheck = (tk, sev, label) => {
    const arr = byAcc.get(tk) || []; if (!arr.length) return;
    let bal = L.openTbl(tk).n - L.openTbl(tk).c, i = 0, firstBad = null, cnt = 0;
    while (i < arr.length) {
      const d = arr[i].l.date; let inn = 0, out = 0, j = i;
      for (; j < arr.length && arr[j].l.date === d; j++) { if (arr[j].s === 'N') inn += arr[j].l.amt; else out += arr[j].l.amt; }
      bal += inn - out;
      if (bal < -0.5) { cnt++; if (!firstBad) firstBad = { d, bal }; }
      i = j;
    }
    if (firstBad) issues.push({ sev, code: sev === 'err' ? 'E06' : 'W07', msg: label + ' âm ' + KT.f(-firstBad.bal) + ' đ vào ngày ' + D.fmt(firstBad.d) + (cnt > 1 ? ' (và ' + (cnt - 1) + ' ngày khác)' : '') + ' – kiểm tra thứ tự/ngày chứng từ hoặc thiếu phiếu thu', ct: '', id: '', date: firstBad.d });
  };
  cashCheck('111', 'err', 'Quỹ tiền mặt'); cashCheck('112', 'warn', 'Tiền gửi ngân hàng');
  // tồn kho âm
  for (const [vt, evs] of stockEv) {
    const sorted = evs.slice().sort((a, b) => a.l.date < b.l.date ? -1 : a.l.date > b.l.date ? 1 : (b.dq > 0) - (a.dq > 0));
    let q = L.openTbl('15', { vt }).q; let bad = null;
    for (const e of sorted) { q += e.dq; if (q < -1e-6 && !bad) bad = { d: e.l.date, q, l: e.l }; }
    if (bad) issues.push({ sev: 'err', code: 'E08', msg: 'Tồn kho "' + vt + '" âm (' + KT.fq(bad.q) + ') vào ngày ' + D.fmt(bad.d) + ' – xuất vượt tồn hoặc nhập thiếu', ct: bad.l.ct, id: bad.l.id, date: bad.d });
  }
  // số dư bất thường theo tính chất tài khoản (cuối kỳ dữ liệu)
  if (L.last) {
    const chk = (tk, kind, msg) => { const v = L.bal(tk, L.last); if ((kind === 'A' && v < -0.5) || (kind === 'L' && v > 0.5)) issues.push({ sev: 'warn', code: 'W16', msg, ct: '', id: '', date: L.last }); };
    chk('133', 'A', 'TK 133 có số dư Có – kiểm tra ghi nhận thuế GTGT đầu vào'); chk('1331', 'A', 'TK 1331 có số dư Có');
    chk('141', 'A', 'TK 141 (tạm ứng) có số dư Có'); chk('152', 'A', 'TK 152 có số dư Có (âm kho)'); chk('155', 'A', 'TK 155 có số dư Có (âm kho)'); chk('156', 'A', 'TK 156 có số dư Có (âm kho)');
    for (const tk of ['621','622','627']) { const v = L.bal(tk, L.last); if (Math.abs(v) > 0.5) issues.push({ sev: 'warn', code: 'W22', msg: 'TK ' + tk + ' còn số dư ' + KT.f(v) + ' sau kết chuyển – số tiền kết chuyển sang 154 chưa khớp với phát sinh (kiểm tra bút toán kết chuyển, nhất là khi đổi phương pháp tính giá)', ct: '', id: '', date: L.last }); }
    chk('211', 'A', 'TK 211 có số dư Có'); chk('214', 'L', 'TK 214 (hao mòn) có số dư Nợ');
  }
  KT.extraChecks.forEach(f => { try { f(L, add); } catch (e) { console.error('check', e); } });
  const rank = { err: 0, warn: 1, info: 2 };
  issues.sort((a, b) => rank[a.sev] - rank[b.sev] || (a.date < b.date ? -1 : 1));
  L.issueBy = new Map(); for (const is of issues) if (is.id) { const a = L.issueBy.get(is.id) || []; a.push(is); L.issueBy.set(is.id, a); }
  L.ms = Date.now() - t0;
  KT._cache = L;
  return L;
};
KT.L = () => KT.compute();

})(typeof globalThis !== 'undefined' ? globalThis : window);
