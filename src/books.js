/* ===== SỔ SÁCH & BÁO CÁO TÀI CHÍNH ===== */
(function (G) {
'use strict';
const KT = G.KT, D = KT.d;
const R = KT.rep = {};

/** kỳ báo cáo: {k:'month'|'quarter'|'year'|'range', y, m, q, from, to} → {from,to,label} */
KT.period = p => {
  if (p.k === 'month') { const ym = p.y + '-' + String(p.m).padStart(2, '0'); return { from: D.bom(ym), to: D.eom(ym), label: 'Tháng ' + p.m + '/' + p.y }; }
  if (p.k === 'quarter') { const [a, b] = D.qRange(p.y, p.q); return { from: a, to: b, label: 'Quý ' + p.q + '/' + p.y }; }
  if (p.k === 'year') { const [a, b] = D.yRange(p.y); return { from: a, to: b, label: 'Năm ' + p.y }; }
  return { from: p.from, to: p.to, label: 'Từ ' + D.fmt(p.from) + ' đến ' + D.fmt(p.to) };
};
const L_ = () => KT.compute();
const accName = a => KT.acc.name(a) || '';

/* ---------- sổ cái / sổ chi tiết ---------- */
R.soCai = (tk, from, to, f) => {
  const L = L_(); f = f || {};
  const op = L.balBefore(tk, from, f);
  const rows = []; let bal = op, sn = 0, sc = 0;
  rows.push({ _cls: 'sub', dg: 'Số dư đầu kỳ', no: op > 0 ? op : '', co: op < 0 ? -op : '', bal: op, tk: '' });
  const arr = L.byAcc.get(String(tk)) || [];
  for (const e of arr) {
    const l = e.l; if (l.date < from || l.date > to) continue;
    if (f.dt != null && e.p !== f.dt) continue; if (f.vt != null && l.vt !== f.vt) continue; if (f.dh != null && l.dh !== f.dh) continue;
    const dn = e.s === 'N' ? l.amt : 0, dc = e.s === 'C' ? l.amt : 0; bal += dn - dc; sn += dn; sc += dc;
    rows.push({ date: l.date, ct: l.ct, ndate: l.date, hd: l.hd, dg: l.dg, tk: e.s === 'N' ? l.co : l.no, pt: e.p, vt: l.vt, sl: l.sl, no: dn, co: dc, bal, id: l.id });
  }
  rows.push({ _cls: 'tot', dg: 'Cộng phát sinh trong kỳ', no: sn, co: sc });
  rows.push({ _cls: 'tot', dg: 'Số dư cuối kỳ', no: bal > 0 ? bal : '', co: bal < 0 ? -bal : '', bal });
  return { form: 'S03b-DN', title: 'SỔ CÁI', sub: 'Tài khoản ' + tk + ' – ' + accName(tk) + (f.dt ? ' – đối tượng ' + f.dt : ''), period: { from, to }, tk, op, close: bal, sn, sc,
    cols: [{ k: 'date', t: 'Ngày GS', f: 'd', w: 86 }, { k: 'ct', t: 'Số CT', w: 90 }, { k: 'dg', t: 'Diễn giải', w: 300 }, { k: 'tk', t: 'TK đ.ứng', w: 64, a: 'c' }, { k: 'no', t: 'Phát sinh Nợ', f: 'n', a: 'r' }, { k: 'co', t: 'Phát sinh Có', f: 'n', a: 'r' }, { k: 'bal', t: 'Số dư (Nợ+/Có−)', f: 'n', a: 'r' }], rows };
};
R.soQuy = (tk, from, to) => {
  const r = R.soCai(tk, from, to);
  const L = L_(); const rows = []; let bal = r.op;
  rows.push({ _cls: 'sub', dg: 'Tồn đầu kỳ', ton: bal });
  let st = 0, sc = 0;
  for (const x of r.rows) if (x.id) { bal += x.no - x.co; st += x.no; sc += x.co; rows.push({ date: x.date, ct: x.ct, dg: x.dg, tk: x.tk, thu: x.no, chi: x.co, ton: bal, pt: x.pt }); }
  rows.push({ _cls: 'tot', dg: 'Cộng phát sinh', thu: st, chi: sc }); rows.push({ _cls: 'tot', dg: 'Tồn cuối kỳ', ton: bal });
  return { form: tk.startsWith('111') ? 'S07-DN' : 'S08-DN', title: tk.startsWith('111') ? 'SỔ QUỸ TIỀN MẶT' : 'SỔ TIỀN GỬI NGÂN HÀNG', sub: 'Tài khoản ' + tk + ' – ' + accName(tk), period: { from, to }, close: bal,
    cols: [{ k: 'date', t: 'Ngày', f: 'd', w: 86 }, { k: 'ct', t: 'Số CT', w: 90 }, { k: 'dg', t: 'Diễn giải', w: 300 }, { k: 'tk', t: 'TK đ.ứng', a: 'c' }, { k: 'thu', t: 'Thu (Nợ)', f: 'n', a: 'r' }, { k: 'chi', t: 'Chi (Có)', f: 'n', a: 'r' }, { k: 'ton', t: 'Tồn', f: 'n', a: 'r' }], rows };
};
R.nhatKy = (from, to) => {
  const L = L_(); const rows = []; let tn = 0;
  for (const l of L.lines) {
    if (l.date < from || l.date > to) continue;
    rows.push({ date: l.date, ct: l.ct, ndate: l.date, dg: l.dg, tk: l.no, no: l.amt, co: '' , id: l.id });
    rows.push({ _cls: 'ind', dg: '', tk: l.co, no: '', co: l.amt }); tn += l.amt;
  }
  rows.push({ _cls: 'tot', dg: 'Cộng phát sinh', no: tn, co: tn });
  return { form: 'S03a-DN', title: 'SỔ NHẬT KÝ CHUNG', sub: '', period: { from, to }, cols: [{ k: 'date', t: 'Ngày GS', f: 'd', w: 86 }, { k: 'ct', t: 'Số CT', w: 90 }, { k: 'dg', t: 'Diễn giải', w: 300 }, { k: 'tk', t: 'TK', a: 'c' }, { k: 'no', t: 'Số phát sinh Nợ', f: 'n', a: 'r' }, { k: 'co', t: 'Số phát sinh Có', f: 'n', a: 'r' }], rows };
};

/* ---------- bảng cân đối phát sinh ---------- */
R.cdps = (from, to) => {
  const L = L_(); const accs = KT.S.accounts.filter(a => a.code.length >= 3 && a.type !== 'P' || a.code === '911');
  const rows = []; const T = { on: 0, oc: 0, pn: 0, pc: 0, cn: 0, cc: 0 };
  for (const a of accs) {
    const op = L.balBefore(a.code, from), m = L.mov(a.code, from, to), cl = op + m.n - m.c;
    if (!op && !m.n && !m.c) continue;
    const row = { tk: a.code, name: a.name, on: op > 0 ? op : 0, oc: op < 0 ? -op : 0, pn: m.n, pc: m.c, cn: cl > 0 ? cl : 0, cc: cl < 0 ? -cl : 0, _cls: a.code.length === 3 ? 'grp' : 'ind' };
    rows.push(row);
    if (a.code.length === 3) for (const k of Object.keys(T)) T[k] += row[k];
  }
  rows.push(Object.assign({ _cls: 'tot', tk: '', name: 'TỔNG CỘNG' }, T));
  return { form: 'S06-DN', title: 'BẢNG CÂN ĐỐI SỐ PHÁT SINH', sub: '', period: { from, to }, ok: Math.abs(T.on - T.oc) < 1 && Math.abs(T.pn - T.pc) < 1 && Math.abs(T.cn - T.cc) < 1, T,
    cols: [{ k: 'tk', t: 'TK', w: 60 }, { k: 'name', t: 'Tên tài khoản', w: 280 }, { k: 'on', t: 'Dư đầu kỳ – Nợ', f: 'n', a: 'r' }, { k: 'oc', t: 'Dư đầu kỳ – Có', f: 'n', a: 'r' }, { k: 'pn', t: 'Phát sinh – Nợ', f: 'n', a: 'r' }, { k: 'pc', t: 'Phát sinh – Có', f: 'n', a: 'r' }, { k: 'cn', t: 'Dư cuối kỳ – Nợ', f: 'n', a: 'r' }, { k: 'cc', t: 'Dư cuối kỳ – Có', f: 'n', a: 'r' }], rows };
};

/* ---------- công nợ ---------- */
R.congNo = (tk, from, to) => {
  const L = L_(); const o = L.partnerBal(tk, D.addDays(from, -1)), c = L.partnerBal(tk, to);
  const mv = new Map(); for (const e of (L.byAcc.get(tk) || [])) { if (e.l.date < from || e.l.date > to) continue; const k = e.p || ''; const x = mv.get(k) || { n: 0, c: 0 }; if (e.s === 'N') x.n += e.l.amt; else x.c += e.l.amt; mv.set(k, x); }
  const keys = new Set([...o.keys(), ...c.keys(), ...mv.keys()]);
  const rows = []; const T = { on: 0, oc: 0, pn: 0, pc: 0, cn: 0, cc: 0 };
  for (const k of [...keys].sort()) {
    const ov = o.get(k) || 0, cv = c.get(k) || 0, m = mv.get(k) || { n: 0, c: 0 };
    if (!ov && !cv && !m.n && !m.c) continue;
    const pt = L.pm.get(k); const r = { pt: k || '(chưa có đối tượng)', name: pt ? pt.name : '', mst: pt ? pt.mst || '' : '', on: ov > 0 ? ov : 0, oc: ov < 0 ? -ov : 0, pn: m.n, pc: m.c, cn: cv > 0 ? cv : 0, cc: cv < 0 ? -cv : 0 };
    rows.push(r); for (const x of Object.keys(T)) T[x] += r[x];
  }
  rows.push(Object.assign({ _cls: 'tot', pt: '', name: 'TỔNG CỘNG' }, T));
  return { form: 'S31-DN', title: 'TỔNG HỢP CÔNG NỢ', sub: 'TK ' + tk + ' – ' + accName(tk), period: { from, to },
    cols: [{ k: 'pt', t: 'Mã', w: 80 }, { k: 'name', t: 'Tên đối tượng', w: 220 }, { k: 'mst', t: 'MST', w: 100 }, { k: 'on', t: 'Đầu kỳ Nợ', f: 'n', a: 'r' }, { k: 'oc', t: 'Đầu kỳ Có', f: 'n', a: 'r' }, { k: 'pn', t: 'PS Nợ', f: 'n', a: 'r' }, { k: 'pc', t: 'PS Có', f: 'n', a: 'r' }, { k: 'cn', t: 'Cuối kỳ Nợ', f: 'n', a: 'r' }, { k: 'cc', t: 'Cuối kỳ Có', f: 'n', a: 'r' }], rows };
};
/** tuổi nợ (FIFO) cho 131 (phải thu) / 331 (phải trả) */
R.aging = (tk, asof) => {
  const L = L_(); const recv = tk.startsWith('131') || tk.startsWith('136') || tk.startsWith('138') || tk.startsWith('141');
  const by = new Map(); const ob = L.partnerBal(tk, '0000-01-01');
  const get = k => { let x = by.get(k); if (!x) by.set(k, x = []); return x; };
  for (const o of L.openTbl(tk).n || L.openTbl(tk).c ? S_().opening.filter(x => String(x.tk).startsWith(tk)) : []) { const v = recv ? KT.num(o.no) - KT.num(o.co) : KT.num(o.co) - KT.num(o.no); if (v) get(o.dt || '').push({ d: '0000-00-00', v }); }
  for (const e of (L.byAcc.get(tk) || [])) {
    if (e.l.date > asof) break; const inc = recv ? e.s === 'N' : e.s === 'C'; const k = e.p || ''; const q = get(k);
    if (inc) q.push({ d: e.l.date, v: e.l.amt });
    else { let rest = e.l.amt; for (const it of q) { if (rest <= 0) break; const t = Math.min(it.v, rest); it.v -= t; rest -= t; } if (rest > 0) q.push({ d: e.l.date, v: -rest }); }
  }
  const B = [[0, 30], [31, 60], [61, 90], [91, 180], [181, 365], [366, 1e9]]; const rows = []; const T = [0, 0, 0, 0, 0, 0, 0];
  for (const [k, q] of [...by].sort()) {
    const b = [0, 0, 0, 0, 0, 0]; let tot = 0;
    for (const it of q) { if (Math.abs(it.v) < 0.5) continue; const age = it.d === '0000-00-00' ? 9999 : D.diff(it.d, asof); const i = B.findIndex(x => age >= x[0] && age <= x[1]); b[i < 0 ? 5 : i] += it.v; tot += it.v; }
    if (!tot) continue; const pt = L.pm.get(k); rows.push({ pt: k, name: pt ? pt.name : '', b0: b[0], b1: b[1], b2: b[2], b3: b[3], b4: b[4], b5: b[5], tot }); b.forEach((x, i) => T[i] += x); T[6] += tot;
  }
  rows.push({ _cls: 'tot', pt: '', name: 'TỔNG CỘNG', b0: T[0], b1: T[1], b2: T[2], b3: T[3], b4: T[4], b5: T[5], tot: T[6] });
  return { title: 'PHÂN TÍCH TUỔI NỢ', form: '', sub: 'TK ' + tk + ' tại ' + D.fmt(asof) + ' (thanh toán trừ vào khoản nợ cũ nhất)', cols: [{ k: 'pt', t: 'Mã' }, { k: 'name', t: 'Tên', w: 220 }, { k: 'b0', t: '0–30 ngày', f: 'n', a: 'r' }, { k: 'b1', t: '31–60', f: 'n', a: 'r' }, { k: 'b2', t: '61–90', f: 'n', a: 'r' }, { k: 'b3', t: '91–180', f: 'n', a: 'r' }, { k: 'b4', t: '181–365', f: 'n', a: 'r' }, { k: 'b5', t: '> 365 / đầu kỳ', f: 'n', a: 'r' }, { k: 'tot', t: 'Tổng', f: 'n', a: 'r' }], rows };
};
const S_ = () => KT.S;

/* ---------- kho ---------- */
R.nxt = (from, to) => {
  const L = L_(); const rows = []; const T = { oq: 0, ov: 0, iq: 0, iv: 0, xq: 0, xv: 0, cq: 0, cv: 0 };
  const codes = new Set([...L.stockEv.keys(), ...S_().opening.filter(o => o.vt).map(o => o.vt)]);
  for (const vt of [...codes].sort()) {
    const it = L.items.get(vt); let oq = L.openTbl('15', { vt }).q, ov = (x => x.n - x.c)(L.openTbl('15', { vt })), iq = 0, iv = 0, xq = 0, xv = 0;
    for (const ev of (L.stockEv.get(vt) || [])) { if (ev.l.date < from) { oq += ev.dq; ov += ev.dv; } else if (ev.l.date <= to) { if (ev.dq > 0) { iq += ev.dq; iv += ev.dv; } else { xq -= ev.dq; xv -= ev.dv; } } }
    const cq = oq + iq - xq, cv = ov + iv - xv; if (!oq && !ov && !iq && !iv && !xq && !xv && !cq && !cv) continue;
    rows.push({ vt, name: it ? it.name : '', unit: it ? it.unit : '', oq, ov, iq, iv, xq, xv, cq, cv, dg: cq ? cv / cq : 0 }); for (const k of Object.keys(T)) T[k] += { oq, ov, iq, iv, xq, xv, cq, cv }[k];
  }
  rows.push(Object.assign({ _cls: 'tot', vt: '', name: 'TỔNG CỘNG' }, T));
  return { form: 'S11-DN', title: 'BẢNG TỔNG HỢP NHẬP – XUẤT – TỒN', sub: '', period: { from, to }, T,
    cols: [{ k: 'vt', t: 'Mã', w: 70 }, { k: 'name', t: 'Tên vật tư, hàng hóa', w: 200 }, { k: 'unit', t: 'ĐVT', w: 50 }, { k: 'oq', t: 'Đầu kỳ SL', f: 'q', a: 'r' }, { k: 'ov', t: 'Đầu kỳ GT', f: 'n', a: 'r' }, { k: 'iq', t: 'Nhập SL', f: 'q', a: 'r' }, { k: 'iv', t: 'Nhập GT', f: 'n', a: 'r' }, { k: 'xq', t: 'Xuất SL', f: 'q', a: 'r' }, { k: 'xv', t: 'Xuất GT', f: 'n', a: 'r' }, { k: 'cq', t: 'Cuối kỳ SL', f: 'q', a: 'r' }, { k: 'cv', t: 'Cuối kỳ GT', f: 'n', a: 'r' }], rows };
};
R.theKho = (vt, from, to) => {
  const L = L_(); const it = L.items.get(vt); const ev = (L.stockEv.get(vt) || []).slice().sort((a, b) => a.l.date < b.l.date ? -1 : a.l.date > b.l.date ? 1 : a.l.n - b.l.n);
  let q = L.openTbl('15', { vt }).q, v = (x => x.n - x.c)(L.openTbl('15', { vt }));
  for (const e of ev) if (e.l.date < from) { q += e.dq; v += e.dv; }
  const rows = [{ _cls: 'sub', dg: 'Tồn đầu kỳ', tq: q, tv: v }];
  for (const e of ev) if (e.l.date >= from && e.l.date <= to) { q += e.dq; v += e.dv; rows.push({ date: e.l.date, ct: e.l.ct, dg: e.l.dg, nq: e.dq > 0 ? e.dq : '', nv: e.dq > 0 ? e.dv : '', xq: e.dq < 0 ? -e.dq : '', xv: e.dq < 0 ? -e.dv : '', tq: q, tv: v, dgia: e.l.sl ? e.l.amt / e.l.sl : 0 }); }
  rows.push({ _cls: 'tot', dg: 'Tồn cuối kỳ', tq: q, tv: v });
  return { form: 'S12-DN', title: 'THẺ KHO / SỔ CHI TIẾT VẬT LIỆU, HÀNG HÓA', sub: vt + ' – ' + (it ? it.name : '') + ' (' + (it ? it.unit : '') + ')', period: { from, to },
    cols: [{ k: 'date', t: 'Ngày', f: 'd' }, { k: 'ct', t: 'Số CT' }, { k: 'dg', t: 'Diễn giải', w: 240 }, { k: 'dgia', t: 'Đơn giá', f: 'n', a: 'r' }, { k: 'nq', t: 'Nhập SL', f: 'q', a: 'r' }, { k: 'nv', t: 'Nhập GT', f: 'n', a: 'r' }, { k: 'xq', t: 'Xuất SL', f: 'q', a: 'r' }, { k: 'xv', t: 'Xuất GT', f: 'n', a: 'r' }, { k: 'tq', t: 'Tồn SL', f: 'q', a: 'r' }, { k: 'tv', t: 'Tồn GT', f: 'n', a: 'r' }], rows };
};

/* ---------- đơn hàng / giá thành ---------- */
R.donHang = (from, to) => {
  const L = L_(); const rows = []; const T = { dt: 0, c621: 0, c622: 0, c627: 0, gv: 0, cpbh: 0, lg: 0 };
  const orders = new Set([...S_().orders.map(o => o.code), ...L.lines.filter(l => l.dh).map(l => l.dh)]);
  for (const dh of [...orders].sort()) {
    const g = (a, side) => { const m = L.mov(a, from, to, { dh, noClose: true }); return side === 'C' ? m.c - m.n : m.n - m.c; };
    const r = { dh, name: (L.om.get(dh) || {}).name || '', dt: g('511', 'C') - g('521'), c621: g('621'), c622: g('622'), c627: g('627'), gv: g('632'), cpbh: g('641') + g('642') };
    r.lg = r.dt - r.gv - r.cpbh; r.dd = L.bal('154', to, { dh });
    if (!r.dt && !r.c621 && !r.c622 && !r.c627 && !r.gv && !r.cpbh && !r.dd) continue; rows.push(r); for (const k of Object.keys(T)) T[k] += r[k];
  }
  rows.push(Object.assign({ _cls: 'tot', dh: '', name: 'TỔNG CỘNG' }, T));
  return { form: '', title: 'KẾT QUẢ THEO ĐƠN HÀNG / LỆNH SẢN XUẤT', sub: 'Doanh thu, chi phí trực tiếp, giá vốn, dở dang (TK 154)', period: { from, to },
    cols: [{ k: 'dh', t: 'Mã ĐH' }, { k: 'name', t: 'Tên', w: 200 }, { k: 'dt', t: 'Doanh thu thuần', f: 'n', a: 'r' }, { k: 'c621', t: 'NVL trực tiếp 621', f: 'n', a: 'r' }, { k: 'c622', t: 'Nhân công 622', f: 'n', a: 'r' }, { k: 'c627', t: 'SX chung 627', f: 'n', a: 'r' }, { k: 'gv', t: 'Giá vốn 632', f: 'n', a: 'r' }, { k: 'cpbh', t: 'CP BH+QLDN', f: 'n', a: 'r' }, { k: 'lg', t: 'Lãi (lỗ) ĐH', f: 'n', a: 'r' }, { k: 'dd', t: 'Dở dang 154 cuối kỳ', f: 'n', a: 'r' }], rows };
};

/* ================== BÁO CÁO TÀI CHÍNH ================== */
/** B01 — Báo cáo tình hình tài chính */
R.b01 = (date, prevDate) => {
  const L = L_(); const S = S_();
  const calc = d => {
    const v = {}; const b = (tk, f) => L.bal(tk, d, f);
    const pb = tk => L.partnerBal(tk, d);
    const posSum = (tk, sign) => { let s = 0; for (const x of pb(tk).values()) { const y = x * sign; if (y > 0) s += y; } return s; };
    v[111] = b('111') + b('112') + b('113'); v[112] = 0;
    v[121] = b('121'); v[122] = b('2291'); v[123] = b('128') - b('1283');
    v[131] = posSum('131', 1); v[132] = posSum('331', 1); v[133] = Math.max(0, b('136')); v[134] = Math.max(0, b('337'));
    v[135] = b('1283'); v[137] = b('2293'); v[139] = b('1381');
    const b141n = b('141'); v[136] = b('138') - b('1381') + (b141n > 0 ? b141n : 0) + b('244') + Math.max(0, b('334'));
    v[141] = b('151') + b('152') + b('153') + b('154') + b('155') + b('156') + b('157') + b('158') + (b141n < 0 ? 0 : 0); v[149] = b('2294');
    // chi phí chờ phân bổ ngắn/dài hạn
    const b242 = b('242'); let lt = 0;
    for (const p of S.prepaids) { const tot = KT.num(p.gia), n = Math.max(1, +p.thang || 1), start = D.ym(p.tu || d); const el = Math.max(0, Math.min(n, D.monthsBetween(start, D.ym(d)) + (p.tu && p.tu <= d ? 1 : 0))); const rem = n - el; if (rem > 12) lt += tot / n * (rem - 12); }
    lt = Math.max(0, Math.min(lt, b242)); v[261] = lt; v[151] = b242 - lt;
    v[152] = Math.max(0, b('133'));
    let t153 = 0; for (const a of ['3331', '3332', '3333', '3334', '3335', '3336', '3337', '3338', '3339']) { const x = b(a); if (x > 0) t153 += x; } v[153] = t153; v[154] = 0; v[155] = 0;
    v[211] = 0; v[212] = 0; v[213] = 0; v[214] = 0; v[215] = 0; v[216] = 0; v[219] = 0;
    v[222] = b('211'); v[223] = b('214') - b('2142') - b('2143') - b('2147'); v[225] = b('212'); v[226] = b('2142'); v[228] = b('213'); v[229] = b('2143'); v[231] = b('217'); v[232] = b('2147');
    v[241] = 0; v[242] = b('241'); v[251] = b('221'); v[252] = b('222'); v[253] = b('228'); v[254] = b('2292'); v[255] = 0;
    v[262] = b('243'); v[263] = 0; v[268] = b('215'); v[269] = 0;
    v[221] = v[222] + v[223]; v[224] = v[225] + v[226]; v[227] = v[228] + v[229]; v[220] = v[221] + v[224] + v[227];
    v[230] = v[231] + v[232]; v[240] = v[241] + v[242]; v[250] = v[251] + v[252] + v[253] + v[254] + v[255]; v[260] = v[261] + v[262] + v[263] + v[268] + v[269];
    v[210] = v[211] + v[212] + v[213] + v[214] + v[215] + v[216] + v[219];
    v[110] = v[111] + v[112]; v[120] = v[121] + v[122] + v[123]; v[130] = v[131] + v[132] + v[133] + v[134] + v[135] + v[136] + v[137] + v[139]; v[140] = v[141] + v[149]; v[150] = v[151] + v[152] + v[153] + v[154] + v[155];
    v[100] = v[110] + v[120] + v[130] + v[140] + v[150]; v[200] = v[210] + v[220] + v[230] + v[240] + v[250] + v[260]; v[270] = v[100] + v[200];
    // nguồn vốn
    v[311] = posSum('331', -1); v[312] = posSum('131', -1);
    let t313 = 0; for (const a of ['3331', '3332', '3333', '3334', '3335', '3336', '3337', '3338', '3339']) { const x = -b(a); if (x > 0) t313 += x; } v[313] = t313;
    v[314] = Math.max(0, -b('334')); v[315] = -b('335'); v[316] = -b('136') > 0 ? -b('136') : 0; v[317] = Math.max(0, -b('337')); v[318] = -b('3387');
    v[319] = -(b('338') - b('3387')) - b('332') - b('344'); v[320] = -(b('341') - b('34112')); v[321] = -b('352'); v[322] = -b('353'); v[323] = -b('357'); v[324] = 0;
    v[331] = 0; v[332] = 0; v[333] = 0; v[334] = 0; v[335] = 0; v[336] = 0; v[337] = 0; v[338] = -b('34112'); v[339] = -b('343'); v[340] = 0; v[341] = -b('347'); v[342] = 0; v[343] = -b('356');
    v[310] = [311, 312, 313, 314, 315, 316, 317, 318, 319, 320, 321, 322, 323, 324].reduce((s, k) => s + v[k], 0);
    v[330] = [331, 332, 333, 334, 335, 336, 337, 338, 339, 340, 341, 342, 343].reduce((s, k) => s + v[k], 0); v[300] = v[310] + v[330];
    v[411] = -(b('411') - b('4112') - b('4118')); v['411a'] = v[411]; v['411b'] = 0; v[412] = -b('4112'); v[413] = 0; v[414] = -b('4118'); v[415] = -b('419');
    v[416] = -b('412'); v[417] = -b('413'); v[418] = -b('414'); v[419] = 0; v[420] = -b('418');
    // LNST chưa phân phối: gồm cả kết quả kỳ chưa kết chuyển
    const unclosed = x => ['511', '515', '711', '521', '632', '635', '641', '642', '811', '821', '911'].reduce((s, a) => s + L.bal(a, x), 0);
    const fy = D.parse(S.company.fyStart) || (d.slice(0, 4) + '-01-01'); const fyStart = fy <= d ? (d.slice(0, 4) + fy.slice(4)) : fy; const y0 = D.addDays(d.slice(0, 4) + '-01-01', -1);
    const pre = D.addDays(fyStart > d ? D.addDays(fyStart, 0) : fyStart, -1);
    v[421] = -b('421') - unclosed(d);
    v['421a'] = -L.bal('421', pre) - unclosed(pre); v['421b'] = v[421] - v['421a']; v[422] = 0;
    v[410] = v[411] + v[412] + v[413] + v[414] + v[415] + v[416] + v[417] + v[418] + v[419] + v[420] + v[421] + v[422];
    v[431] = 0; v[432] = 0; v[430] = 0; v[400] = v[410] + v[430]; v[440] = v[300] + v[400];
    return v;
  };
  const cur = calc(date), prev = prevDate ? calc(prevDate) : null;
  const lay = [
    ['A. TÀI SẢN NGẮN HẠN', 100, 'h'], ['I. Tiền và các khoản tương đương tiền', 110, 's'], ['1. Tiền', 111], ['2. Các khoản tương đương tiền', 112],
    ['II. Đầu tư tài chính ngắn hạn', 120, 's'], ['1. Chứng khoán kinh doanh', 121], ['2. Dự phòng giảm giá chứng khoán kinh doanh (*)', 122], ['3. Đầu tư nắm giữ đến ngày đáo hạn', 123],
    ['III. Các khoản phải thu ngắn hạn', 130, 's'], ['1. Phải thu ngắn hạn của khách hàng', 131], ['2. Trả trước cho người bán ngắn hạn', 132], ['3. Phải thu nội bộ ngắn hạn', 133], ['4. Phải thu theo tiến độ kế hoạch hợp đồng xây dựng', 134], ['5. Phải thu về cho vay ngắn hạn', 135], ['6. Phải thu ngắn hạn khác', 136], ['7. Dự phòng phải thu ngắn hạn khó đòi (*)', 137], ['8. Tài sản thiếu chờ xử lý', 139],
    ['IV. Hàng tồn kho', 140, 's'], ['1. Hàng tồn kho', 141], ['2. Dự phòng giảm giá hàng tồn kho (*)', 149],
    ['V. Tài sản ngắn hạn khác', 150, 's'], ['1. Chi phí trả trước ngắn hạn', 151], ['2. Thuế GTGT được khấu trừ', 152], ['3. Thuế và các khoản khác phải thu Nhà nước', 153], ['4. Giao dịch mua bán lại trái phiếu Chính phủ', 154], ['5. Tài sản ngắn hạn khác', 155],
    ['B. TÀI SẢN DÀI HẠN', 200, 'h'], ['I. Các khoản phải thu dài hạn', 210, 's'],
    ['II. Tài sản cố định', 220, 's'], ['1. Tài sản cố định hữu hình', 221], ['- Nguyên giá', 222, 'i'], ['- Giá trị hao mòn lũy kế (*)', 223, 'i'], ['2. Tài sản cố định thuê tài chính', 224], ['- Nguyên giá', 225, 'i'], ['- Giá trị hao mòn lũy kế (*)', 226, 'i'], ['3. Tài sản cố định vô hình', 227], ['- Nguyên giá', 228, 'i'], ['- Giá trị hao mòn lũy kế (*)', 229, 'i'],
    ['III. Bất động sản đầu tư', 230, 's'], ['- Nguyên giá', 231, 'i'], ['- Giá trị hao mòn lũy kế (*)', 232, 'i'],
    ['IV. Tài sản dở dang dài hạn', 240, 's'], ['1. Chi phí sản xuất, kinh doanh dở dang dài hạn', 241], ['2. Chi phí xây dựng cơ bản dở dang', 242],
    ['V. Đầu tư tài chính dài hạn', 250, 's'], ['1. Đầu tư vào công ty con', 251], ['2. Đầu tư vào công ty liên doanh, liên kết', 252], ['3. Đầu tư góp vốn vào đơn vị khác', 253], ['4. Dự phòng đầu tư tài chính dài hạn (*)', 254], ['5. Đầu tư nắm giữ đến ngày đáo hạn', 255],
    ['VI. Tài sản dài hạn khác', 260, 's'], ['1. Chi phí trả trước dài hạn', 261], ['2. Tài sản thuế thu nhập hoãn lại', 262], ['3. Thiết bị, vật tư, phụ tùng thay thế dài hạn', 263], ['4. Tài sản dài hạn khác', 268], ['5. Lợi thế thương mại', 269],
    ['TỔNG CỘNG TÀI SẢN (270 = 100 + 200)', 270, 't'],
    ['C. NỢ PHẢI TRẢ', 300, 'h'], ['I. Nợ ngắn hạn', 310, 's'], ['1. Phải trả người bán ngắn hạn', 311], ['2. Người mua trả tiền trước ngắn hạn', 312], ['3. Thuế và các khoản phải nộp Nhà nước', 313], ['4. Phải trả người lao động', 314], ['5. Chi phí phải trả ngắn hạn', 315], ['6. Phải trả nội bộ ngắn hạn', 316], ['7. Phải trả theo tiến độ kế hoạch hợp đồng xây dựng', 317], ['8. Doanh thu chưa thực hiện ngắn hạn', 318], ['9. Phải trả ngắn hạn khác', 319], ['10. Vay và nợ thuê tài chính ngắn hạn', 320], ['11. Dự phòng phải trả ngắn hạn', 321], ['12. Quỹ khen thưởng, phúc lợi', 322], ['13. Quỹ bình ổn giá', 323], ['14. Giao dịch mua bán lại trái phiếu Chính phủ', 324],
    ['II. Nợ dài hạn', 330, 's'], ['1. Phải trả người bán dài hạn', 331], ['2. Người mua trả tiền trước dài hạn', 332], ['3. Chi phí phải trả dài hạn', 333], ['4. Phải trả nội bộ về vốn kinh doanh', 334], ['5. Phải trả nội bộ dài hạn', 335], ['6. Doanh thu chưa thực hiện dài hạn', 336], ['7. Phải trả dài hạn khác', 337], ['8. Vay và nợ thuê tài chính dài hạn', 338], ['9. Trái phiếu chuyển đổi', 339], ['10. Cổ phiếu ưu đãi', 340], ['11. Thuế thu nhập hoãn lại phải trả', 341], ['12. Dự phòng phải trả dài hạn', 342], ['13. Quỹ phát triển khoa học và công nghệ', 343],
    ['D. VỐN CHỦ SỞ HỮU', 400, 'h'], ['I. Vốn chủ sở hữu', 410, 's'], ['1. Vốn góp của chủ sở hữu', 411], ['- Cổ phiếu phổ thông có quyền biểu quyết', '411a', 'i'], ['- Cổ phiếu ưu đãi', '411b', 'i'], ['2. Thặng dư vốn cổ phần', 412], ['3. Quyền chọn chuyển đổi trái phiếu', 413], ['4. Vốn khác của chủ sở hữu', 414], ['5. Cổ phiếu quỹ (*)', 415], ['6. Chênh lệch đánh giá lại tài sản', 416], ['7. Chênh lệch tỷ giá hối đoái', 417], ['8. Quỹ đầu tư phát triển', 418], ['9. Quỹ hỗ trợ sắp xếp doanh nghiệp', 419], ['10. Quỹ khác thuộc vốn chủ sở hữu', 420], ['11. Lợi nhuận sau thuế chưa phân phối', 421], ['- LNST chưa phân phối lũy kế đến cuối kỳ trước', '421a', 'i'], ['- LNST chưa phân phối kỳ này', '421b', 'i'], ['12. Nguồn vốn đầu tư XDCB', 422],
    ['II. Nguồn kinh phí và quỹ khác', 430, 's'],
    ['TỔNG CỘNG NGUỒN VỐN (440 = 300 + 400)', 440, 't']
  ];
  const rows = lay.map(([t, ms, k]) => ({ t, ms, cur: cur[ms], prev: prev ? prev[ms] : null, _cls: k === 'h' ? 'grp' : k === 't' ? 'tot' : k === 's' ? 'sub' : k === 'i' ? 'ind' : '' }));
  return { form: 'B01-DN', title: 'BÁO CÁO TÌNH HÌNH TÀI CHÍNH', sub: 'Tại ngày ' + D.fmt(date), date, cur, prev, rows, diff: cur[270] - cur[440],
    cols: [{ k: 't', t: 'TÀI SẢN / NGUỒN VỐN', w: 380 }, { k: 'ms', t: 'Mã số', a: 'c', w: 60 }, { k: 'cur', t: 'Số cuối kỳ', f: 'p', a: 'r' }, { k: 'prev', t: 'Số đầu năm', f: 'p', a: 'r' }] };
};

/** B02 — Báo cáo kết quả hoạt động kinh doanh */
R.b02 = (from, to, pfrom, pto) => {
  const L = L_();
  const calc = (a, b) => {
    const m = (tk) => L.mov(tk, a, b, { noClose: true }); const cr = tk => { const x = m(tk); return x.c - x.n; }, dr = tk => { const x = m(tk); return x.n - x.c; };
    const v = {}; v[1] = cr('511'); v[2] = dr('521'); v[10] = v[1] - v[2]; v[11] = dr('632'); v[20] = v[10] - v[11]; v[21] = 0; v[22] = cr('515'); v[23] = dr('635'); v[24] = dr('6351');
    v[25] = dr('641'); v[26] = dr('642'); v[30] = v[20] + v[21] + v[22] - v[23] - v[25] - v[26]; v[31] = cr('711'); v[32] = dr('811'); v[40] = v[31] - v[32]; v[50] = v[30] + v[40];
    v[52] = dr('8212'); v[51] = dr('821') - v[52]; v[60] = v[50] - v[51] - v[52]; v[70] = 0; v[71] = 0; return v;
  };
  const cur = calc(from, to), prev = pfrom ? calc(pfrom, pto) : null;
  const lay = [['1. Doanh thu bán hàng và cung cấp dịch vụ', 1], ['2. Các khoản giảm trừ doanh thu', 2], ['3. Doanh thu thuần về bán hàng và cung cấp dịch vụ (10 = 01 - 02)', 10, 't'], ['4. Giá vốn hàng bán', 11], ['5. Lợi nhuận gộp về bán hàng và cung cấp dịch vụ (20 = 10 - 11)', 20, 't'], ['6. Lãi/lỗ của hoạt động bán, thanh lý bất động sản đầu tư', 21], ['7. Doanh thu hoạt động tài chính', 22], ['8. Chi phí tài chính', 23], ['- Trong đó: Chi phí đi vay', 24, 'i'], ['9. Chi phí bán hàng', 25], ['10. Chi phí quản lý doanh nghiệp', 26], ['11. Lợi nhuận thuần từ hoạt động kinh doanh {30 = 20 + 21 + 22 - (23 + 25 + 26)}', 30, 't'], ['12. Thu nhập khác', 31], ['13. Chi phí khác', 32], ['14. Lợi nhuận khác (40 = 31 - 32)', 40, 't'], ['15. Tổng lợi nhuận kế toán trước thuế (50 = 30 + 40)', 50, 't'], ['16. Chi phí thuế TNDN hiện hành', 51], ['17. Chi phí thuế TNDN hoãn lại', 52], ['18. Lợi nhuận sau thuế thu nhập doanh nghiệp (60 = 50 - 51 - 52)', 60, 't'], ['19. Lãi cơ bản trên cổ phiếu (*)', 70], ['20. Lãi suy giảm trên cổ phiếu (*)', 71]];
  const rows = lay.map(([t, ms, k]) => ({ t, ms, cur: cur[ms], prev: prev ? prev[ms] : null, _cls: k === 't' ? 'tot' : k === 'i' ? 'ind' : '' }));
  return { form: 'B02-DN', title: 'BÁO CÁO KẾT QUẢ HOẠT ĐỘNG KINH DOANH', sub: D.fmt(from) + ' – ' + D.fmt(to), cur, prev, rows, period: { from, to },
    cols: [{ k: 't', t: 'CHỈ TIÊU', w: 420 }, { k: 'ms', t: 'Mã số', a: 'c', w: 60 }, { k: 'cur', t: 'Kỳ này', f: 'p', a: 'r' }, { k: 'prev', t: 'Kỳ trước / cùng kỳ', f: 'p', a: 'r' }] };
};

/** B03 — Báo cáo lưu chuyển tiền tệ (trực tiếp) */
R.b03 = (from, to, pfrom, pto) => {
  const L = L_(); const isCash = a => /^(111|112|113)/.test(a);
  const calc = (a, b) => {
    const byCode = {}; const det = [];
    for (const l of L.lines) {
      if (l.date < a || l.date > b) continue; const cn = isCash(l.no), cc = isCash(l.co); if (cn === cc) continue;
      const dir = cn ? 1 : -1, counter = cn ? l.co : l.no; const code = l.lc || KT.lcttAuto(counter, dir);
      byCode[code] = (byCode[code] || 0) + dir * l.amt; det.push({ l, code, v: dir * l.amt, auto: !l.lc });
    }
    const v = {}; for (const x of KT.LCTT) v[x.ms] = byCode[x.code] || 0;
    const known = new Set(KT.LCTT.map(x => x.code)); let unk = 0; for (const k in byCode) if (!known.has(k)) { v[7] += byCode[k]; unk++; }
    v[20] = v[1] + v[2] + v[3] + v[4] + v[5] + v[6] + v[7]; v[30] = v[21] + v[22] + v[23] + v[24] + v[25] + v[26] + v[27]; v[40] = v[31] + v[32] + v[33] + v[34] + v[35] + v[36]; v[50] = v[20] + v[30] + v[40];
    v[60] = L.balBefore('111', a) + L.balBefore('112', a) + L.balBefore('113', a); v[61] = 0; v[70] = v[50] + v[60] + v[61]; v.chk = L.bal('111', b) + L.bal('112', b) + L.bal('113', b);
    v.det = det; return v;
  };
  const cur = calc(from, to), prev = pfrom ? calc(pfrom, pto) : null;
  const nm = ms => (KT.LCTT.find(x => x.ms === ms) || {}).name;
  const lay = [['I. Lưu chuyển tiền từ hoạt động kinh doanh', null, 'grp'], ...[1, 2, 3, 4, 5, 6, 7].map(m => [(m) + '. ' + nm(m), m]), ['Lưu chuyển tiền thuần từ hoạt động kinh doanh', 20, 'tot'],
    ['II. Lưu chuyển tiền từ hoạt động đầu tư', null, 'grp'], ...[21, 22, 23, 24, 25, 26, 27].map((m, i) => [(i + 1) + '. ' + nm(m), m]), ['Lưu chuyển tiền thuần từ hoạt động đầu tư', 30, 'tot'],
    ['III. Lưu chuyển tiền từ hoạt động tài chính', null, 'grp'], ...[31, 32, 33, 34, 35, 36].map((m, i) => [(i + 1) + '. ' + nm(m), m]), ['Lưu chuyển tiền thuần từ hoạt động tài chính', 40, 'tot'],
    ['Lưu chuyển tiền thuần trong kỳ (50 = 20 + 30 + 40)', 50, 'tot'], ['Tiền và tương đương tiền đầu kỳ', 60], ['Ảnh hưởng của thay đổi tỷ giá hối đoái quy đổi ngoại tệ', 61], ['Tiền và tương đương tiền cuối kỳ (70 = 50 + 60 + 61)', 70, 'tot']];
  const rows = lay.map(([t, ms, k]) => ({ t, ms: ms == null ? '' : ms, cur: ms == null ? '' : cur[ms], prev: ms == null || !prev ? null : prev[ms], _cls: k || '' }));
  return { form: 'B03-DN', title: 'BÁO CÁO LƯU CHUYỂN TIỀN TỆ', sub: '(Theo phương pháp trực tiếp) ' + D.fmt(from) + ' – ' + D.fmt(to), cur, prev, rows, det: cur.det, diff: cur[70] - cur.chk, period: { from, to },
    cols: [{ k: 't', t: 'CHỈ TIÊU', w: 420 }, { k: 'ms', t: 'Mã số', a: 'c', w: 60 }, { k: 'cur', t: 'Kỳ này', f: 'p', a: 'r' }, { k: 'prev', t: 'Kỳ trước', f: 'p', a: 'r' }] };
};

/** B09 — Thuyết minh (các bảng số liệu chính; phần chữ do kế toán bổ sung) */
R.b09 = (from, to) => {
  const L = L_(); const S = S_(); const to_ = to; const T = [];
  const bal = (tk) => L.bal(tk, to_), op = tk => L.balBefore(tk, from);
  T.push({ title: 'V.01 Tiền và các khoản tương đương tiền', head: ['Chỉ tiêu', 'Cuối kỳ', 'Đầu kỳ'], rows: [['Tiền mặt', bal('111'), op('111')], ['Tiền gửi không kỳ hạn', bal('112'), op('112')], ['Tiền đang chuyển', bal('113'), op('113')]] });
  const top = (tk, sign) => { const m = L.partnerBal(tk, to_); return [...m].filter(([, v]) => v * sign > 0).sort((a, b) => Math.abs(b[1]) - Math.abs(a[1])).slice(0, 8).map(([k, v]) => [(L.pm.get(k) ? L.pm.get(k).name : k) || '(chưa có đối tượng)', Math.abs(v)]); };
  T.push({ title: 'V.03 Phải thu ngắn hạn của khách hàng (đối tượng lớn nhất)', head: ['Khách hàng', 'Số cuối kỳ'], rows: top('131', 1) });
  T.push({ title: 'V.17 Phải trả người bán (đối tượng lớn nhất)', head: ['Nhà cung cấp', 'Số cuối kỳ'], rows: top('331', -1) });
  T.push({ title: 'V.04 Hàng tồn kho', head: ['Chỉ tiêu', 'Cuối kỳ', 'Đầu kỳ'], rows: [['Hàng mua đang đi đường (151)', bal('151'), op('151')], ['Nguyên liệu, vật liệu (152)', bal('152'), op('152')], ['Công cụ, dụng cụ (153)', bal('153'), op('153')], ['Chi phí SXKD dở dang (154)', bal('154'), op('154')], ['Thành phẩm (155)', bal('155'), op('155')], ['Hàng hóa (156)', bal('156'), op('156')], ['Hàng gửi đi bán (157)', bal('157'), op('157')], ['Dự phòng giảm giá (2294)', bal('2294'), op('2294')]] });
  const mv = (tk, f) => { const m = L.mov(tk, from, to_); return f === 'n' ? m.n : m.c; };
  T.push({ title: 'V.08 Tăng, giảm TSCĐ (hữu hình + vô hình)', head: ['Chỉ tiêu', 'Nguyên giá', 'Hao mòn lũy kế'], rows: [['Số dư đầu kỳ', op('211') + op('213'), -op('214')], ['Tăng trong kỳ', mv('211', 'n') + mv('213', 'n'), mv('214', 'c')], ['Giảm trong kỳ', mv('211', 'c') + mv('213', 'c'), mv('214', 'n')], ['Số dư cuối kỳ', bal('211') + bal('213'), -bal('214')], ['Giá trị còn lại cuối kỳ', bal('211') + bal('213') + bal('214'), '']] });
  T.push({ title: 'V.18 Thuế và các khoản phải nộp Nhà nước', head: ['Sắc thuế', 'Phải nộp đầu kỳ', 'Phát sinh phải nộp', 'Đã nộp', 'Phải nộp cuối kỳ'], rows: ['3331', '3332', '3333', '3334', '3335', '3336', '3337', '3338', '3339'].map(a => { const m = L.mov(a, from, to_, { noClose: true }); return [a + ' ' + accName(a), -op(a), m.c, m.n, -bal(a)]; }).filter(r => r.slice(1).some(x => x)) });
  T.push({ title: 'V.22 Vốn chủ sở hữu – biến động', head: ['Chỉ tiêu', 'Vốn góp', 'LNST chưa phân phối', 'Cộng'], rows: [['Số dư đầu kỳ', -op('411'), -op('421'), -op('411') - op('421')], ['Tăng/(giảm) trong kỳ', mv('411', 'c') - mv('411', 'n'), mv('421', 'c') - mv('421', 'n') + L.pnl(from, to_), mv('411', 'c') - mv('411', 'n') + mv('421', 'c') - mv('421', 'n') + L.pnl(from, to_)]] });
  T.push({ title: 'Thông tin chung (I) – điền từ hồ sơ doanh nghiệp', head: ['Nội dung', 'Giá trị'], rows: [['Tên doanh nghiệp', S.company.name], ['Mã số thuế', S.company.mst], ['Địa chỉ', S.company.address], ['Năm tài chính bắt đầu', D.fmt(S.company.fyStart)], ['Chế độ kế toán áp dụng', 'Thông tư 99/2025/TT-BTC (hiệu lực từ 01/01/2026)'], ['Hình thức sổ', 'Nhật ký chung – ghi sổ bằng phần mềm'], ['Phương pháp tính giá xuất kho', 'Bình quân gia quyền cả tháng'], ['Phương pháp tính thuế GTGT', 'Khấu trừ'], ['Phương pháp khấu hao TSCĐ', 'Đường thẳng']] });
  return { form: 'B09-DN', title: 'BẢN THUYẾT MINH BÁO CÁO TÀI CHÍNH (số liệu tự động)', sub: D.fmt(from) + ' – ' + D.fmt(to), tables: T };
};

/** Chỉ tiêu tài chính nhanh */
R.ratios = (from, to) => {
  const b1 = R.b01(to), b2 = R.b02(from, to), c = b1.cur, p = b2.cur; const safe = (a, b) => b ? a / b : null;
  return [['Thanh toán hiện hành (TS ngắn hạn / Nợ ngắn hạn)', safe(c[100], c[310])], ['Thanh toán nhanh ((TS ngắn hạn − HTK) / Nợ ngắn hạn)', safe(c[100] - c[140], c[310])], ['Nợ phải trả / Vốn chủ sở hữu', safe(c[300], c[400])], ['Biên lợi nhuận gộp', safe(p[20], p[10])], ['Biên lợi nhuận sau thuế', safe(p[60], p[10])], ['ROE (LNST / VCSH)', safe(p[60], c[400])]];
};

})(typeof globalThis !== 'undefined' ? globalThis : window);
