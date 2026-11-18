/* ===== BIỂU MẪU CHUẨN CỦA SỔ KẾ TOÁN (bố cục cột theo mẫu trong Thông tư 99/2025/TT-BTC, Phụ lục III) =====
   Chỉ các mẫu có trong KT.forms.DONE mới dựng đúng bố cục mẫu. Các sổ khác dùng bảng tự thiết kế,
   được ghi rõ là "chưa đối chiếu mẫu chuẩn" ở màn hình xem trước.
   Nguồn bố cục: S03b-DN và S02c1/c2-DN đã đối chiếu mô tả cột; S03a-DN dựng theo cùng cấu trúc với mẫu Nhật ký chung của chế độ cũ. Cần đối chiếu file mẫu gốc. */
(function (G) {
'use strict';
const KT = G.KT, D = KT.d, E = KT.esc, F = KT.f;
const forms = KT.forms = {};
const ROWS_PER_PAGE = 40;          // số dòng của một trang sổ khi in; dùng để suy ra "Trang số" ở Sổ Cái
const B = 'border:1px solid #000;padding:3px 5px', BH = B + ';text-align:center;font-weight:700', BR = B + ';text-align:right', BC = B + ';text-align:center';

/** trạng thái đối chiếu của từng mẫu sổ */
forms.DONE = {
  'S03a-DN': 'Dựng theo bố cục sổ Nhật ký chung; cần đối chiếu file mẫu gốc',
  'S03b-DN': 'Đã đối chiếu mô tả cột trong Thông tư 99 (cột A, B, C, D, E, G, H, 1, 2)'
};

const co = () => KT.S.company;
const head = (form, tenSo, ky) => '<div style="display:flex;justify-content:space-between;gap:16px;font:13px/1.45 \'Times New Roman\',serif"><div><b>Đơn vị: ' + E(co().name || '.......') + '</b><br>Địa chỉ: ' + E(co().address || '.......') + '</div><div style="text-align:center"><b>Mẫu số ' + form + '</b><br><i>(Ban hành kèm theo Thông tư số 99/2025/TT-BTC của Bộ trưởng Bộ Tài chính)</i></div></div><div style="text-align:center;margin:12px 0;font-family:\'Times New Roman\',serif"><h2 style="font-size:20px;margin:0">' + tenSo + '</h2><i>' + ky + '</i></div>';
const foot = nPages => '<div style="font:13px/1.5 \'Times New Roman\',serif;margin-top:10px">- Sổ này có ... trang, đánh số từ trang 01 đến trang ' + String(Math.max(1, nPages)).padStart(2, '0') + '.<br>- Ngày mở sổ: ' + D.fmt(KT.S.company.fyStart || '') + '</div><div style="display:flex;justify-content:space-around;text-align:center;margin-top:14px;font:13px/1.4 \'Times New Roman\',serif"><div><b>Người ghi sổ</b><br><i>(Ký, họ tên)</i><br><br><br>' + E(co().nguoiLap || '') + '</div><div><b>Kế toán trưởng</b><br><i>(Ký, họ tên)</i><br><br><br>' + E(co().ktt || '') + '</div><div><i>Ngày ..... tháng ..... năm .....</i><br><b>Giám đốc</b><br><i>(Ký, họ tên, đóng dấu)</i><br><br><br>' + E(co().giamDoc || '') + '</div></div>';
const th = (t, o) => '<th style="' + BH + '"' + (o && o.cs ? ' colspan="' + o.cs + '"' : '') + (o && o.rs ? ' rowspan="' + o.rs + '"' : '') + '>' + t + '</th>';
const wrap = h => '<div style="background:#fff;color:#000;padding:14px">' + h + '</div>';

/** chỉ mục dòng của Sổ Nhật ký chung: mỗi bút toán chiếm hai dòng (ghi Nợ rồi ghi Có), đánh số liên tục từ đầu năm */
forms.nkIndex = from => {
  const L = KT.compute(), y0 = from.slice(0, 4) + '-01-01', m = new Map(); let n = 0;
  for (const l of L.lines) { if (l.date < y0 || l.date > from.slice(0, 4) + '-12-31') continue; m.set(l.id, { no: ++n, co: ++n }); }
  return { map: m, total: n };
};
const pageOf = n => Math.ceil(n / ROWS_PER_PAGE);

forms.S03a = (from, to) => {
  const L = KT.compute(), ix = forms.nkIndex(from); let tn = 0, body = '';
  for (const l of L.lines) {
    if (l.date < from || l.date > to) continue; const s = ix.map.get(l.id) || { no: '', co: '' }; tn += l.amt;
    body += '<tr><td style="' + BC + '">' + D.fmt(l.date) + '</td><td style="' + B + '">' + E(l.ct) + '</td><td style="' + BC + '">' + D.fmt(l.date) + '</td><td style="' + B + '">' + E(l.dg) + '</td><td style="' + BC + '">x</td><td style="' + BC + '">' + s.no + '</td><td style="' + BC + '">' + E(l.no) + '</td><td style="' + BR + '">' + F(l.amt) + '</td><td style="' + B + '"></td></tr>' +
      '<tr><td style="' + B + '"></td><td style="' + B + '"></td><td style="' + B + '"></td><td style="' + B + ';padding-left:22px">Có</td><td style="' + BC + '">x</td><td style="' + BC + '">' + s.co + '</td><td style="' + BC + '">' + E(l.co) + '</td><td style="' + B + '"></td><td style="' + BR + '">' + F(l.amt) + '</td></tr>';
  }
  const table = '<table style="width:100%;border-collapse:collapse;font:12px/1.35 \'Times New Roman\',serif"><thead><tr>' + th('Ngày, tháng ghi sổ', { rs: 2 }) + th('Chứng từ', { cs: 2 }) + th('Diễn giải', { rs: 2 }) + th('Đã ghi Sổ Cái', { rs: 2 }) + th('STT dòng', { rs: 2 }) + th('Số hiệu tài khoản', { rs: 2 }) + th('Số phát sinh', { cs: 2 }) + '</tr><tr>' + th('Số hiệu') + th('Ngày, tháng') + th('Nợ') + th('Có') + '</tr><tr>' + ['A', 'B', 'C', 'D', 'E', 'G', 'H', '1', '2'].map(x => '<td style="' + BC + '"><i>' + x + '</i></td>').join('') + '</tr></thead><tbody>' + body + '<tr><td colspan="7" style="' + B + ';font-weight:700">Cộng phát sinh trong kỳ</td><td style="' + BR + ';font-weight:700">' + F(tn) + '</td><td style="' + BR + ';font-weight:700">' + F(tn) + '</td></tr></tbody></table>';
  return wrap(head('S03a-DN', 'SỔ NHẬT KÝ CHUNG', 'Từ ngày ' + D.fmt(from) + ' đến ngày ' + D.fmt(to)) + table + foot(pageOf(ix.total)));
};

forms.S03b = r => {
  const ix = forms.nkIndex(r.period.from); const L = KT.compute(); const byId = new Map(L.lines.map(l => [l.id, l]));
  const side = (row) => { const l = byId.get(row.id); if (!l) return { no: '', co: '' }; const s = ix.map.get(l.id) || {}; return l.no.startsWith(String(r.tk)) ? { no: s.no, co: '' } : { no: s.co, co: '' }; };
  let body = '';
  for (const x of r.rows) {
    if (x._cls) { body += '<tr><td colspan="4" style="' + B + ';font-weight:700">' + E(x.dg) + '</td><td style="' + B + '"></td><td style="' + B + '"></td><td style="' + B + '"></td><td style="' + BR + ';font-weight:700">' + (x.no !== '' && x.no != null ? F(x.no) : '') + '</td><td style="' + BR + ';font-weight:700">' + (x.co !== '' && x.co != null ? F(x.co) : '') + '</td></tr>'; continue; }
    const s = side(x); const stt = s.no || '';
    body += '<tr><td style="' + BC + '">' + D.fmt(x.date) + '</td><td style="' + B + '">' + E(x.ct) + '</td><td style="' + BC + '">' + D.fmt(x.ndate || x.date) + '</td><td style="' + B + '">' + E(x.dg) + '</td><td style="' + BC + '">' + (stt ? pageOf(stt) : '') + '</td><td style="' + BC + '">' + stt + '</td><td style="' + BC + '">' + E(x.tk) + '</td><td style="' + BR + '">' + (x.no ? F(x.no) : '') + '</td><td style="' + BR + '">' + (x.co ? F(x.co) : '') + '</td></tr>';
  }
  const table = '<table style="width:100%;border-collapse:collapse;font:12px/1.35 \'Times New Roman\',serif"><thead><tr>' + th('Ngày, tháng ghi sổ', { rs: 2 }) + th('Chứng từ', { cs: 2 }) + th('Diễn giải', { rs: 2 }) + th('Nhật ký chung', { cs: 2 }) + th('Số hiệu tài khoản đối ứng', { rs: 2 }) + th('Số tiền', { cs: 2 }) + '</tr><tr>' + th('Số hiệu') + th('Ngày, tháng') + th('Trang số') + th('STT dòng') + th('Nợ') + th('Có') + '</tr><tr>' + ['A', 'B', 'C', 'D', 'E', 'G', 'H', '1', '2'].map(x => '<td style="' + BC + '"><i>' + x + '</i></td>').join('') + '</tr></thead><tbody>' + body + '</tbody></table>';
  return wrap(head('S03b-DN', 'SỔ CÁI', 'Từ ngày ' + D.fmt(r.period.from) + ' đến ngày ' + D.fmt(r.period.to) + '<br>Tên tài khoản: ' + E(KT.acc.name(r.tk) || '') + '. Số hiệu: ' + E(r.tk) + '. Đơn vị tính: đồng') + table + '<div style="font:12px \'Times New Roman\',serif;margin-top:6px"><i>Cột E được suy ra với ' + ROWS_PER_PAGE + ' dòng mỗi trang của Sổ Nhật ký chung.</i></div>' + foot(1));
};

/** trả về HTML mẫu chuẩn nếu sổ đã có bố cục chuẩn, ngược lại trả về null */
forms.render = r => {
  if (r.form === 'S03a-DN') return forms.S03a(r.period.from, r.period.to);
  if (r.form === 'S03b-DN' && r.tk && !r.sub.includes('đối tượng')) return forms.S03b(r);
  return null;
};
})(typeof globalThis !== 'undefined' ? globalThis : window);
