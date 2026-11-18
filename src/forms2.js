/* ===== MẪU TỜ KHAI THUẾ VÀ SỔ THEO BỐ CỤC PHÁP LÝ (chỉ dựng HTML, không có giao diện) =====
   KT.forms2.gtgt(r)         Tờ khai 01/GTGT (chỉ tiêu [21]...[43])
   KT.forms2.bkBan(r), bkMua(r)   Bảng kê 01-1/GTGT, 01-2/GTGT
   KT.forms2.tndn(year)      Tờ khai quyết toán 03/TNDN (chưa kèm phụ lục)
   KT.forms2.tncn(per)       Tờ khai khấu trừ 05/KK-TNCN kèm bảng kê
   KT.forms2.monbai(year), qtt(year), d02(ym)   01/MBAI, 05/QTT-TNCN, D02-LT
   KT.forms2.book(r)         Khung sổ kế toán chung (đầu mẫu, ký hiệu cột, cộng, chữ ký) cho sổ chưa có mẫu riêng
   Bố cục chỉ tiêu theo Thông tư 80/2021/TT-BTC; mẫu mới có hiệu lực thì tên thông tư lấy từ S.legal (ngày hiệu lực).
   Chưa đối chiếu từng chữ với file mẫu của cơ quan thuế: người dùng cần kiểm tra trước khi nộp. */
(function (G) {
'use strict';
const KT = G.KT, D = KT.d, E = KT.esc, f = n => KT.f(n, 1), S = () => KT.S;
const F2 = KT.forms2 = {};
const FONT = "font:13px/1.45 'Times New Roman',serif;color:#000;background:#fff";
const B = 'border:1px solid #000;padding:3px 6px', BC = B + ';text-align:center', BR = B + ';text-align:right', BB = B + ';font-weight:700';
const co = () => S().company;
const wrap = h => '<div style="' + FONT + ';padding:18px;page-break-after:always">' + h + '</div>';
const sign = (a, b, c) => '<table style="width:100%;margin-top:18px;border-collapse:collapse;text-align:center"><tr>' + [a, b, c].filter(Boolean).map(x => '<td style="vertical-align:top;padding:4px"><b>' + x[0] + '</b><br><i>' + (x[1] || '(Ký, họ tên)') + '</i><br><br><br><br>' + E(x[2] || '') + '</td>').join('') + '</tr></table>';
const TT80 = 'Thông tư số 80/2021/TT-BTC';
const lawName = () => TT80;
/** nhắc khi kỳ khai thuộc mẫu của thông tư mới hơn bố cục đang dựng */
const stale = (key, date) => { const a = (S().legal[key] || {}).mauTK; const t = a ? KT.at(a, date).ten : ''; return t && !/80\/2021/.test(t) ? '<div style="border:1px dashed #b00;padding:4px 8px;margin:6px 0;font-size:12px;color:#b00"><i>Lưu ý: kỳ này thuộc mẫu theo ' + E(t) + '; bố cục dưới đây dựng theo ' + TT80 + ', cần đối chiếu mẫu hiện hành trước khi nộp.</i></div>' : ''; };
const nnt = () => { const c = co(); return '<table style="width:100%;border-collapse:collapse;margin:8px 0"><tr><td style="width:50%">[04] Tên người nộp thuế: <b>' + E(c.name) + '</b></td><td>[05] Mã số thuế: <b>' + E(c.mst || '') + '</b></td></tr><tr><td colspan="2">[06] Địa chỉ: ' + E(c.address || '') + '</td></tr><tr><td>[07] Quận/huyện: ................................</td><td>[08] Tỉnh/thành phố: ................................</td></tr><tr><td>[09] Điện thoại: ' + E(c.dienThoai || '') + '</td><td>[10] Fax: ....................  [11] E-mail: ' + E(c.email || '') + '</td></tr><tr><td>[12] Tên đại lý thuế (nếu có): ......................</td><td>[13] Mã số thuế: ....................</td></tr></table>'; };
const banner = (mau, ban) => '<table style="width:100%"><tr><td style="width:55%"></td><td style="text-align:right"><b>Mẫu số: ' + mau + '</b><br><i style="font-size:12px">' + ban + '</i></td></tr></table><div style="text-align:center;margin-top:6px"><b>CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</b><br><b><u>Độc lập – Tự do – Hạnh phúc</u></b></div>';
const kyLabel = (kind, from) => { const m = +from.slice(5, 7), y = from.slice(0, 4); return kind === 'quy' ? 'Quý ' + Math.ceil(m / 3) + ' năm ' + y : kind === 'nam' ? 'Năm ' + y : 'Tháng ' + String(m).padStart(2, '0') + ' năm ' + y; };

/* ====================== 01/GTGT ====================== */
F2.gtgt = r => {
  const v = r.v, n = k => KT.num(v[k]), p = r.per, c = co();
  const row = (stt, name, code, a, t, bold, ind) => '<tr><td style="' + BC + '">' + stt + '</td><td style="' + B + (bold ? ';font-weight:700' : '') + (ind ? ';padding-left:' + (6 + ind * 14) + 'px' : '') + '">' + name + '</td><td style="' + BC + '">' + code + '</td><td style="' + BR + '">' + (a === null ? '' : f(a)) + '</td><td style="' + BR + '">' + (t === null ? '' : f(t)) + '</td></tr>';
  const sec = (stt, name) => '<tr><td style="' + BC + '"><b>' + stt + '</b></td><td colspan="4" style="' + BB + '">' + name + '</td></tr>';
  const none = v.none ? 'X' : '&nbsp;&nbsp;';
  return wrap(banner('01/GTGT', '(Ban hành kèm theo ' + (lawName('gtgt', p.to) || 'Thông tư số 80/2021/TT-BTC') + ' của Bộ trưởng Bộ Tài chính)') +
    '<h2 style="text-align:center;margin:12px 0 2px;font-size:19px">TỜ KHAI THUẾ GIÁ TRỊ GIA TĂNG</h2><div style="text-align:center"><i>(Dành cho người nộp thuế khai thuế giá trị gia tăng theo phương pháp khấu trừ)</i></div>' +
    stale('gtgt', p.to) + '<div style="text-align:center;margin:6px 0">[01] Kỳ tính thuế: <b>' + kyLabel(c.kyGTGT === 'quy' ? 'quy' : 'thang', p.from) + '</b></div><div style="text-align:center">[02] Lần đầu: [X] &nbsp; [03] Bổ sung lần thứ: [ &nbsp;]</div>' + nnt() +
    '<div style="text-align:right"><i>Đơn vị tiền: đồng Việt Nam</i></div>' +
    '<table style="width:100%;border-collapse:collapse"><thead><tr><th style="' + BC + ';width:44px">STT</th><th style="' + BC + '">Chỉ tiêu</th><th style="' + BC + ';width:70px">Mã chỉ tiêu</th><th style="' + BC + ';width:130px">Giá trị HHDV (chưa có thuế GTGT)</th><th style="' + BC + ';width:120px">Số thuế GTGT</th></tr></thead><tbody>' +
    '<tr><td style="' + BC + '"><b>A</b></td><td style="' + BB + '">Không phát sinh hoạt động mua, bán trong kỳ (đánh dấu “X”)</td><td style="' + BC + '">[21]</td><td colspan="2" style="' + BC + '">' + none + '</td></tr>' +
    '<tr><td style="' + BC + '"><b>B</b></td><td style="' + BB + '">Thuế GTGT còn được khấu trừ kỳ trước chuyển sang</td><td style="' + BC + '">[22]</td><td style="' + BR + '"></td><td style="' + BR + '">' + f(n(22)) + '</td></tr>' +
    sec('C', 'Kê khai thuế GTGT phải nộp Ngân sách nhà nước') + sec('I', 'Hàng hóa, dịch vụ (HHDV) mua vào trong kỳ') +
    row('1', 'Giá trị và thuế GTGT của hàng hóa, dịch vụ mua vào', '[23] [24]', n(23), n(24)) + row('2', 'Tổng số thuế GTGT được khấu trừ kỳ này', '[25]', null, n(25)) +
    sec('II', 'Hàng hóa, dịch vụ bán ra trong kỳ') + row('1', 'Hàng hóa, dịch vụ bán ra không chịu thuế GTGT', '[26]', n(26), null) +
    row('2', 'Hàng hóa, dịch vụ bán ra chịu thuế GTGT ([27]=[29]+[30]+[32]+[32a]; [28]=[31]+[33])', '[27] [28]', n(27), n(28)) +
    row('a', 'Hàng hóa, dịch vụ bán ra chịu thuế suất 0%', '[29]', n(29), null, 0, 1) + row('b', 'Hàng hóa, dịch vụ bán ra chịu thuế suất 5%', '[30] [31]', n(30), n(31), 0, 1) +
    row('c', 'Hàng hóa, dịch vụ bán ra chịu thuế suất 10%', '[32] [33]', n(32), n(33), 0, 1) + row('d', 'Hàng hóa, dịch vụ bán ra không tính thuế', '[32a]', n('32a'), null, 0, 1) +
    row('3', 'Tổng doanh thu và thuế GTGT của HHDV bán ra ([34]=[26]+[27]; [35]=[28])', '[34] [35]', n(34), n(35)) +
    '<tr><td style="' + BC + '"><b>III</b></td><td style="' + BB + '">Thuế GTGT phát sinh trong kỳ ([36]=[35]-[25])</td><td style="' + BC + '">[36]</td><td style="' + BR + '"></td><td style="' + BR + ';font-weight:700">' + f(n(36)) + '</td></tr>' +
    sec('IV', 'Điều chỉnh tăng, giảm thuế GTGT còn được khấu trừ của các kỳ trước') + row('1', 'Điều chỉnh giảm', '[37]', null, n(37)) + row('2', 'Điều chỉnh tăng', '[38]', null, n(38)) +
    '<tr><td style="' + BC + '"><b>V</b></td><td style="' + BB + '">Thuế GTGT đã nộp ở địa phương khác của hoạt động kinh doanh xây dựng, lắp đặt, bán hàng, bất động sản ngoại tỉnh</td><td style="' + BC + '">[39]</td><td style="' + BR + '"></td><td style="' + BR + '">' + f(n(39)) + '</td></tr>' +
    sec('VI', 'Xác định nghĩa vụ thuế GTGT phải nộp trong kỳ') + row('1', 'Thuế GTGT phải nộp của hoạt động sản xuất kinh doanh trong kỳ ([40a]=[36]-[22]+[37]-[38]-[39] ≥ 0)', '[40a]', null, n('40a')) +
    row('2', 'Thuế GTGT mua vào của dự án đầu tư được bù trừ với thuế GTGT còn phải nộp của hoạt động sản xuất kinh doanh cùng kỳ tính thuế', '[40b]', null, n('40b')) +
    row('3', 'Thuế GTGT còn phải nộp trong kỳ ([40]=[40a]-[40b])', '[40]', null, n(40), 1) + row('4', 'Thuế GTGT chưa khấu trừ hết kỳ này (nếu ([41]=[36]-[22]+[37]-[38]-[39] < 0)', '[41]', null, n(41)) +
    row('4.1', 'Tổng số thuế GTGT đề nghị hoàn', '[42]', null, n(42), 0, 1) + row('4.2', 'Thuế GTGT còn được khấu trừ chuyển kỳ sau ([43]=[41]-[42])', '[43]', null, n(43), 0, 1) + '</tbody></table>' +
    '<p style="margin:10px 0 0">Tôi cam đoan số liệu khai trên là đúng và chịu trách nhiệm trước pháp luật về những số liệu đã khai./.</p>' +
    '<table style="width:100%;margin-top:8px"><tr><td style="width:50%;vertical-align:top"><b>NHÂN VIÊN ĐẠI LÝ THUẾ</b><br>Họ và tên: ...........................<br>Chứng chỉ hành nghề số: ...........</td><td style="text-align:center"><i>Ngày ..... tháng ..... năm .....</i><br><b>NGƯỜI NỘP THUẾ hoặc<br>ĐẠI DIỆN HỢP PHÁP CỦA NGƯỜI NỘP THUẾ</b><br><i>(Ký, ghi rõ họ tên; chức vụ và đóng dấu (nếu có))</i><br><br><br>' + E(c.giamDoc || '') + '</td></tr></table>');
};

/* ====================== BẢNG KÊ 01-1, 01-2 ====================== */
const GROUPS_OUT = [['KCT', '1. Hàng hóa, dịch vụ bán ra không chịu thuế GTGT'], ['0', '2. Hàng hóa, dịch vụ bán ra chịu thuế suất 0%'], ['5', '3. Hàng hóa, dịch vụ bán ra chịu thuế suất 5%'], ['8', '4. Hàng hóa, dịch vụ bán ra chịu thuế suất 8%'], ['10', '5. Hàng hóa, dịch vụ bán ra chịu thuế suất 10%'], ['KKK', '6. Hàng hóa, dịch vụ bán ra không tính thuế']];
const bk = (r, kind) => {
  const isOut = kind === 'out', p = r.per, c = co();
  const items = isOut ? r.out.map(x => Object.assign({ g: x.rate }, x)).concat(r.zero.map(z => ({ g: z.code, kh: z.l.kh, hd: z.l.hd, date: z.l.nhd || z.l.date, name: (KT.S.partners.find(q => q.code === z.l.pt) || {}).name || z.l.pt || '', mst: (KT.S.partners.find(q => q.code === z.l.pt) || {}).mst || '', base: z.base, tax: 0, l: z.l })))
    : r.inn.map(x => Object.assign({ g: x.eligible ? 'DK' : 'KDK' }, x));
  const groups = isOut ? GROUPS_OUT : [['DK', '1. Hàng hóa, dịch vụ dùng riêng cho SXKD chịu thuế GTGT đủ điều kiện khấu trừ thuế'], ['KDK', '2. Hàng hóa, dịch vụ không đủ điều kiện khấu trừ']];
  let stt = 0, tb = 0, tt = 0; let body = '';
  groups.forEach(([g, name]) => {
    const a = items.filter(x => x.g === g); if (!a.length && !isOut) return;
    body += '<tr><td colspan="10" style="' + BB + '">' + name + '</td></tr>';
    a.forEach(x => { stt++; tb += x.base; tt += x.tax; body += '<tr><td style="' + BC + '">' + stt + '</td><td style="' + BC + '">' + E(x.l && x.l.mau || '1') + '</td><td style="' + BC + '">' + E(x.kh || '') + '</td><td style="' + BC + '">' + E(x.hd || '') + '</td><td style="' + BC + '">' + D.fmt(x.date) + '</td><td style="' + B + '">' + E(x.name || '') + '</td><td style="' + BC + '">' + E(x.mst || '') + '</td><td style="' + BR + '">' + f(x.base) + '</td><td style="' + BR + '">' + f(x.tax) + '</td><td style="' + B + ';font-size:11px">' + E(x.eligible === false ? x.reason : '') + '</td></tr>'; });
    if (!a.length) body += '<tr><td colspan="10" style="' + B + ';text-align:center;font-style:italic">Không có</td></tr>';
    body += '<tr><td colspan="7" style="' + BB + '">Tổng</td><td style="' + BR + ';font-weight:700">' + f(a.reduce((s, x) => s + x.base, 0)) + '</td><td style="' + BR + ';font-weight:700">' + f(a.reduce((s, x) => s + x.tax, 0)) + '</td><td style="' + B + '"></td></tr>';
  });
  return wrap(banner(isOut ? '01-1/GTGT' : '01-2/GTGT', '(Kèm theo tờ khai 01/GTGT; ' + (lawName('gtgt', p.to) || 'Thông tư số 80/2021/TT-BTC') + ')') +
    '<h2 style="text-align:center;margin:12px 0 2px;font-size:18px">BẢNG KÊ HÓA ĐƠN, CHỨNG TỪ HÀNG HÓA, DỊCH VỤ ' + (isOut ? 'BÁN RA' : 'MUA VÀO') + '</h2><div style="text-align:center"><i>(Kèm theo tờ khai thuế GTGT mẫu số 01/GTGT)</i><br>Kỳ tính thuế: ' + kyLabel(c.kyGTGT === 'quy' ? 'quy' : 'thang', p.from) + '</div>' +
    '<p>Tên người nộp thuế: <b>' + E(c.name) + '</b><br>Mã số thuế: <b>' + E(c.mst || '') + '</b></p><div style="text-align:right"><i>Đơn vị tiền: đồng Việt Nam</i></div>' +
    '<table style="width:100%;border-collapse:collapse;font-size:12px"><thead><tr><th rowspan="2" style="' + BC + '">STT</th><th colspan="4" style="' + BC + '">Hóa đơn, chứng từ, biên lai nộp thuế</th><th rowspan="2" style="' + BC + '">Tên người ' + (isOut ? 'mua' : 'bán') + '</th><th rowspan="2" style="' + BC + '">Mã số thuế người ' + (isOut ? 'mua' : 'bán') + '</th><th rowspan="2" style="' + BC + '">Doanh số ' + (isOut ? 'bán chưa có thuế' : 'mua chưa có thuế') + '</th><th rowspan="2" style="' + BC + '">Thuế GTGT' + (isOut ? '' : ' đủ điều kiện khấu trừ') + '</th><th rowspan="2" style="' + BC + '">Ghi chú</th></tr><tr><th style="' + BC + '">Ký hiệu mẫu</th><th style="' + BC + '">Ký hiệu</th><th style="' + BC + '">Số</th><th style="' + BC + '">Ngày, tháng, năm</th></tr><tr>' + ['(1)', '(2)', '(3)', '(4)', '(5)', '(6)', '(7)', '(8)', '(9)', '(10)'].map(x => '<td style="' + BC + ';font-style:italic">' + x + '</td>').join('') + '</tr></thead><tbody>' + body +
    '<tr><td colspan="7" style="' + BB + '">Tổng cộng</td><td style="' + BR + ';font-weight:700">' + f(tb) + '</td><td style="' + BR + ';font-weight:700">' + f(tt) + '</td><td style="' + B + '"></td></tr></tbody></table>' +
    '<p style="margin:8px 0 0"><i>Tôi cam đoan số liệu khai trên là đúng và chịu trách nhiệm trước pháp luật về những số liệu đã khai./.</i></p>' + sign(['', ''], ['NGƯỜI NỘP THUẾ hoặc ĐẠI DIỆN HỢP PHÁP', '(Ký, ghi rõ họ tên; chức vụ và đóng dấu (nếu có))', c.giamDoc]));
};
F2.bkBan = r => bk(r, 'out'); F2.bkMua = r => bk(r, 'in');

/* ====================== 03/TNDN ====================== */
F2.tndn = year => {
  const c = co(), T = KT.tax, x = T.cit(year), v = x, n = k => KT.num(v[k]); const [y0, y1] = KT.d.yRange(year);
  const row = (code, name, val, bold, ind) => '<tr><td style="' + BC + '">' + code + '</td><td style="' + B + (bold ? ';font-weight:700' : '') + (ind ? ';padding-left:' + (6 + ind * 14) + 'px' : '') + '">' + name + '</td><td style="' + BR + (bold ? ';font-weight:700' : '') + '">' + f(val) + '</td></tr>';
  const sec = (a, b) => '<tr><td style="' + BC + '"><b>' + a + '</b></td><td colspan="2" style="' + BB + '">' + b + '</td></tr>';
  return wrap(banner('03/TNDN', '(Ban hành kèm theo ' + (lawName('tndn', y1) || 'Thông tư số 80/2021/TT-BTC') + ' của Bộ trưởng Bộ Tài chính)') +
    '<h2 style="text-align:center;margin:12px 0 2px;font-size:19px">TỜ KHAI QUYẾT TOÁN THUẾ THU NHẬP DOANH NGHIỆP</h2><div style="text-align:center"><i>(Áp dụng cho người nộp thuế khai quyết toán thuế thu nhập doanh nghiệp)</i></div>' +
    '<div style="text-align:center;margin:6px 0">[01] Kỳ tính thuế: Năm ' + year + ' (từ ngày ' + D.fmt(y0) + ' đến ngày ' + D.fmt(y1) + ')</div><div style="text-align:center">[02] Lần đầu: [X] &nbsp; [03] Bổ sung lần thứ: [ &nbsp;]</div>' + nnt() +
    '<div style="text-align:right"><i>Đơn vị tiền: đồng Việt Nam</i></div><table style="width:100%;border-collapse:collapse"><thead><tr><th style="' + BC + ';width:60px">Mã</th><th style="' + BC + '">Chỉ tiêu</th><th style="' + BC + ';width:150px">Số tiền</th></tr></thead><tbody>' +
    sec('A', 'Kết quả kinh doanh ghi nhận theo báo cáo tài chính') + row('A1', 'Tổng lợi nhuận kế toán trước thuế thu nhập doanh nghiệp', n('A1'), 1) +
    sec('B', 'Xác định thu nhập chịu thuế theo Luật thuế thu nhập doanh nghiệp') + row('B1', 'Điều chỉnh tăng tổng lợi nhuận trước thuế thu nhập doanh nghiệp (B1 = B2 + B3 + B4 + B5 + B6 + B7)', n('B1'), 1) +
    row('B2', 'Các khoản điều chỉnh tăng doanh thu', n('B2'), 0, 1) + row('B3', 'Chi phí của phần doanh thu điều chỉnh giảm', n('B3'), 0, 1) + row('B4', 'Các khoản chi không được trừ khi xác định thu nhập chịu thuế', n('B4'), 0, 1) + row('B5', 'Thuế thu nhập đã nộp cho phần thu nhập nhận được ở nước ngoài', n('B5'), 0, 1) + row('B6', 'Điều chỉnh tăng lợi nhuận do xác định giá thị trường đối với giao dịch liên kết', n('B6'), 0, 1) + row('B7', 'Các khoản điều chỉnh làm tăng lợi nhuận trước thuế khác', n('B7'), 0, 1) +
    row('B8', 'Điều chỉnh giảm tổng lợi nhuận trước thuế thu nhập doanh nghiệp (B8 = B9 + B10 + B11)', n('B8'), 1) + row('B9', 'Giảm trừ các khoản doanh thu đã tính thuế kỳ trước', n('B9'), 0, 1) + row('B10', 'Chi phí của phần doanh thu điều chỉnh tăng', n('B10'), 0, 1) + row('B11', 'Các khoản điều chỉnh làm giảm lợi nhuận trước thuế khác', n('B11'), 0, 1) +
    row('B12', 'Tổng thu nhập chịu thuế (B12 = A1 + B1 - B8)', n('B12'), 1) + row('B13', 'Thu nhập chịu thuế từ hoạt động sản xuất kinh doanh (B13 = B12 - B14)', n('B13'), 0, 1) + row('B14', 'Thu nhập chịu thuế từ hoạt động chuyển nhượng bất động sản, dự án đầu tư', n('B14'), 0, 1) +
    sec('C', 'Xác định thuế thu nhập doanh nghiệp phải nộp từ hoạt động sản xuất kinh doanh') + row('C1', 'Thu nhập chịu thuế (C1 = B13)', n('C1'), 1) + row('C2', 'Thu nhập miễn thuế', n('C2'), 0, 1) + row('C3', 'Lỗ từ các năm trước chuyển sang (tối đa 5 năm)', n('C3'), 0, 1) + row('C4', 'Thu nhập tính thuế (C4 = C1 - C2 - C3)', n('C4'), 1) +
    row('C5', 'Trích lập quỹ khoa học và công nghệ (nếu có)', n('C5'), 0, 1) + row('C6', 'Thu nhập tính thuế sau khi trích lập quỹ (C6 = C4 - C5)', n('C6'), 0, 1) + '<tr><td style="' + BC + '">C7</td><td style="' + B + ';padding-left:20px">Thuế suất thuế thu nhập doanh nghiệp (%)</td><td style="' + BR + '">' + String(Math.round(KT.num(v.rate) * 10000) / 100).replace('.', ',') + '</td></tr>' +
    row('C8', 'Thuế thu nhập doanh nghiệp từ hoạt động sản xuất kinh doanh tính theo thuế suất (C8 = C6 × C7)', n('C8'), 0, 1) + row('C9', 'Thuế thu nhập doanh nghiệp được miễn, giảm', n('C9'), 0, 1) + row('C11', 'Thuế thu nhập đã nộp ở ngoài Việt Nam được trừ', n('C11'), 0, 1) + row('C12', 'Thuế thu nhập doanh nghiệp phải nộp (C12 = C8 - C9 - C11)', n('C12'), 1) +
    sec('D', 'Tổng số thuế thu nhập doanh nghiệp đã tạm nộp, điều chỉnh và còn phải nộp') + row('G', 'Thuế thu nhập doanh nghiệp đã tạm nộp trong năm', n('G'), 0, 1) + row('G1', 'Điều chỉnh thuế đã nộp (nếu có)', n('G1'), 0, 1) + row('H', 'Thuế thu nhập doanh nghiệp còn phải nộp (H = C12 - G - G1); số âm là nộp thừa', n('H'), 1) + '</tbody></table>' +
    '<p style="font-size:12px"><i>Chưa lập kèm: các phụ lục 03-1A/TNDN (kết quả kinh doanh), 03-2/TNDN (chuyển lỗ) và các phụ lục khác theo mẫu. Lập bằng HTKK hoặc khi nộp tờ khai.</i></p>' +
    '<p style="margin:8px 0 0">Tôi cam đoan số liệu khai trên là đúng và chịu trách nhiệm trước pháp luật về những số liệu đã khai./.</p>' + sign(['NHÂN VIÊN ĐẠI LÝ THUẾ', '', ''], ['NGƯỜI NỘP THUẾ hoặc ĐẠI DIỆN HỢP PHÁP', '(Ký, ghi rõ họ tên; chức vụ và đóng dấu (nếu có))', c.giamDoc]));
};

/* ====================== 05/KK-TNCN ====================== */
F2.tncn = per => {
  const c = co(), H = KT.hr, T = KT.tax; const rows = []; T.periods('thang', per.from, per.to).forEach(x => H.month(x.key).rows.forEach(r => rows.push(r)));
  const by = {}; rows.forEach(r => { const o = by[r.e.code] = by[r.e.code] || { e: r.e, tnct: 0, bh: 0, gc: 0, tntt: 0, thue: 0, tong: 0 }; o.tong += r.c.tong; o.tnct += r.c.tnct; o.bh += r.c.bhNLD; o.gc += r.c.giamTruGC; o.tntt += r.c.tntt; o.thue += r.c.tncn; });
  const a = Object.values(by), nr = o => !/kh[oô]ng/i.test(o.e.cuTru || ''), sum = (arr, k) => arr.reduce((s, x) => s + x[k], 0);
  const ded = a.filter(x => x.thue > 0), res = a.filter(nr), non = a.filter(x => !nr(x)), dres = ded.filter(nr), dnon = ded.filter(x => !nr(x));
  const L = [['[16]', 'Tổng số người lao động', a.length, 1], ['[17]', 'Cá nhân cư trú có hợp đồng lao động', res.length, 1], ['[18]', 'Tổng số cá nhân đã khấu trừ thuế ([18]=[19]+[20])', ded.length, 1], ['[19]', 'Cá nhân cư trú', dres.length, 1, 1], ['[20]', 'Cá nhân không cư trú', dnon.length, 1, 1],
    ['[21]', 'Tổng thu nhập chịu thuế trả cho cá nhân ([21]=[22]+[23])', sum(a, 'tnct')], ['[22]', 'Cá nhân cư trú', sum(res, 'tnct'), 0, 1], ['[23]', 'Cá nhân không cư trú', sum(non, 'tnct'), 0, 1],
    ['[26]', 'Tổng thu nhập chịu thuế trả cho cá nhân thuộc diện phải khấu trừ thuế ([26]=[27]+[28])', sum(ded, 'tnct')], ['[27]', 'Cá nhân cư trú', sum(dres, 'tnct'), 0, 1], ['[28]', 'Cá nhân không cư trú', sum(dnon, 'tnct'), 0, 1],
    ['[29]', 'Tổng số thuế thu nhập cá nhân đã khấu trừ ([29]=[30]+[31])', sum(ded, 'thue'), 0, 0, 1], ['[30]', 'Cá nhân cư trú', sum(dres, 'thue'), 0, 1], ['[31]', 'Cá nhân không cư trú', sum(dnon, 'thue'), 0, 1]];
  const ky = c.kyTNCN === 'quy' ? 'Quý ' + Math.ceil(+per.from.slice(5, 7) / 3) + ' năm ' + per.from.slice(0, 4) : 'Tháng ' + per.from.slice(5, 7) + ' năm ' + per.from.slice(0, 4);
  return wrap(banner('05/KK-TNCN', '(Ban hành kèm theo ' + (lawName('tncn', per.to) || 'Thông tư số 80/2021/TT-BTC') + ' của Bộ trưởng Bộ Tài chính)') +
    '<h2 style="text-align:center;margin:12px 0 2px;font-size:19px">TỜ KHAI KHẤU TRỪ THUẾ THU NHẬP CÁ NHÂN</h2><div style="text-align:center"><i>(Dành cho tổ chức, cá nhân trả thu nhập từ tiền lương, tiền công)</i></div><div style="text-align:center;margin:6px 0">[01] Kỳ tính thuế: <b>' + ky + '</b> &nbsp; [02] Lần đầu: [X] &nbsp; [03] Bổ sung lần thứ: [ &nbsp;]</div>' + nnt() +
    '<div style="text-align:right"><i>Đơn vị tiền: đồng Việt Nam</i></div><table style="width:100%;border-collapse:collapse"><thead><tr><th style="' + BC + ';width:44px">STT</th><th style="' + BC + '">Chỉ tiêu</th><th style="' + BC + ';width:70px">Mã chỉ tiêu</th><th style="' + BC + ';width:150px">Số người, số tiền</th></tr></thead><tbody>' +
    L.map((x, i) => '<tr><td style="' + BC + '">' + (x[4] ? '' : i + 1 - L.slice(0, i).filter(y => y[4]).length) + '</td><td style="' + B + (x[4] ? ';padding-left:24px' : '') + '">' + x[1] + '</td><td style="' + BC + '">' + x[0] + '</td><td style="' + BR + '">' + (x[3] ? KT.fq(x[2]) : f(x[2])) + '</td></tr>').join('') + '</tbody></table>' +
    '<p style="font-size:12px"><i>“Thuộc diện phải khấu trừ” tính cho người có thuế khấu trừ lớn hơn 0 trong kỳ; không cư trú theo cột Cư trú trong hồ sơ lao động. Các chỉ tiêu còn lại của mẫu (nếu có phát sinh) lập thêm trên HTKK.</i></p>' +
    '<p style="margin:8px 0 0">Tôi cam đoan số liệu khai trên là đúng và chịu trách nhiệm trước pháp luật về những số liệu đã khai./.</p>' + sign(['NHÂN VIÊN ĐẠI LÝ THUẾ', '', ''], ['NGƯỜI NỘP THUẾ hoặc ĐẠI DIỆN HỢP PHÁP', '(Ký, ghi rõ họ tên; chức vụ và đóng dấu (nếu có))', c.giamDoc]) +
    '<div style="page-break-before:always"></div><h3 style="text-align:center">BẢNG KÊ CÁ NHÂN CÓ THU NHẬP TRONG KỲ</h3><div style="text-align:center">(Kèm tờ khai 05/KK-TNCN – ' + ky + ')</div><table style="width:100%;border-collapse:collapse;font-size:12px;margin-top:8px"><thead><tr>' + ['STT', 'Họ và tên', 'Mã số thuế', 'Số CCCD', 'Thu nhập chịu thuế', 'Bảo hiểm bắt buộc', 'Giảm trừ gia cảnh', 'Thu nhập tính thuế', 'Thuế TNCN đã khấu trừ'].map(h => '<th style="' + BC + '">' + h + '</th>').join('') + '</tr></thead><tbody>' +
    a.map((x, i) => '<tr><td style="' + BC + '">' + (i + 1) + '</td><td style="' + B + '">' + E(x.e.name) + '</td><td style="' + BC + '">' + E(x.e.mst || '') + '</td><td style="' + BC + '">' + E(x.e.cccd || '') + '</td><td style="' + BR + '">' + f(x.tnct) + '</td><td style="' + BR + '">' + f(x.bh) + '</td><td style="' + BR + '">' + f(x.gc) + '</td><td style="' + BR + '">' + f(x.tntt) + '</td><td style="' + BR + '">' + f(x.thue) + '</td></tr>').join('') +
    '<tr><td colspan="4" style="' + BB + '">Cộng</td>' + ['tnct', 'bh', 'gc', 'tntt', 'thue'].map(k => '<td style="' + BR + ';font-weight:700">' + f(sum(a, k)) + '</td>').join('') + '</tr></tbody></table>');
};

/* ====================== 01/MBAI ====================== */
F2.monbai = year => {
  const c = co(), m = KT.tax.monBai(year), von = m.von;
  const row = (a, b) => '<tr><td style="' + B + '">' + a + '</td><td style="' + BR + '">' + b + '</td></tr>';
  return wrap(banner('01/MBAI', '(Ban hành kèm theo ' + TT80 + ' của Bộ trưởng Bộ Tài chính)') +
    '<h2 style="text-align:center;margin:12px 0 2px;font-size:19px">TỜ KHAI LỆ PHÍ MÔN BÀI</h2><div style="text-align:center;margin:6px 0">[01] Kỳ tính thuế: Năm <b>' + year + '</b> &nbsp; [02] Lần đầu: [X] &nbsp; [03] Bổ sung lần thứ: [ &nbsp;]</div>' + nnt() +
    '<table style="width:100%;border-collapse:collapse;margin-top:8px"><thead><tr><th style="' + BC + '">Chỉ tiêu</th><th style="' + BC + ';width:200px">Giá trị</th></tr></thead><tbody>' +
    row('Ngày đăng ký thành lập / bắt đầu hoạt động', c.ngayDangKy ? D.fmt(c.ngayDangKy) : '') + row('Vốn điều lệ ghi trong đăng ký (đồng)', f(von)) +
    row('Mức lệ phí môn bài theo quy định (đồng/năm): ' + (von > 10e9 ? 'vốn trên 10 tỷ đồng' : 'vốn từ 10 tỷ đồng trở xuống'), f(von > 10e9 ? KT.S.legal.monBai.von10ty : KT.S.legal.monBai.duoi10ty)) +
    row('Miễn lệ phí năm đầu thành lập', m.mienNamDau ? 'Có' : 'Không') + '<tr><td style="' + BB + '">Số lệ phí môn bài phải nộp (đồng)</td><td style="' + BR + ';font-weight:700">' + f(m.muc) + '</td></tr>' +
    row('Hạn nộp tờ khai và nộp tiền', D.fmt(m.hanNop)) + row('Đã nộp theo sổ kế toán (đồng)', f(m.paid)) + '</tbody></table>' +
    '<p style="margin:8px 0 0">Tôi cam đoan số liệu khai trên là đúng và chịu trách nhiệm trước pháp luật về những số liệu đã khai./.</p>' + sign(['NHÂN VIÊN ĐẠI LÝ THUẾ', '', ''], ['NGƯỜI NỘP THUẾ hoặc ĐẠI DIỆN HỢP PHÁP', '(Ký, ghi rõ họ tên; chức vụ và đóng dấu (nếu có))', c.giamDoc]));
};

/* ====================== 05/QTT-TNCN ====================== */
F2.qtt = year => {
  const c = co(), q = KT.hr.qtt(year), sum = (a, k) => a.reduce((s, x) => s + x[k], 0), nr = x => !/kh[oô]ng/i.test(x.e.cuTru || ''), ded = q.filter(x => x.daKT > 0);
  const L = [['[21]', 'Tổng số người lao động', q.length, 1], ['[22]', 'Cá nhân cư trú có hợp đồng lao động', q.filter(nr).length, 1, 1], ['[23]', 'Cá nhân không cư trú', q.filter(x => !nr(x)).length, 1, 1], ['[24]', 'Tổng số cá nhân đã khấu trừ thuế', ded.length, 1],
    ['[25]', 'Tổng thu nhập chịu thuế trả cho cá nhân', sum(q, 'tnct')], ['[26]', 'Tổng các khoản giảm trừ (bảo hiểm bắt buộc, giảm trừ gia cảnh)', sum(q, 'bh') + sum(q, 'gc')], ['[27]', 'Tổng thu nhập tính thuế', sum(q, 'tntt')],
    ['[28]', 'Tổng số thuế thu nhập cá nhân phải nộp theo quyết toán', sum(q, 'thue'), 0, 0, 1], ['[29]', 'Tổng số thuế đã khấu trừ trong năm', sum(q, 'daKT'), 0, 0, 1], ['[30]', 'Chênh lệch: nộp thêm (+) hoặc nộp thừa (−)', sum(q, 'chenh'), 0, 0, 1]];
  const sg = (a, b, d) => sign(['NHÂN VIÊN ĐẠI LÝ THUẾ', '', ''], ['NGƯỜI NỘP THUẾ hoặc ĐẠI DIỆN HỢP PHÁP', '(Ký, ghi rõ họ tên; chức vụ và đóng dấu (nếu có))', c.giamDoc]);
  return wrap(banner('05/QTT-TNCN', '(Ban hành kèm theo ' + TT80 + ' của Bộ trưởng Bộ Tài chính)') +
    '<h2 style="text-align:center;margin:12px 0 2px;font-size:19px">TỜ KHAI QUYẾT TOÁN THUẾ THU NHẬP CÁ NHÂN</h2><div style="text-align:center"><i>(Dành cho tổ chức, cá nhân trả thu nhập từ tiền lương, tiền công)</i></div><div style="text-align:center;margin:6px 0">[01] Kỳ tính thuế: Năm <b>' + year + '</b> &nbsp; [02] Lần đầu: [X] &nbsp; [03] Bổ sung lần thứ: [ &nbsp;]</div>' + nnt() +
    '<div style="text-align:right"><i>Đơn vị tiền: đồng Việt Nam</i></div><table style="width:100%;border-collapse:collapse"><thead><tr><th style="' + BC + ';width:44px">STT</th><th style="' + BC + '">Chỉ tiêu</th><th style="' + BC + ';width:70px">Mã chỉ tiêu</th><th style="' + BC + ';width:150px">Số người, số tiền</th></tr></thead><tbody>' +
    L.map((x, i) => '<tr><td style="' + BC + '">' + (x[4] ? '' : i + 1 - L.slice(0, i).filter(y => y[4]).length) + '</td><td style="' + B + (x[4] ? ';padding-left:24px' : '') + '">' + x[1] + '</td><td style="' + BC + '">' + x[0] + '</td><td style="' + BR + '">' + (x[3] ? KT.fq(x[2]) : f(x[2])) + '</td></tr>').join('') + '</tbody></table>' +
    '<p style="margin:8px 0 0">Tôi cam đoan số liệu khai trên là đúng và chịu trách nhiệm trước pháp luật về những số liệu đã khai./.</p>' + sg() +
    '<div style="page-break-before:always"></div><h3 style="text-align:center">PHỤ LỤC BẢNG KÊ CHI TIẾT CÁ NHÂN QUYẾT TOÁN – NĂM ' + year + '</h3><table style="width:100%;border-collapse:collapse;font-size:12px;margin-top:8px"><thead><tr>' + ['STT', 'Họ và tên', 'Mã số thuế', 'Số CCCD', 'Số tháng', 'Thu nhập chịu thuế', 'Bảo hiểm bắt buộc', 'Giảm trừ gia cảnh', 'Thu nhập tính thuế', 'Thuế phải nộp', 'Thuế đã khấu trừ', 'Còn phải nộp (+/−)'].map(h => '<th style="' + BC + '">' + h + '</th>').join('') + '</tr></thead><tbody>' +
    q.map((x, i) => '<tr><td style="' + BC + '">' + (i + 1) + '</td><td style="' + B + '">' + E(x.e.name) + '</td><td style="' + BC + '">' + E(x.e.mst || '') + '</td><td style="' + BC + '">' + E(x.e.cccd || '') + '</td><td style="' + BC + '">' + x.months + '</td>' + ['tnct', 'bh', 'gc', 'tntt', 'thue', 'daKT', 'chenh'].map(k => '<td style="' + BR + '">' + f(x[k]) + '</td>').join('') + '</tr>').join('') +
    '<tr><td colspan="5" style="' + BB + '">Cộng</td>' + ['tnct', 'bh', 'gc', 'tntt', 'thue', 'daKT', 'chenh'].map(k => '<td style="' + BR + ';font-weight:700">' + f(sum(q, k)) + '</td>').join('') + '</tr></tbody></table>');
};

/* ====================== D02-LT (BHXH) ====================== */
F2.d02 = ym => {
  const c = co(), d = KT.hr.d02(ym), bh = KT.hr.bhMonth(ym), th = h => '<th style="' + BC + '">' + h + '</th>', ky = ym.slice(5) + '/' + ym.slice(0, 4);
  return wrap('<table style="width:100%"><tr><td><b>Tên đơn vị: ' + E(c.name) + '</b><br>Mã số thuế: ' + E(c.mst || '') + '<br>Địa chỉ: ' + E(c.address || '') + '</td><td style="text-align:right;vertical-align:top"><b>Mẫu số D02-LT</b><br><i style="font-size:12px">(Ban hành kèm theo Quyết định số 595/QĐ-BHXH ngày 14/4/2017 của Bảo hiểm xã hội Việt Nam)</i></td></tr></table>' +
    '<h2 style="text-align:center;margin:12px 0 2px;font-size:18px">DANH SÁCH LAO ĐỘNG THAM GIA BHXH, BHYT, BHTN, BHTNLĐ, BNN</h2><div style="text-align:center">Tháng ' + ky + '</div>' +
    '<h4 style="margin:10px 0 4px">I. Danh sách lao động đang tham gia, tăng, điều chỉnh mức đóng</h4><table style="width:100%;border-collapse:collapse;font-size:12px"><thead><tr>' + ['STT', 'Họ và tên', 'Mã số BHXH', 'Số CCCD', 'Chức danh', 'Mức tiền lương đóng BHXH', 'Mức đóng BHTN', 'NLĐ đóng', 'NSDLĐ đóng', 'Ghi chú'].map(th).join('') + '</tr></thead><tbody>' +
    d.rows.map(r => '<tr><td style="' + BC + '">' + r.stt + '</td><td style="' + B + '">' + E(r.ten) + '</td><td style="' + BC + '">' + E(r.so) + '</td><td style="' + BC + '">' + E(r.cccd) + '</td><td style="' + B + '">' + E(r.chucDanh) + '</td><td style="' + BR + '">' + f(r.baseBH) + '</td><td style="' + BR + '">' + f(r.baseTN) + '</td><td style="' + BR + '">' + f(r.nld) + '</td><td style="' + BR + '">' + f(r.nsd) + '</td><td style="' + B + '">' + E(r.ghi) + '</td></tr>').join('') +
    '<tr><td colspan="7" style="' + BB + '">Cộng</td><td style="' + BR + ';font-weight:700">' + f(bh.nld) + '</td><td style="' + BR + ';font-weight:700">' + f(bh.nsd) + '</td><td style="' + B + '"></td></tr></tbody></table>' +
    '<h4 style="margin:10px 0 4px">II. Lao động giảm</h4><table style="width:60%;border-collapse:collapse;font-size:12px"><thead><tr>' + ['STT', 'Họ và tên', 'Mã số BHXH', 'Ghi chú'].map(th).join('') + '</tr></thead><tbody>' +
    (d.giam.length ? d.giam.map((r, i) => '<tr><td style="' + BC + '">' + (i + 1) + '</td><td style="' + B + '">' + E(r.ten) + '</td><td style="' + BC + '">' + E(r.so) + '</td><td style="' + B + '">' + E(r.ghi) + '</td></tr>').join('') : '<tr><td colspan="4" style="' + BC + '">Không có</td></tr>') + '</tbody></table>' +
    '<p style="font-size:12px"><i>Kinh phí công đoàn 2% quỹ lương đóng BHXH: ' + f(bh.kpcd) + ' đồng. Tổng số phải nộp BHXH, BHYT, BHTN: ' + f(bh.total) + ' đồng.</i></p>' + sign(['NGƯỜI LẬP BIỂU', '(Ký, họ tên)', c.ktt], ['', '', ''], ['THỦ TRƯỞNG ĐƠN VỊ', '(Ký, họ tên, đóng dấu)', c.giamDoc]));
};

/* ====================== KHUNG SỔ KẾ TOÁN CHUNG ====================== */
const isNum = c => KT.ui && KT.ui.isNumCol ? KT.ui.isNumCol(c) : /[tT]hu|[cC]hi|[tT]ồn|[nN]ợ|[cC]ó|[sS]ố tiền|[sS]L|[gG]iá/.test(c.t);
F2.book = r => {
  const c = co(), per = r.period || {}; const cols = r.cols || [];
  if (!cols.length) return '';
  const letters = ['A', 'B', 'C', 'D', 'E', 'G', 'H'], mk = i => i < 5 ? letters[i] : String(i - 4);
  const cell = (col, v) => col.f === 'd' ? D.fmt(v) : isNum(col) && typeof v === 'number' ? (col.f === 'q' ? KT.fq(v) : col.f === '%' ? String(v) : f(v)) : E(v == null ? '' : v);
  return wrap('<table style="width:100%"><tr><td><b>Đơn vị: ' + E(c.name) + '</b><br>Địa chỉ: ' + E(c.address || '') + '<br>Mã số thuế: ' + E(c.mst || '') + '</td><td style="text-align:center;width:46%"><b>Mẫu số ' + E(r.form || '') + '</b><br><i style="font-size:12px">(Ban hành kèm theo Thông tư số 99/2025/TT-BTC của Bộ trưởng Bộ Tài chính)</i></td></tr></table>' +
    '<div style="text-align:center;margin:10px 0"><h2 style="margin:0;font-size:19px">' + E((r.title || '').toUpperCase()) + '</h2>' + (r.sub ? '<div>' + E(r.sub) + '</div>' : '') + '<i>' + (per.from ? 'Từ ngày ' + D.fmt(per.from) + ' đến ngày ' + D.fmt(per.to) : 'Tại ngày ' + D.fmt(r.date || per.to || '')) + '</i></div><div style="text-align:right"><i>Đơn vị tính: đồng</i></div>' +
    '<table style="width:100%;border-collapse:collapse;font-size:12px"><thead><tr>' + cols.map(col => '<th style="' + BC + '">' + E(col.t) + '</th>').join('') + '</tr><tr>' + cols.map((_, i) => '<td style="' + BC + ';font-style:italic">' + mk(i) + '</td>').join('') + '</tr></thead><tbody>' +
    r.rows.map(row => { const bd = row._cls === 'tot' || row._cls === 'sub' || row._cls === 'grp' ? ';font-weight:700' : ''; return '<tr>' + cols.map(col => '<td style="' + (isNum(col) ? BR : B) + bd + '">' + cell(col, row[col.k]) + '</td>').join('') + '</tr>'; }).join('') + '</tbody></table>' +
    '<div style="margin-top:8px">- Sổ này có ... trang, đánh số từ trang 01 đến trang ...<br>- Ngày mở sổ: ' + D.fmt(c.fyStart || '') + '</div>' + sign(['Người ghi sổ'].concat(['', c.nguoiLap]), ['Kế toán trưởng', '(Ký, họ tên)', c.ktt], ['Giám đốc', '(Ký, họ tên, đóng dấu)', c.giamDoc]));
};
})(typeof window !== "undefined" ? window : globalThis);
