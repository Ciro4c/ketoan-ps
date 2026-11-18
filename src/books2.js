/* ===== SỔ BỔ SUNG: TSCĐ, chi phí SXKD, chi tiết bán hàng, đăng ký chứng từ ===== */
(function (G) {
'use strict';
const KT = G.KT, D = KT.d, R = KT.rep; const L_ = () => KT.compute(); const S_ = () => KT.S;
const cols = {
  n: (k, t, w) => ({ k, t, f: 'n', a: 'r', w })
};
R.tscd = (from, to) => {
  const L = L_(); const rows = []; const T = { ng: 0, ko: 0, kk: 0, kc: 0, cl: 0 };
  for (const a of S_().assets) {
    let ko = 0, kk = 0;
    for (const l of L.lines) {
      if (l.ts !== a.code) continue; const dep = l.co.startsWith('214') ? l.amt : l.no.startsWith('214') ? -l.amt : 0; if (!dep) continue;
      if (l.date < from) ko += dep; else if (l.date <= to) kk += dep;
    }
    const ng = KT.num(a.nguyenGia); const kc = ko + kk; const live = !(a.thanhLy && a.thanhLy < from); if (!live) continue;
    const r = { code: a.code, name: a.name, nhom: a.nhom === '213' ? 'Vô hình' : 'Hữu hình', bd: a.batDau, thang: a.thang, ng, ko, kk, kc, cl: ng - kc, tk: a.tkChiPhi || '' };
    rows.push(r); for (const k of Object.keys(T)) T[k] += r[k];
  }
  rows.push(Object.assign({ _cls: 'tot', code: '', name: 'TỔNG CỘNG' }, T));
  return { form: 'S21-DN', title: 'SỔ TÀI SẢN CỐ ĐỊNH', sub: 'Khấu hao lấy từ bút toán Có 214 gắn mã TSCĐ', period: { from, to },
    cols: [{ k: 'code', t: 'Mã TSCĐ', w: 70 }, { k: 'name', t: 'Tên tài sản', w: 220 }, { k: 'nhom', t: 'Loại', w: 70 }, { k: 'bd', t: 'Ngày dùng', f: 'd' }, { k: 'thang', t: 'Số tháng KH', a: 'r' }, cols.n('ng', 'Nguyên giá'), cols.n('ko', 'Hao mòn đầu kỳ'), cols.n('kk', 'Khấu hao trong kỳ'), cols.n('kc', 'Hao mòn cuối kỳ'), cols.n('cl', 'Giá trị còn lại'), { k: 'tk', t: 'TK chi phí', a: 'c' }], rows };
};
R.chiPhi = (from, to) => {
  const L = L_(); const roots = ['154', '621', '622', '627', '632', '635', '641', '642']; const rows = []; const T = { on: 0, pn: 0, pc: 0, cn: 0 };
  for (const rt of roots) for (const a of S_().accounts) {
    if (!a.code.startsWith(rt) || (a.code.length > rt.length && false)) continue; if (KT.acc.hasChildren(a.code) && a.code !== rt) continue; if (a.code === rt && KT.acc.hasChildren(rt)) continue;
    const op = L.balBefore(a.code, from), m = L.mov(a.code, from, to, { noClose: true }); const cl = op + m.n - m.c; if (!op && !m.n && !m.c) continue;
    rows.push({ tk: a.code, name: a.name, on: op, pn: m.n, pc: m.c, cn: cl }); T.on += op; T.pn += m.n; T.pc += m.c; T.cn += cl;
  }
  rows.push(Object.assign({ _cls: 'tot', tk: '', name: 'TỔNG CỘNG' }, T));
  return { form: 'S36-DN', title: 'SỔ CHI PHÍ SẢN XUẤT, KINH DOANH', sub: 'TK 154, 621, 622, 627, 632, 635, 641, 642 theo từng tài khoản chi tiết', period: { from, to },
    cols: [{ k: 'tk', t: 'TK', w: 70 }, { k: 'name', t: 'Tên tài khoản', w: 300 }, cols.n('on', 'Dư đầu kỳ'), cols.n('pn', 'Phát sinh Nợ'), cols.n('pc', 'Phát sinh Có (kết chuyển)'), cols.n('cn', 'Dư cuối kỳ')], rows };
};
R.banHang = (from, to) => {
  const L = L_(); const rows = []; let tr = 0, tg = 0, ts = 0;
  for (const l of L.lines) {
    if (l.date < from || l.date > to || l.close) continue; const isRev = /^(511|512)/.test(l.co), isDed = l.no.startsWith('521');
    if (!isRev && !isDed) continue; const p = L.pm.get(l.pt) || {}; const v = isRev ? l.amt : -l.amt;
    rows.push({ date: l.date, ct: l.ct, hd: l.hd, kh: l.pt, name: p.name || '', vt: l.vt, sl: l.sl, tk: isRev ? l.co : l.no, dg: l.dg, dt: v }); tr += v; ts += isRev ? l.sl : 0;
  }
  rows.push({ _cls: 'tot', dg: 'TỔNG CỘNG', dt: tr, sl: ts });
  return { form: 'S35-DN', title: 'SỔ CHI TIẾT BÁN HÀNG', sub: 'Doanh thu (Có 511) và giảm trừ (Nợ 521) theo từng chứng từ', period: { from, to },
    cols: [{ k: 'date', t: 'Ngày', f: 'd' }, { k: 'ct', t: 'Số CT', w: 100 }, { k: 'hd', t: 'Số HĐ' }, { k: 'kh', t: 'Mã KH' }, { k: 'name', t: 'Khách hàng', w: 200 }, { k: 'vt', t: 'Mã hàng' }, { k: 'sl', t: 'SL', f: 'q', a: 'r' }, { k: 'tk', t: 'TK', a: 'c' }, { k: 'dg', t: 'Diễn giải', w: 240 }, cols.n('dt', 'Doanh thu')], rows };
};
/** đăng ký chứng từ + phát hiện đứt số */
R.dangKy = (from, to) => {
  const L = L_(); const doc = S_().vdoc || {}; const rows = []; const seq = new Map();
  for (const v of L.vouchers) {
    if (v.date < from || v.date > to) continue; const f = v.lines[0]; const hd = (v.lines.find(l => l.hd) || {}).hd || ''; const pt = (v.lines.find(l => l.pt) || {}).pt || '';
    const d = doc[v.key + '|' + v.date] || {}; const auto = v.lines.every(l => l.tag);
    rows.push({ key: v.key, date: v.date, loai: v.type ? v.type.name : '', dg: f.dg, hd, pt, tot: v.total, auto, id: v.key + '|' + v.date, goc: !!d.goc, luu: d.luu || '', to: d.to || '', ghi: d.ghi || '', han: D.iso(+v.date.slice(0, 4) + 10, 12, 31), n: v.lines.length });
    const m = String(v.key).match(/^([A-Za-z]+\d*)[-./]?(\d+)$/); if (m && !auto) { const k = m[1]; const a = seq.get(k) || []; a.push(+m[2]); seq.set(k, a); }
  }
  const gaps = []; for (const [k, a] of seq) { const s = [...new Set(a)].sort((x, y) => x - y); const miss = []; for (let i = s[0]; i <= s[s.length - 1]; i++) if (!s.includes(i)) miss.push(i); if (miss.length) gaps.push({ k, miss }); }
  return { rows, gaps };
};
})(typeof globalThis !== 'undefined' ? globalThis : window);
