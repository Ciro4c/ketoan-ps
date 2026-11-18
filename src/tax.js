/* ===== THUẾ: GTGT (01/GTGT), TNDN (tạm nộp quý + quyết toán 03/TNDN), môn bài, lịch nghĩa vụ ===== */
(function (G) {
'use strict';
const KT = G.KT, D = KT.d;
const T = KT.tax = {};
const L_ = () => KT.compute();
const isRev = a => /^(5|711)/.test(a);
const RATES = { '10': .10, '8': .08, '5': .05, '0': 0 };
const nearestRate = (tax, base) => { if (!base || !tax) return null; const r = tax / base; let best = null, d = 1; for (const k of ['10', '8', '5', '0']) { const e = Math.abs(r - RATES[k]); if (e < d) { d = e; best = k; } } return d < .012 ? best : null; };

/* ---------- kỳ khai ---------- */
T.periods = (kind, from, to) => {   // danh sách kỳ liên tiếp phủ [from,to]
  const out = []; let cur = from;
  while (cur <= to) {
    const ym = D.ym(cur); let a, b, label, key;
    if (kind === 'quy') { const y = D.year(cur), q = D.quarter(ym); [a, b] = D.qRange(y, q); label = 'Quý ' + q + '/' + y; key = y + '-Q' + q; }
    else { a = D.bom(ym); b = D.eom(ym); label = 'Tháng ' + ym.slice(5) + '/' + ym.slice(0, 4); key = ym; }
    out.push({ from: a, to: b, label, key }); cur = D.addDays(b, 1);
  }
  return out;
};
T.deadline = (kind, per, type) => {      // hạn nộp hồ sơ khai thuế theo kỳ
  if (kind === 'quy') { const m = D.addMonths(D.ym(per.to), 1); return D.nextWorkday(D.eom(m)); }
  return D.nextWorkday(D.addDays(per.to, 20));
};

/* ---------- GTGT ---------- */
function vatLines(L, from, to) {
  const out = [], inn = [], zero = [], flags = [];
  const th = KT.S.legal.gtgt.nguongTienMat;
  // tiền mặt theo chứng từ
  const cashBy = new Map();
  for (const l of L.lines) if (l.co.startsWith('111') && l.date >= from && l.date <= to) cashBy.set(l.vk + '|' + l.date, (cashBy.get(l.vk + '|' + l.date) || 0) + l.amt);
  for (const l of L.lines) {
    if (l.date < from || l.date > to) continue;
    const isOutL = l.co.startsWith('3331') && !l.no.startsWith('133');
    const isOutR = l.no.startsWith('3331') && /^(131|511|521|338|331|5)/.test(l.co) && !l.co.startsWith('133');
    if (isOutL || isOutR) { out.push({ l, tax: isOutL ? l.amt : -l.amt }); continue; }
    const isInL = l.no.startsWith('133') && !l.co.startsWith('3331');
    const isInR = l.co.startsWith('133') && !l.no.startsWith('3331');
    if (isInL || isInR) { inn.push({ l, tax: isInL ? l.amt : -l.amt }); continue; }
    if ((l.thue === 'KCT' || l.thue === '0' || l.thue === 'KKK') && (isRev(l.co) || l.no.startsWith('521'))) zero.push({ l, base: isRev(l.co) ? l.amt : -l.amt, code: l.thue });
  }
  const enrich = (r, kind) => {
    const l = r.l, p = L.pm.get(l.pt) || {};
    let rate = RATES[l.thue] !== undefined ? l.thue : null;
    let base = l.gt || 0; if (!rate) rate = nearestRate(Math.abs(r.tax), Math.abs(base)) || null;
    if (!rate) rate = '10';
    if (!base && RATES[rate] > 0) base = KT.rnd(Math.abs(r.tax) / RATES[rate]);
    if (r.tax < 0) base = -Math.abs(base);
    Object.assign(r, { rate, base, hd: l.hd, kh: l.kh, date: l.nhd || l.date, pt: l.pt, name: p.name || '', mst: p.mst || '', ct: l.ct });
    if (kind === 'in') {
      const gross = Math.abs(r.base) + Math.abs(r.tax); const cash = cashBy.get(l.vk + '|' + l.date) || 0;
      r.cashFlag = cash > 0 && gross >= th && r.tax > 0 && cash >= th;
      r.eligible = true; r.reason = '';
      if (l.kt === 'N') { r.eligible = false; r.reason = 'Đánh dấu không khấu trừ'; }
      else if (!l.hd && l.kt !== 'Y') { r.eligible = false; r.reason = 'Thiếu số hóa đơn'; }
      else if (r.cashFlag && l.kt !== 'Y') { r.eligible = false; r.reason = 'Hóa đơn ≥ ' + KT.f(th) + ' thanh toán tiền mặt'; }
    }
    return r;
  };
  out.forEach(r => enrich(r, 'out')); inn.forEach(r => enrich(r, 'in'));
  return { out, inn, zero };
}
function vatCalc(L, per, carry, adj) {
  const { out, inn, zero } = vatLines(L, per.from, per.to); const v = {};
  const sum = (arr, f) => arr.reduce((s, x) => s + f(x), 0);
  v[23] = sum(inn, r => r.base); v[24] = sum(inn, r => r.tax); v[25] = sum(inn.filter(r => r.eligible), r => r.tax);
  v[26] = sum(zero.filter(z => z.code === 'KCT'), z => z.base); v[29] = sum(zero.filter(z => z.code === '0'), z => z.base); v['32a'] = sum(zero.filter(z => z.code === 'KKK'), z => z.base);
  const byRate = r => out.filter(x => x.rate === r);
  v[30] = sum(byRate('5'), x => x.base); v[31] = sum(byRate('5'), x => x.tax);
  const o10 = out.filter(x => x.rate === '10' || x.rate === '8');
  v[32] = sum(o10, x => x.base); v[33] = sum(o10, x => x.tax);
  v[29] += sum(byRate('0'), x => x.base);
  v[27] = v[29] + v[30] + v[32] + v['32a']; v[28] = v[31] + v[33]; v[34] = v[26] + v[27]; v[35] = v[28];
  v[22] = carry; v[36] = v[35] - v[25]; v[37] = adj.a37 || 0; v[38] = adj.a38 || 0; v[39] = adj.a39 || 0;
  const k = v[36] - v[22] + v[37] - v[38] - v[39];
  v['40a'] = Math.max(0, k); v['40b'] = adj.a40b || 0; v[40] = Math.max(0, v['40a'] - v['40b']); v[41] = k < 0 ? -k : 0; v[42] = Math.min(adj.a42 || 0, v[41]); v[43] = v[41] - v[42];
  v.giam2 = sum(out.filter(x => x.rate === '8'), x => x.base) * 0.02;
  v.none = !out.length && !inn.length && !zero.length;
  return { v, out, inn, zero };
}
/** Chuỗi kỳ GTGT từ kỳ đầu có dữ liệu tới kỳ chứa `to` — để chuyển [43] → [22] */
T.vatSeries = (to) => {
  const L = L_(); if (!L.first) return []; const kind = KT.S.company.kyGTGT;
  const first = L.first; const pers = T.periods(kind, first, to);
  let carry = Math.max(0, L.balBefore('133', pers[0].from) - Math.max(0, 0));    // số dư 133 chuyển vào kỳ đầu
  const res = [];
  for (const per of pers) {
    const adj = (KT.S.filings['gtgt:' + per.key] || {}); const r = vatCalc(L, per, adj.c22 != null && adj.c22 !== '' ? KT.num(adj.c22) : carry, adj);
    res.push(Object.assign({ per }, r)); carry = r.v[43];
  }
  return res;
};
T.vat = (periodKey) => { const L = L_(); const s = T.vatSeries(L.last || D.today()); return s.find(x => x.per.key === periodKey) || null; };
T.vatReconcile = (r) => {
  const L = L_(), to = r.per.to, from = r.per.from;
  const gl3331 = -L.bal('3331', to), gl133 = L.bal('133', to), paid = L.mov('3331', from, D.addDays(to, 28), { counter: '11' }).n;
  return { gl3331, gl133, paid, vatOut: L.mov('3331', from, to, { only: 'C', notCounter: '133' }).c, vatIn: L.mov('133', from, to, { only: 'N' }).n };
};

/* ---------- TNDN ---------- */
KT.TN_CATS = [
  { c: 'KHL', n: 'Chi phí không có hóa đơn, chứng từ hợp pháp', up: 1 }, { c: 'PHAT', n: 'Phạt vi phạm hành chính, tiền chậm nộp', up: 1 },
  { c: 'KPV', n: 'Chi không phục vụ hoạt động sản xuất, kinh doanh', up: 1 }, { c: 'KHVUOT', n: 'Khấu hao TSCĐ vượt mức khống chế (xe > 1,6 tỷ…)', up: 1 },
  { c: 'LAIVUOT', n: 'Lãi vay vượt mức khống chế / không đúng mục đích', up: 1 }, { c: 'PLVUOT', n: 'Chi phúc lợi, thưởng không theo quy chế / vượt mức', up: 1 },
  { c: 'TIENMAT', n: 'Chi từ 5 triệu không thanh toán không dùng tiền mặt', up: 1 }, { c: 'LUONG', n: 'Chi lương, thưởng không có trong HĐLĐ/quy chế', up: 1 },
  { c: 'KHAC', n: 'Khoản điều chỉnh tăng khác', up: 1 },
  { c: 'TNGIAM', n: 'Thu nhập được miễn thuế (cổ tức, lãi…)', up: 0 }, { c: 'OK', n: 'Đã kiểm tra – được trừ (bỏ cảnh báo tiền mặt)', up: 0, ok: 1 }
];
const EXP = a => /^(621|622|623|627|632|635|641|642|811)/.test(a);
T.pretax = (from, to) => { const L = L_(); const m = a => L.mov(a, from, to, { noClose: true }); const cr = a => { const x = m(a); return x.c - x.n; }, dr = a => { const x = m(a); return x.n - x.c; };
  const rev = cr('511') - dr('521') + cr('515') + cr('711'), exp = dr('632') + dr('635') + dr('641') + dr('642') + dr('811'); return { rev, exp, lnt: rev - exp, doanhThu: cr('511') - dr('521') + cr('515') + cr('711') }; };
T.rateTNDN = (year) => {
  const lg = KT.S.legal.tndn; if (year < 2025) return { r: .20, why: 'Thuế suất phổ thông 20%' };
  const L = L_(); let prev = 0, have = false;
  const a = D.iso(year - 1, 1, 1), b = D.iso(year - 1, 12, 31);
  if (L.first && L.first <= b) { prev = T.pretax(a, b).doanhThu; have = true; }
  if (!have || !prev) prev = KT.num(KT.S.company.doanhThuNamTruoc);
  const r = prev <= lg.ts15.tran ? lg.ts15.v : prev <= lg.ts17.tran ? lg.ts17.v : lg.thueSuatChung;
  return { r, prev, why: 'Doanh thu năm ' + (year - 1) + ' = ' + KT.f(prev) + ' đ → ' + (r * 100) + '%' };
};
T.cashFlags = (from, to, Lx) => {   // chi từ 5 triệu bằng tiền mặt (mua hàng hóa, dịch vụ) — cảnh báo loại khỏi chi phí được trừ
  const L = Lx || L_(); const th = KT.S.legal.tndn.nguongTienMat; const res = [];
  const by = new Map();
  for (const l of L.lines) { if (l.date < from || l.date > to) continue; const k = l.vk + '|' + l.date; const x = by.get(k) || { cash: 0, ex: [], hd: '' }; if (l.co.startsWith('111') && !/^(334|333|338|141|3335|3383|3384|3386)/.test(l.no)) x.cash += l.amt; if (EXP(l.no) && l.tn !== 'OK') x.ex.push(l); by.set(k, x); }
  for (const [k, x] of by) if (x.cash >= th && x.ex.length) res.push({ vk: k.split('|')[0], date: k.split('|')[1], cash: x.cash, amt: x.ex.filter(l => !l.tn).reduce((s, l) => s + l.amt, 0), lines: x.ex });
  return res.filter(r => r.amt > 0);
};
T.cit = (year) => {
  const L = L_(), S = KT.S, f = S.filings['tndn:' + year] || {};
  const [y0, y1] = D.yRange(year); const rate = T.rateTNDN(year);
  const pt = T.pretax(y0, y1), A1 = pt.lnt;
  // điều chỉnh tăng từ dòng PS gắn nhãn
  const adj = {}; let B4 = 0, tnMien = 0;
  for (const l of L.lines) {
    if (l.date < y0 || l.date > y1 || !l.tn) continue; const cat = KT.TN_CATS.find(c => c.c === l.tn); if (!cat || cat.ok) continue;
    if (cat.c === 'TNGIAM') { if (isRev(l.co)) tnMien += l.amt; continue; }
    if (EXP(l.no)) { adj[l.tn] = (adj[l.tn] || 0) + l.amt; B4 += l.amt; }
  }
  const cash = T.cashFlags(y0, y1); const cashAmt = cash.reduce((s, r) => s + r.amt, 0); if (cashAmt) { adj.TIENMAT = (adj.TIENMAT || 0) + cashAmt; B4 += cashAmt; }
  const v = {}; v.A1 = A1;
  v.B2 = KT.num(f.B2); v.B3 = KT.num(f.B3); v.B4 = B4; v.B5 = KT.num(f.B5); v.B6 = KT.num(f.B6); v.B7 = KT.num(f.B7); v.B1 = v.B2 + v.B3 + v.B4 + v.B5 + v.B6 + v.B7;
  v.B9 = KT.num(f.B9); v.B10 = KT.num(f.B10); v.B11 = KT.num(f.B11); v.B8 = v.B9 + v.B10 + v.B11;
  v.B12 = v.A1 + v.B1 - v.B8; v.B14 = KT.num(f.B14); v.B13 = v.B12 - v.B14;
  v.C1 = v.B13; v.C2 = tnMien + KT.num(f.C2);
  // lỗ chuyển (tối đa 5 năm)
  const losses = (f.loss || []).filter(x => year - x.y >= 1 && year - x.y <= 5).map(x => ({ y: x.y, amt: KT.num(x.amt), used: 0 }));
  let room = Math.max(0, v.C1 - v.C2); const used = []; for (const x of losses.sort((a, b) => a.y - b.y)) { const u = Math.min(room, x.amt); x.used = u; room -= u; if (u) used.push(x); }
  v.C3a = used.reduce((s, x) => s + x.used, 0); v.C3b = 0; v.C3 = v.C3a + v.C3b;
  v.C4 = Math.max(0, v.C1 - v.C2 - v.C3);
  v.C5 = Math.min(KT.num(f.C5), v.C4 * 0.2); v.C6 = v.C4 - v.C5;
  v.rate = rate.r; v.C8 = KT.rnd(v.C6 * rate.r); v.C9 = KT.num(f.C9); v.C11 = KT.num(f.C11);
  v.C12 = Math.max(0, v.C8 - v.C9 - v.C11);
  v.loss = v.C1 - v.C2 < 0 ? -(v.C1 - v.C2) : 0;
  // đã nộp
  const paid = L.mov('3334', y0, D.addDays(y1, 90), { counter: '11' }).n - L.mov('3334', y0, D.addDays(y1, 90), { counter: '11', only: 'C' }).c;
  const paidInYear = L.mov('3334', y0, y1, { counter: '11' }).n;
  v.G = paidInYear; v.G1 = KT.num(f.G1); v.H = v.C12 - v.G - v.G1;
  v.expense = L.mov('8211', y0, y1, { noClose: true }).n + L.mov('821', y0, y1, { noClose: true, counter: '3334' }).n;
  // tạm tính từng quý (lũy kế)
  const q = [];
  for (let i = 1; i <= 4; i++) {
    const [a, b] = D.qRange(year, i); const pt2 = T.pretax(y0, b);
    let inc = 0; for (const l of L.lines) if (l.date >= y0 && l.date <= b && l.tn && EXP(l.no)) { const c = KT.TN_CATS.find(x => x.c === l.tn); if (c && c.up && !c.ok) inc += l.amt; }
    const cf = T.cashFlags(y0, b).reduce((s, r) => s + r.amt, 0); inc += cf;
    const base = Math.max(0, pt2.lnt + inc - (i === 4 ? v.C2 + v.C3a : 0)); const cum = KT.rnd(base * rate.r);
    const paidQ = L.mov('3334', a, b, { counter: '11' }).n; const paidCum = L.mov('3334', y0, b, { counter: '11' }).n;
    q.push({ q: i, from: a, to: b, lnt: pt2.lnt, adjUp: inc, taxable: base, cum, paidQ, paidCum, deadline: D.nextWorkday(D.eom(D.addMonths(D.ym(b), 1)).slice(0, 8) + '30'), due: Math.max(0, cum - (q[i - 2] ? q[i - 2].cum : 0)) });
  }
  const total4 = q.reduce((s, x) => s + x.paidQ, 0);
  v.pct80 = v.C12 > 0 ? total4 / v.C12 : null; v.under80 = v.C12 > 0 && total4 < v.C12 * S.legal.tndn.tamNopTyLeToiThieu;
  return { year, v, rate, adj, cash, q, losses, filing: f };
};

/* ---------- môn bài ---------- */
T.monBai = (year) => {
  const S = KT.S, lg = S.legal.monBai; const von = KT.num(S.company.vonDieuLe);
  const muc = von > 10e9 ? lg.von10ty : lg.duoi10ty; const reg = S.company.ngayDangKy;
  const mien = reg && D.year(reg) === year; const L = L_();
  const paid = L.mov('3338', D.iso(year, 1, 1), D.iso(year, 12, 31), { counter: '11' }).n || L.mov('6425', D.iso(year, 1, 1), D.iso(year, 12, 31)).n;
  return { year, muc: mien ? 0 : muc, mienNamDau: !!mien, hanNop: D.iso(year, 1, 30), paid, von };
};

/* ---------- lịch nghĩa vụ ---------- */
T.calendar = (fromY, toY) => {
  const S = KT.S, L = L_(); const items = []; const today = D.today();
  const paidIn = (acc, from, to) => L.mov(acc, from, to, { counter: '11', only: 'N' }).n;
  const addI = (o) => {
    o.done = !!S.filings['done:' + o.key]; o.paid = o.amount > 0 ? o.paidAmt >= o.amount * 0.95 : null;
    if (o.done && (o.amount <= 0 || o.paid || o.noPay)) o.state = 'done';
    else if (o.done) o.state = 'unpaid';
    else if (o.paid && o.noFile) o.state = 'done';
    else o.state = o.deadline < today ? 'late' : D.diff(today, o.deadline) <= 10 ? 'soon' : 'open';
    items.push(o);
  };
  for (let y = fromY; y <= toY; y++) {
    for (const per of T.periods(S.company.kyGTGT, D.iso(y, 1, 1), D.iso(y, 12, 31))) {
      const r = T.vatSeries(per.to).find(x => x.per.key === per.key); const dl = T.deadline(S.company.kyGTGT, per);
      addI({ key: 'gtgt:' + per.key, type: 'GTGT', name: 'Tờ khai 01/GTGT – ' + per.label, deadline: dl, amount: r ? r.v[40] : 0, paidAmt: paidIn('3331', D.addDays(per.to, 1), D.addDays(dl, 7)), nav: 'gtgt:' + per.key, note: r ? (r.v[40] > 0 ? 'Phải nộp' : r.v[43] > 0 ? 'Còn được khấu trừ chuyển kỳ sau ' + KT.f(r.v[43]) : 'Không phát sinh nộp') : '' });
    }
    for (const per of T.periods(S.company.kyTNCN, D.iso(y, 1, 1), D.iso(y, 12, 31))) {
      const tn = KT.hr ? KT.hr.pitPeriod(per.from, per.to) : { withheld: 0 }; const dl = T.deadline(S.company.kyTNCN, per);
      addI({ key: 'tncn:' + per.key, type: 'TNCN', name: 'Tờ khai 05/KK-TNCN – ' + per.label, deadline: dl, amount: tn.withheld, paidAmt: paidIn('3335', D.addDays(per.to, 1), D.addDays(dl, 7)), nav: 'tncn:' + per.key, note: 'Thuế TNCN đã khấu trừ' });
    }
    for (let m = 1; m <= 12; m++) { const ym = y + '-' + String(m).padStart(2, '0'); const bh = KT.hr ? KT.hr.bhMonth(ym) : null; if (bh && bh.total) { const dl = D.nextWorkday(D.eom(ym)); addI({ key: 'bhxh:' + ym, type: 'BHXH', name: 'Nộp BHXH, BHYT, BHTN – tháng ' + m + '/' + y, deadline: dl, amount: bh.total, paidAmt: paidIn('3383', D.bom(ym), D.addDays(dl, 12)) + paidIn('3384', D.bom(ym), D.addDays(dl, 12)) + paidIn('3386', D.bom(ym), D.addDays(dl, 12)), noFile: true, nav: 'bhxh:' + ym, note: 'Phần NLĐ + NSDLĐ (không gồm KPCĐ)' }); } }
    const cit = T.cit(y);
    for (const q of cit.q) addI({ key: 'tndnq:' + y + '-Q' + q.q, type: 'TNDN', name: 'Tạm nộp thuế TNDN quý ' + q.q + '/' + y + ' (chỉ nộp tiền, không nộp tờ khai)', deadline: q.deadline, amount: q.due, paidAmt: paidIn('3334', D.addDays(q.to, 1), D.addDays(q.deadline, 7)), noFile: true, nav: 'tndn:' + y, note: 'Thuế lũy kế ' + KT.f(q.cum) });
    addI({ key: 'tndnqt:' + y, type: 'TNDN', name: 'Quyết toán thuế TNDN (03/TNDN) năm ' + y, deadline: D.nextWorkday(D.iso(y + 1, 3, 31)), amount: cit.v.H > 0 ? cit.v.H : 0, paidAmt: 0, nav: 'tndn:' + y, note: 'Còn phải nộp theo quyết toán' });
    addI({ key: 'qttncn:' + y, type: 'TNCN', name: 'Quyết toán thuế TNCN (05/QTT-TNCN) năm ' + y, deadline: D.nextWorkday(D.iso(y + 1, 3, 31)), amount: 0, paidAmt: 0, nav: 'tncn:' + y, note: 'Tổ chức trả thu nhập quyết toán' });
    addI({ key: 'bctc:' + y, type: 'BCTC', name: 'Nộp báo cáo tài chính năm ' + y, deadline: D.nextWorkday(D.iso(y + 1, 3, 31)), amount: 0, paidAmt: 0, nav: 'b01', note: 'Trong 90 ngày kể từ ngày kết thúc năm tài chính' });
    const mb = T.monBai(y); addI({ key: 'monbai:' + y, type: 'MÔN BÀI', name: 'Lệ phí môn bài năm ' + y, deadline: mb.hanNop, amount: mb.muc, paidAmt: mb.paid, nav: 'monbai', note: mb.mienNamDau ? 'Miễn năm đầu thành lập' : '' });
  }
  items.sort((a, b) => a.deadline < b.deadline ? -1 : 1); return items;
};

/* ---------- kiểm tra hóa đơn / thuế khi nhập PS ---------- */
KT.extraChecks.push((L, add) => {
  const seen = new Map(); const lg = KT.S.legal.gtgt;
  for (const l of L.lines) {
    const isIn = l.no.startsWith('133') && !l.co.startsWith('3331'), isOut = l.co.startsWith('3331') && !l.no.startsWith('133');
    if (isIn || isOut) {
      if (!l.hd) add('warn', 'W20', 'Dòng thuế GTGT ' + (isIn ? 'đầu vào' : 'đầu ra') + ' thiếu số hóa đơn' + (isIn ? ' – sẽ không được khấu trừ' : ''), l);
      else if (!l.kh || !l.nhd) add('info', 'W20', 'Hóa đơn ' + l.hd + ' thiếu ký hiệu hoặc ngày hóa đơn', l);
      const p = L.pm.get(l.pt); if (!l.pt) add('warn', 'W21', 'Dòng thuế GTGT chưa gắn đối tượng (người bán/người mua)', l); else if (p && !p.mst && p.type !== 'NV' && isIn) add('info', 'W21', 'Đối tượng ' + l.pt + ' chưa có mã số thuế', l);
      if (l.thue && RATES[l.thue] !== undefined && l.gt) { const exp = KT.rnd(l.gt * RATES[l.thue]); if (Math.abs(exp - Math.abs(l.amt)) > 2) add('warn', 'W14', 'Thuế ' + KT.f(l.amt) + ' khác giá trị chưa thuế × thuế suất (' + KT.f(exp) + ')', l); }
      if (l.thue === '8' && (l.date < lg.giam2.from || l.date > lg.giam2.to)) add('warn', 'W19', 'Thuế suất 8% ngoài thời hạn giảm thuế (' + D.fmt(lg.giam2.from) + ' – ' + D.fmt(lg.giam2.to) + ')', l);
      if (isIn && l.hd) { const k = l.hd + '|' + l.kh + '|' + l.pt; if (seen.has(k) && seen.get(k) !== l.vk) add('warn', 'W18', 'Hóa đơn ' + l.hd + ' của ' + (l.pt || '?') + ' đã được ghi ở chứng từ ' + seen.get(k), l); else seen.set(k, l.vk); }
    }
    if (isRev(l.co) && ['5', '8', '10'].includes(l.thue)) {
      const v = L.vouchers.find(x => x.key === l.vk && x.date === l.date);
      if (v && !v.lines.some(x => x.co.startsWith('3331'))) add('warn', 'W17', 'Doanh thu chịu thuế ' + l.thue + '% nhưng chứng từ chưa có dòng thuế GTGT đầu ra (Có 33311)', l);
    }
  }
  for (const r of T.cashFlags(L.first || '1900-01-01', L.last || '2100-01-01', L).slice(0, 30)) add('warn', 'W13', 'Chi ' + KT.f(r.cash) + ' đ tiền mặt cho hóa đơn ≥ ' + KT.f(KT.S.legal.tndn.nguongTienMat) + ' đ: không được khấu trừ GTGT và (theo Luật TNDN mới) không được tính chi phí hợp lý – dùng chuyển khoản hoặc gắn nhãn "Đã kiểm tra – được trừ" nếu thuộc diện ngoại lệ', { ct: r.vk, id: r.lines[0].id, date: r.date });
});

})(typeof globalThis !== 'undefined' ? globalThis : window);
