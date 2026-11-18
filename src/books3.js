/* ===== SỔ THEO HÌNH THỨC KẾ TOÁN: nhật ký thu/chi/mua/bán, Nhật ký – Sổ Cái, Chứng từ ghi sổ ===== */
(function (G) {
'use strict';
const KT = G.KT, D = KT.d, R = KT.rep; const L_ = () => KT.compute();
const nc = (k, t, w) => ({ k, t, f: 'n', a: 'r', w });
const cash = a => /^(111|112|113)/.test(a);
const inR = (l, from, to) => l.date >= from && l.date <= to && !l.close;
const pnm = (L, c) => { const p = L.pm.get(c); return p ? p.name : ''; };
const withSub = (rows, key, label, tot) => {
  const g = new Map(); rows.forEach(r => g.set(r[key], (g.get(r[key]) || 0) + r.st));
  rows.push({ _cls: 'tot', dg: 'CỘNG', st: tot });
  [...g].sort().forEach(([k, v]) => rows.push({ _cls: 'sub', dg: label + ' ' + k, st: v }));
  return rows;
};
R.nkTien = (kind, from, to) => {
  const L = L_(); const thu = kind === 'thu'; const rows = []; let t = 0;
  for (const l of L.lines) {
    if (!inR(l, from, to)) continue; const a = thu ? l.no : l.co, b = thu ? l.co : l.no; if (!cash(a) || cash(b)) continue;
    rows.push({ date: l.date, ct: l.ct, dg: l.dg, doi: b, tk: a.slice(0, 3), pt: l.pt, name: pnm(L, l.pt), st: l.amt }); t += l.amt;
  }
  return { form: thu ? 'S03a1-DN' : 'S03a2-DN', title: thu ? 'SỔ NHẬT KÝ THU TIỀN' : 'SỔ NHẬT KÝ CHI TIỀN', sub: 'Tiền mặt và tiền gửi ngân hàng, ' + (thu ? 'ghi Nợ' : 'ghi Có'), period: { from, to },
    cols: [{ k: 'date', t: 'Ngày', f: 'd' }, { k: 'ct', t: 'Số CT', w: 100 }, { k: 'dg', t: 'Diễn giải', w: 260 }, { k: 'tk', t: thu ? 'TK thu tiền' : 'TK chi tiền', a: 'c' }, { k: 'doi', t: 'TK đối ứng', a: 'c' }, { k: 'name', t: thu ? 'Người nộp' : 'Người nhận', w: 160 }, nc('st', 'Số tiền')], rows: withSub(rows, 'doi', 'Đối ứng TK', t) };
};
R.nkMua = (from, to) => {
  const L = L_(); const rows = []; let t = 0;
  for (const l of L.lines) { if (!inR(l, from, to) || !l.co.startsWith('331') || cash(l.no)) continue; rows.push({ date: l.date, ct: l.ct, hd: l.hd, name: pnm(L, l.pt), pt: l.pt, dg: l.dg, doi: l.no.slice(0, 3), st: l.amt }); t += l.amt; }
  return { form: 'S03a3-DN', title: 'SỔ NHẬT KÝ MUA HÀNG', sub: 'Mua chịu: ghi Có TK 331', period: { from, to },
    cols: [{ k: 'date', t: 'Ngày', f: 'd' }, { k: 'ct', t: 'Số CT', w: 100 }, { k: 'hd', t: 'Số HĐ' }, { k: 'pt', t: 'Mã NCC' }, { k: 'name', t: 'Nhà cung cấp', w: 180 }, { k: 'dg', t: 'Diễn giải', w: 240 }, { k: 'doi', t: 'TK Nợ', a: 'c' }, nc('st', 'Số tiền')], rows: withSub(rows, 'doi', 'Nợ TK', t) };
};
R.nkBan = (from, to) => {
  const L = L_(); const rows = []; let t = 0;
  for (const l of L.lines) { if (!inR(l, from, to) || !l.no.startsWith('131') || !/^(511|512|3331|515|711)/.test(l.co)) continue; rows.push({ date: l.date, ct: l.ct, hd: l.hd, name: pnm(L, l.pt), pt: l.pt, dg: l.dg, doi: l.co.slice(0, 4), st: l.amt }); t += l.amt; }
  return { form: 'S03a4-DN', title: 'SỔ NHẬT KÝ BÁN HÀNG', sub: 'Bán chịu: ghi Nợ TK 131', period: { from, to },
    cols: [{ k: 'date', t: 'Ngày', f: 'd' }, { k: 'ct', t: 'Số CT', w: 100 }, { k: 'hd', t: 'Số HĐ' }, { k: 'pt', t: 'Mã KH' }, { k: 'name', t: 'Khách hàng', w: 180 }, { k: 'dg', t: 'Diễn giải', w: 240 }, { k: 'doi', t: 'TK Có', a: 'c' }, nc('st', 'Số tiền')], rows: withSub(rows, 'doi', 'Có TK', t) };
};
/** S01-DN Nhật ký – Sổ Cái: mỗi dòng một nghiệp vụ, cột Nợ/Có theo từng tài khoản cấp 3 */
R.nkSoCai = (from, to) => {
  const L = L_(); const ls = L.lines.filter(l => l.date >= from && l.date <= to); const set = new Set(); ls.forEach(l => { set.add(l.no.slice(0, 3)); set.add(l.co.slice(0, 3)); }); const accs = [...set].sort();
  const cols = [{ k: 'date', t: 'Ngày', f: 'd' }, { k: 'ct', t: 'Số CT', w: 100 }, { k: 'dg', t: 'Diễn giải', w: 240 }, nc('st', 'Số tiền')]; accs.forEach(a => { cols.push(nc('n' + a, a + ' Nợ')); cols.push(nc('c' + a, a + ' Có')); });
  const rows = []; const T = {}; ls.forEach(l => { const r = { date: l.date, ct: l.ct, dg: l.dg, st: l.amt }; r['n' + l.no.slice(0, 3)] = l.amt; r['c' + l.co.slice(0, 3)] = l.amt; T['n' + l.no.slice(0, 3)] = (T['n' + l.no.slice(0, 3)] || 0) + l.amt; T['c' + l.co.slice(0, 3)] = (T['c' + l.co.slice(0, 3)] || 0) + l.amt; rows.push(r); });
  rows.push(Object.assign({ _cls: 'tot', dg: 'CỘNG PHÁT SINH' }, T));
  const cb = { _cls: 'tot', dg: 'SỐ DƯ CUỐI KỲ' }; accs.forEach(a => { const b = L.bal(a, to); if (b >= 0) cb['n' + a] = b; else cb['c' + a] = -b; }); rows.push(cb);
  return { form: 'S01-DN', title: 'NHẬT KÝ – SỔ CÁI', sub: 'Theo tài khoản cấp 3', period: { from, to }, cols, rows };
};
const ctgsList = (from, to) => {
  const L = L_(); const byYear = new Map(); const out = [];
  const vs = L.vouchers.slice().sort((a, b) => a.date < b.date ? -1 : a.date > b.date ? 1 : a.key < b.key ? -1 : 1);
  for (const v of vs) { const y = v.date.slice(0, 4); const n = (byYear.get(y) || 0) + 1; byYear.set(y, n); if (v.date >= from && v.date <= to) out.push({ v, no: 'CTGS-' + y.slice(2) + '-' + String(n).padStart(4, '0') }); }
  return out;
};
R.ctgsDk = (from, to) => { const rows = ctgsList(from, to).map(x => ({ no: x.no, date: x.v.date, ct: x.v.key, dg: x.v.lines[0].dg, st: x.v.total })); rows.push({ _cls: 'tot', dg: 'CỘNG', st: rows.reduce((s, r) => s + r.st, 0) });
  return { form: 'S02b-DN', title: 'SỔ ĐĂNG KÝ CHỨNG TỪ GHI SỔ', sub: 'Mỗi chứng từ gốc lập một chứng từ ghi sổ, đánh số liên tục trong năm', period: { from, to }, cols: [{ k: 'no', t: 'Số hiệu CTGS', w: 110 }, { k: 'date', t: 'Ngày', f: 'd' }, { k: 'ct', t: 'Chứng từ gốc', w: 110 }, { k: 'dg', t: 'Nội dung', w: 300 }, nc('st', 'Số tiền')], rows }; };
R.ctgs = (from, to) => { const rows = []; for (const x of ctgsList(from, to)) { rows.push({ _cls: 'grp', no: x.no, date: x.v.date, dg: 'Chứng từ gốc ' + x.v.key, st: x.v.total }); x.v.lines.forEach(l => rows.push({ dg: l.dg, no_: l.no, co_: l.co, st: l.amt })); }
  return { form: 'S02a-DN', title: 'CHỨNG TỪ GHI SỔ', sub: 'Trích yếu, tài khoản Nợ, tài khoản Có, số tiền', period: { from, to }, cols: [{ k: 'no', t: 'Số hiệu', w: 110 }, { k: 'date', t: 'Ngày', f: 'd' }, { k: 'dg', t: 'Trích yếu', w: 320 }, { k: 'no_', t: 'TK Nợ', a: 'c' }, { k: 'co_', t: 'TK Có', a: 'c' }, nc('st', 'Số tiền')], rows }; };
R.ctgsNo = (v) => { const x = ctgsList('0000-01-01', '9999-12-31').find(q => q.v === v || (q.v.key === v.key && q.v.date === v.date)); return x ? x.no : ''; };

/* đọc số tiền thành chữ (tiếng Việt) */
KT.docTien = n => {
  n = Math.round(Math.abs(n)); if (!n) return 'Không đồng'; const ch = ['không', 'một', 'hai', 'ba', 'bốn', 'năm', 'sáu', 'bảy', 'tám', 'chín']; const u = ['', ' nghìn', ' triệu', ' tỷ', ' nghìn tỷ', ' triệu tỷ'];
  const tri = (x, full) => { const t = Math.floor(x / 100), c = Math.floor(x % 100 / 10), d = x % 10; let s = ''; if (t || full) s += ch[t] + ' trăm'; if (c > 1) { s += ' ' + ch[c] + ' mươi'; if (d === 1) s += ' mốt'; else if (d === 5) s += ' lăm'; else if (d) s += ' ' + ch[d]; } else if (c === 1) { s += ' mười'; if (d === 5) s += ' lăm'; else if (d) s += ' ' + ch[d]; } else if (d) { if (t || full) s += ' lẻ'; s += ' ' + ch[d]; } return s.trim(); };
  const parts = []; let i = 0; while (n > 0) { parts.unshift(n % 1000); n = Math.floor(n / 1000); } let out = ''; parts.forEach((p, k) => { const idx = parts.length - 1 - k; if (!p) return; out += ' ' + tri(p, k > 0) + u[idx]; });
  out = out.trim(); return out.charAt(0).toUpperCase() + out.slice(1) + ' đồng';
};
})(typeof globalThis !== 'undefined' ? globalThis : window);
