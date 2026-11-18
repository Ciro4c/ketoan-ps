/* ===== GIAO DIỆN 6: chứng từ lương, thưởng, bảo hiểm (in và xuất Excel) + rà soát hồ sơ nhân sự ===== */
(function (G) {
'use strict';
const KT = G.KT, UI = KT.ui, D = KT.d, E = KT.esc, S = () => KT.S, H = KT.hr, F = KT.f;
const ym0 = () => UI.P().to.slice(0, 7);
const TH = 'border:1px solid #000;padding:3px 5px', TD = 'border:1px solid #000;padding:3px 5px', TR = TD + ';text-align:right';
const co = () => S().company;
const head = (code, name) => '<div style="display:flex;justify-content:space-between;gap:16px"><div><b>' + E(co().name || 'Tên đơn vị') + '</b><br>' + E(co().address || '') + (co().mst ? '<br>MST: ' + E(co().mst) : '') + '</div><div style="text-align:center">' + (code ? '<b>Mẫu số ' + code + '</b><br>' : '') + '<i>(Mẫu tham khảo, đơn vị được tự thiết kế theo Luật Kế toán)</i></div></div>';
const ttl = (t, ym, extra) => '<div style="text-align:center;margin:12px 0"><h2 style="font-size:19px;margin:0">' + t + '</h2><i>Tháng ' + ym.slice(5) + ' năm ' + ym.slice(0, 4) + '</i>' + (extra ? '<br>' + extra : '') + '</div>';
const sig = a => '<div style="display:flex;justify-content:space-around;text-align:center;margin-top:16px">' + a.map(x => '<div><b>' + x[0] + '</b><br><i>(Ký, họ tên)</i><br><br><br>' + E(x[1] || '') + '</div>').join('') + '</div>';
const wrap = h => '<div style="font:13px/1.45 \'Times New Roman\',serif;color:#000;background:#fff;padding:14px">' + h + '</div>';
const tbl = (cols, rows, foot, o) => { o = o || {}; const fs = o.fs ? 'font-size:' + o.fs + ';' : '', cell = (v, b) => '<td style="' + (typeof v === 'number' ? TR : TD) + (b ? ';font-weight:700' : '') + '">' + (typeof v === 'number' ? F(v) : E(v)) + '</td>';
  return '<table style="width:100%;border-collapse:collapse;margin-top:6px;' + fs + '">' + (o.head || '<tr>' + cols.map(c => '<th style="' + TH + '">' + c + '</th>').join('') + '</tr>') + rows.map(r => r._g ? '<tr><td colspan="' + cols.length + '" style="' + TD + ';background:#eee;font-weight:700">' + E(r._g) + '</td></tr>' : r._s ? '<tr>' + r._s.map(v => cell(v, 1)).join('') + '</tr>' : '<tr>' + r.map(v => cell(v)).join('') + '</tr>').join('') + (foot ? '<tr>' + foot.map(v => cell(v, 1)).join('') + '</tr>' : '') + '</table>'; };
const sum = (rows, i) => rows.reduce((s, r) => s + (Array.isArray(r) ? (r[i] || 0) : 0), 0);

const DOC = {
  tl: { code: '01-LĐTL', name: 'Bảng thanh toán tiền lương', land: true, build: ym => {
    const m = H.month(ym), lg = H.legalAt(ym), pc = x => (x * 100).toFixed(1).replace('.', ',').replace(/,0$/, '') + '%';
    const NC = 29; const line = (x, i) => [i, x.e.name, x.e.chucDanh || '', x.e.boPhan || '', KT.num(x.e.luongCB), x.c.cong + '/' + m.std, x.c.luongCB, x.c.phuCapLuong + x.c.khoan.filter(q => q.bh).reduce((t, q) => t + q.amt, 0), x.c.anTrua + x.c.phuCapKhac + x.c.khoan.filter(q => !q.bh).reduce((t, q) => t + q.amt, 0), x.c.thuong, x.c.ot, KT.num(x.rec.thuNhapKhac) + x.c.mienKhac, x.c.tong, x.c.baseBH, x.c.nld.bhxh, x.c.nld.bhyt, x.c.nld.bhtn, x.c.bhNLD, x.c.mienThue, x.c.tnct, KT.num(x.c.giamTruGC ? lg.gt.ban : 0), x.c.giamTruGC - lg.gt.ban, x.c.bhTN, x.c.tntt, x.c.tncn, x.c.ung, x.c.khauTruKhac, x.c.thucLinh, ''];
    const NUM = [4, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27]; const tot = rs => { const t = Array(NC).fill(''); NUM.forEach(i => { t[i] = rs.reduce((a, r) => a + (r[i] || 0), 0); }); return t; };
    const groups = new Map(); m.rows.forEach(x => { const g = x.e.boPhan || 'Chưa phân bộ phận'; if (!groups.has(g)) groups.set(g, []); groups.get(g).push(x); });
    const rows = []; const all = []; let n = 0;
    for (const [g, xs] of groups) { rows.push({ _g: 'Bộ phận: ' + g + ' (' + xs.length + ' người)' }); const rr = xs.map(x => line(x, ++n)); rr.forEach(r => { rows.push(r); all.push(r); }); if (groups.size > 1) { const t = tot(rr); t[1] = 'Cộng ' + g; rows.push({ _s: t }); } }
    const foot = tot(all); foot[1] = 'TỔNG CỘNG'; const head = '<tr><th rowspan="2" style="' + TH + '">STT</th><th rowspan="2" style="' + TH + '">Họ và tên</th><th rowspan="2" style="' + TH + '">Chức danh</th><th rowspan="2" style="' + TH + '">Bộ phận</th><th rowspan="2" style="' + TH + '">Lương hợp đồng</th><th rowspan="2" style="' + TH + '">Ngày công (thực tế/chuẩn)</th><th colspan="8" style="' + TH + '">THU NHẬP</th><th colspan="6" style="' + TH + '">BẢO HIỂM BẮT BUỘC NGƯỜI LAO ĐỘNG</th><th colspan="7" style="' + TH + '">THUẾ THU NHẬP CÁ NHÂN</th><th colspan="2" style="' + TH + '">KHẤU TRỪ KHÁC</th><th rowspan="2" style="' + TH + '">Thực lĩnh</th><th rowspan="2" style="' + TH + '">Ký nhận</th></tr><tr>' + ['Lương theo ngày công', 'Phụ cấp tính BH', 'Phụ cấp, hỗ trợ khác', 'Thưởng', 'Làm thêm giờ', 'Thu nhập khác', 'Tổng thu nhập', 'Lương đóng BH', 'BHXH ' + pc(lg.bh.nld.bhxh), 'BHYT ' + pc(lg.bh.nld.bhyt), 'BHTN ' + pc(lg.bh.nld.bhtn), 'Cộng BH', 'Thu nhập miễn thuế', 'Thu nhập chịu thuế', 'Giảm trừ bản thân', 'Giảm trừ người phụ thuộc', 'BH tự nguyện được trừ', 'Thu nhập tính thuế', 'Thuế TNCN', 'Tạm ứng', 'Khấu trừ khác'].map(h => '<th style="' + TH + '">' + h + '</th>').join('') + '</tr>';
    const cols = Array(NC).fill('');
    const sm = { bhNsd: m.rows.reduce((a, x) => a + x.c.bhNSD, 0), kp: m.rows.reduce((a, x) => a + x.c.kpcd, 0) };
    return { rows, cols, head, foot, fs: '9px', sig: [['Người lập biểu', co().nguoiLap], ['Kế toán trưởng', co().ktt], ['Giám đốc', co().giamDoc]], n: m.rows.length,
      note: 'Quỹ lương và chi phí nhân công: tổng thu nhập ' + F(foot[12]) + '; bảo hiểm người sử dụng lao động đóng thêm ' + F(sm.bhNsd) + '; kinh phí công đoàn ' + F(sm.kp) + '; tổng chi phí nhân công ' + F(foot[12] + sm.bhNsd + sm.kp) + ' đồng. Số tiền thực lĩnh bằng chữ: ' + KT.docTien(foot[27]) + '.' };
  } },
  th: { code: '02-LĐTL', name: 'Bảng thanh toán tiền thưởng', build: ym => {
    const m = H.month(ym); const rows = m.rows.filter(x => x.c.thuong > 0).map((x, i) => [i + 1, x.e.name, x.c.thuong, x.rec.thuongNguon === 'quy' ? 'Quỹ khen thưởng (3531)' : 'Chi phí', x.c.thuong, '']);
    return { rows, cols: ['STT', 'Họ và tên', 'Mức thưởng', 'Nguồn chi', 'Số tiền được lĩnh (trước thuế)', 'Ký nhận'], foot: ['', 'Cộng', sum(rows, 2), '', sum(rows, 4), ''], sig: [['Người lập biểu', co().nguoiLap], ['Kế toán trưởng', co().ktt], ['Giám đốc', co().giamDoc]], n: rows.length, note: 'Thưởng là khoản thu nhập chịu thuế TNCN, không tính vào mức đóng bảo hiểm. Nếu chi từ quỹ khen thưởng phải có quyết định thưởng của người có thẩm quyền.' };
  } },
  ot: { code: '03-LĐTL', name: 'Bảng thanh toán tiền làm thêm giờ', build: ym => {
    const m = H.month(ym); const rows = m.rows.filter(x => x.c.ot > 0).map((x, i) => [i + 1, x.e.name, x.c.ot, x.c.otMien, x.c.ot - x.c.otMien, '']);
    return { rows, cols: ['STT', 'Họ và tên', 'Tiền làm thêm giờ', 'Phần miễn thuế (chênh lệch so với ngày thường)', 'Phần chịu thuế', 'Ký nhận'], foot: ['', 'Cộng', sum(rows, 2), sum(rows, 3), sum(rows, 4), ''], sig: [['Người lập biểu', co().nguoiLap], ['Kế toán trưởng', co().ktt], ['Giám đốc', co().giamDoc]], n: rows.length, note: 'Phải có bảng chấm công làm thêm giờ và văn bản thỏa thuận hoặc quyết định huy động làm thêm giờ để chứng minh phần miễn thuế.' };
  } },
  bk: { code: '07-LĐTL', name: 'Bảng kê trích nộp các khoản theo lương', build: ym => {
    const m = H.month(ym); const rows = m.rows.filter(x => x.c.baseBH > 0).map((x, i) => [i + 1, x.e.name, x.c.baseBH, x.c.nld.bhxh, x.c.nld.bhyt, x.c.nld.bhtn, x.c.nsd.bhxh, x.c.nsd.bhyt, x.c.nsd.bhtn, x.c.kpcd]);
    return { rows, cols: ['STT', 'Họ và tên', 'Lương đóng BH', 'NLĐ: BHXH 8%', 'NLĐ: BHYT 1,5%', 'NLĐ: BHTN 1%', 'NSDLĐ: BHXH 17,5%', 'NSDLĐ: BHYT 3%', 'NSDLĐ: BHTN 1%', 'Kinh phí công đoàn 2%'], foot: ['', 'Cộng', ...[2, 3, 4, 5, 6, 7, 8, 9].map(i => sum(rows, i))], sig: [['Người lập biểu', co().nguoiLap], ['Kế toán trưởng', co().ktt], ['Giám đốc', co().giamDoc]], n: rows.length, note: 'BHXH của NSDLĐ gồm 14% hưu trí, tử tuất, 3% ốm đau, thai sản và 0,5% tai nạn lao động, bệnh nghề nghiệp.' };
  } },
  pb: { code: '08-LĐTL', name: 'Bảng phân bổ tiền lương và các khoản trích theo lương', build: ym => {
    const m = H.month(ym); const g = new Map();
    for (const x of m.rows) { const k = (x.e.tkChiPhi || '642') + '|' + (x.e.dh || ''); const o = g.get(k) || { tk: x.e.tkChiPhi || '642', dh: x.e.dh || '', luong: 0, bh: 0, kp: 0 }; o.luong += x.c.tong; o.bh += x.c.bhNSD; o.kp += x.c.kpcd; g.set(k, o); }
    const rows = [...g.values()].map(o => [o.tk, o.dh, o.luong, o.bh, o.kp, o.luong + o.bh + o.kp]);
    return { rows, cols: ['TK chi phí (Nợ)', 'Đơn hàng', 'Lương (Có 334)', 'BHXH, BHYT, BHTN NSDLĐ (Có 3383, 3384, 3386)', 'KPCĐ (Có 3382)', 'Cộng chi phí'], foot: ['Cộng', '', ...[2, 3, 4, 5].map(i => sum(rows, i))], sig: [['Người lập biểu', co().nguoiLap], ['Kế toán trưởng', co().ktt]], n: rows.length };
  } },
  pc: { code: '', name: 'Bảng chi tiết phụ cấp, hỗ trợ và phân loại bảo hiểm, thuế TNCN', land: true, build: ym => {
    const B = H.breakdown(ym), cols = B.cols.filter(c => B.rows.some(r => r.v[c.k]) || c.loai);
    const bad = c => (c.bh ? 'BH' : 'không BH') + ' / ' + (c.thue === 'ct' ? 'chịu thuế' : c.thue === 'tran' ? 'miễn đến mức' : 'miễn thuế');
    const rows = B.rows.map((r, i) => [i + 1, r.e.name, ...cols.map(c => r.v[c.k] || 0), r.c.baseBH, r.c.mienThue, r.c.tnct]);
    const foot = ['', 'TỔNG CỘNG', ...cols.map((c, j) => rows.reduce((t, r) => t + r[j + 2], 0)), ...[0, 1, 2].map(j => rows.reduce((t, r) => t + r[cols.length + 2 + j], 0))];
    const head = '<tr><th style="' + TH + '">STT</th><th style="' + TH + '">Họ và tên</th>' + cols.map(c => '<th style="' + TH + '">' + E(c.ten) + '<br><i style="font-weight:400">' + bad(c) + '</i></th>').join('') + '<th style="' + TH + '">Lương đóng BH (đã kẹp sàn, trần)</th><th style="' + TH + '">Thu nhập miễn thuế</th><th style="' + TH + '">Thu nhập chịu thuế</th></tr>';
    return { rows, cols: Array(cols.length + 5).fill(''), head, foot, fs: '10px', sig: [['Người lập biểu', co().nguoiLap], ['Kế toán trưởng', co().ktt]], n: rows.length, note: 'Dòng nhỏ dưới tên khoản cho biết khoản đó có tính vào lương đóng bảo hiểm không và có chịu thuế TNCN không. Phân loại mặc định theo danh mục ở màn hình Phân loại thu nhập, cần đối chiếu quy chế công ty và văn bản hiện hành.' };
  } },
  cc: { code: '', name: 'Bảng chấm công', build: ym => {
    const m = H.month(ym); const rows = m.rows.map((x, i) => [i + 1, x.e.name, x.e.chucDanh || '', m.std, x.c.cong, Math.max(0, m.std - x.c.cong), '']);
    return { rows, cols: ['STT', 'Họ và tên', 'Chức danh', 'Ngày công chuẩn', 'Ngày công thực tế', 'Ngày nghỉ', 'Ghi chú'], foot: null, sig: [['Người chấm công', ''], ['Phụ trách bộ phận', ''], ['Giám đốc', co().giamDoc]], n: rows.length, note: 'Bảng này chỉ tổng hợp số ngày công đã nhập; chấm công chi tiết theo ngày cần lưu bản gốc có chữ ký.' };
  } }
};
const docHtml = (k, ym) => { const d = DOC[k], b = d.build(ym); return wrap(head(d.code) + ttl(d.name.toUpperCase(), ym, 'Số lao động: ' + b.n + (b.n ? '' : ' (chưa có dữ liệu)')) + tbl(b.cols, b.rows, b.foot, { fs: b.fs, head: b.head }) + (b.note ? '<p style="margin:8px 0 0"><i>Ghi chú: ' + E(b.note) + '</i></p>' : '') + sig(b.sig)); };
const slip = (x, ym) => {
  const c = x.c, e = x.e, r = x.rec; const line = (t, v, b) => '<tr><td style="' + TD + (b ? ';font-weight:700' : '') + '">' + t + '</td><td style="' + TR + (b ? ';font-weight:700' : '') + '">' + (v === '' ? '' : F(v)) + '</td></tr>';
  return wrap(head('') + ttl('PHIẾU LƯƠNG', ym) +
    '<table style="width:100%"><tr><td>Họ tên: <b>' + E(e.name) + '</b> (mã ' + E(e.code) + ')</td><td>Chức danh: ' + E(e.chucDanh || '') + '</td></tr><tr><td>Mã số thuế cá nhân: ' + E(e.mst || '') + '</td><td>Số sổ BHXH: ' + E(e.soBHXH || '') + '</td></tr><tr><td>Ngày công thực tế / chuẩn: <b>' + c.cong + ' / ' + H.month(ym).std + '</b></td><td>Số người phụ thuộc: ' + H.nptCount(e, ym) + '</td></tr></table>' +
    '<table style="width:100%;border-collapse:collapse;margin-top:8px"><tr><th style="' + TH + '">Khoản mục</th><th style="' + TH + ';text-align:right">Số tiền (đồng)</th></tr>' +
    line('Lương theo ngày công', c.luongCB) + (c.phuCapLuong ? line('Phụ cấp (tính vào lương đóng BH)', c.phuCapLuong) : '') + (c.anTrua ? line('Phụ cấp ăn trưa', c.anTrua) : '') + (c.phuCapKhac ? line('Phụ cấp khác', c.phuCapKhac) : '') + c.khoan.map(q => line(E(q.ten) + (q.bh ? ' (tính BH)' : ''), q.amt)).join('') + (c.mienKhac ? line('Thu nhập miễn thuế khác', c.mienKhac) : '') + (c.thuong ? line('Thưởng', c.thuong) : '') + (c.ot ? line('Tiền làm thêm giờ', c.ot) : '') + (KT.num(r.thuNhapKhac) ? line('Thu nhập khác', KT.num(r.thuNhapKhac)) : '') + line('TỔNG THU NHẬP', c.tong, 1) +
    line('Trừ BHXH 8%', c.nld.bhxh) + line('Trừ BHYT 1,5%', c.nld.bhyt) + (c.nld.bhtn ? line('Trừ BHTN 1%', c.nld.bhtn) : '') +
    '<tr><td style="' + TD + ';font-size:12px;color:#333">Thu nhập chịu thuế ' + F(c.tnct) + ' − bảo hiểm ' + F(c.bhNLD) + (c.bhTN ? ' − BH tự nguyện ' + F(c.bhTN) : '') + ' − giảm trừ gia cảnh ' + F(c.giamTruGC) + ' = thu nhập tính thuế ' + F(c.tntt) + '</td><td style="' + TR + '"></td></tr>' +
    line('Trừ thuế TNCN', c.tncn) + (c.ung ? line('Trừ tạm ứng', c.ung) : '') + (c.khauTruKhac ? line('Trừ khác', c.khauTruKhac) : '') + line('THỰC LĨNH', c.thucLinh, 1) + '</table>' +
    '<p>Bằng chữ: <i>' + KT.docTien(c.thucLinh) + '</i></p><p style="font-size:12px;color:#333;margin:0">Phần doanh nghiệp đóng thêm (không trừ vào lương): BHXH, BHYT, BHTN ' + F(c.bhNSD) + '; kinh phí công đoàn ' + F(c.kpcd) + '. Mức đóng bảo hiểm tính trên ' + F(c.baseBH) + '.</p>' + sig([['Người lập', co().nguoiLap], ['Người nhận', '']]));
};
UI.html6 = { get DOC() { return DOC; }, doc: (k, ym) => docHtml(k, ym), slip: (x, ym) => slip(x, ym), slips: ym => slipsAll(ym) };
const slipsAll = ym => H.month(ym).rows.map(x => '<div style="page-break-after:always;break-after:page">' + slip(x, ym) + '</div>').join('');

UI.route('chungtuluong', 'Chứng từ lương, thưởng, BH', 'Nhân sự – bảo hiểm', true, () => {
  const ym = ym0(); const o = UI.sub.cl = Object.assign({ emp: '' }, UI.sub.cl); const m = H.month(ym);
  const cards = Object.keys(DOC).map(k => { const d = DOC[k], b = d.build(ym); return '<tr><td><span class="pill">' + E(d.code || 'Tham khảo') + '</span></td><td>' + E(d.name) + '</td><td class="r">' + b.n + '</td><td><button class="btn sm" data-a="clview" data-k="' + k + '">Xem và in</button> <button class="btn sm" data-a="clxls" data-k="' + k + '">Excel</button></td></tr>'; }).join('');
  return '<div class="ph"><div><h1>Chứng từ lương, thưởng và bảo hiểm</h1><div class="sub">Tháng ' + ym.slice(5) + '/' + ym.slice(0, 4) + '. Tạo từ bảng lương và danh mục nhân viên; không nhập thêm số liệu.</div></div></div>' +
    '<div class="notice small">Danh mục mã mẫu 01 đến 08-LĐTL theo bảng liệt kê trong Phụ lục I Thông tư 99/2025/TT-BTC lấy từ nguồn tổng hợp bên thứ ba; cần đối chiếu văn bản gốc khi nộp hồ sơ. Thông tư cho phép doanh nghiệp tự thiết kế chứng từ miễn đủ nội dung bắt buộc, nên các bản in này là bản đủ nội dung, không bắt buộc đúng khuôn mẫu. Chứng từ phát sinh thật (bảng chấm công gốc, quyết định thưởng, hợp đồng lao động) vẫn phải ký và lưu.</div>' +
    '<div class="card flat"><div class="tw"><table class="t"><thead><tr><th>Mã mẫu</th><th>Chứng từ</th><th class="r">Số dòng</th><th></th></tr></thead><tbody>' + cards + '</tbody></table></div></div>' +
    '<div class="card"><h2>Phiếu lương</h2><div class="row"><label class="f">Nhân viên<select data-c="clemp"><option value="">Tất cả (mỗi người một trang)</option>' + m.rows.map(x => '<option value="' + E(x.e.code) + '"' + (o.emp === x.e.code ? ' selected' : '') + '>' + E(x.e.code + ' – ' + x.e.name) + '</option>').join('') + '</select></label><button class="btn pri" data-a="clslip">Xem và in phiếu lương</button></div><div class="muted small" style="margin-top:6px">Phiếu lương không bắt buộc theo mẫu nhưng nên có để người lao động đối chiếu các khoản thu nhập, bảo hiểm và thuế; nên giữ bản ký nhận.</div></div>' +
    '<div class="card"><h2>Hồ sơ bảo hiểm xã hội và thuế liên quan</h2><ul class="muted" style="margin:6px 0 0;padding-left:20px;display:grid;gap:5px"><li>Danh sách lao động tham gia, tăng giảm, mức đóng (D02-LT): xem màn hình Bảo hiểm xã hội; mẫu và cách nộp trên hệ thống BHXH điện tử thay đổi theo quy định hiện hành, cần đối chiếu mẫu đang dùng.</li><li>Tờ khai và quyết toán thuế TNCN: màn hình Thuế TNCN. Chứng từ khấu trừ thuế TNCN cấp cho người lao động nếu họ yêu cầu hoặc ủy quyền quyết toán, theo quy định hiện hành.</li><li>Nộp tiền bảo hiểm và kinh phí công đoàn: nhập ở sổ PS bằng mẫu nghiệp vụ; số dư 3382, 3383, 3384, 3386 sau khi nộp phải về 0.</li></ul></div>';
});
UI.chg.clemp = el => { UI.sub.cl.emp = el.value; };
const show = (title, h, name) => { UI.vp = { h, name }; UI.modal(title, '<div style="border:1px solid var(--line);overflow:auto;max-height:62vh;background:#fff">' + h + '</div>', '<button class="btn" data-a="close">Đóng</button><button class="btn" data-a="vsave">Tải file HTML</button><button class="btn pri" data-a="vdoprint">In</button>', true); };
UI.act.clview = el => { const ym = ym0(); show(DOC[el.dataset.k].name, docHtml(el.dataset.k, ym), 'Luong_' + el.dataset.k + '_' + ym); UI.vp.land = !!DOC[el.dataset.k].land; };
UI.act.clslip = () => { const ym = ym0(); const code = (UI.sub.cl || {}).emp; const m = H.month(ym); if (!m.rows.length) { UI.toast('Tháng này chưa có nhân viên'); return; } const x = code && m.rows.find(r => r.e.code === code); show('Phiếu lương', x ? slip(x, ym) : slipsAll(ym), 'PhieuLuong_' + ym); };
UI.act.clxls = el => { const ym = ym0(), d = DOC[el.dataset.k], b = d.build(ym); const cell = (v, bd) => '<td' + (typeof v === 'string' ? ' style="mso-number-format:\'@\'"' : '') + '>' + (bd ? '<b>' : '') + (typeof v === 'number' ? Math.round(v) : E(v)) + (bd ? '</b>' : '') + '</td>'; let h = '<table><tr><th colspan="' + b.cols.length + '">' + E((d.code ? d.code + ' – ' : '') + d.name + ' tháng ' + ym.slice(5) + '/' + ym.slice(0, 4)) + '</th></tr>' + (b.head || '<tr>' + b.cols.map(c => '<th>' + E(c) + '</th>').join('') + '</tr>') + b.rows.map(r => r._g ? '<tr><td colspan="' + b.cols.length + '"><b>' + E(r._g) + '</b></td></tr>' : r._s ? '<tr>' + r._s.map(v => cell(v, 1)).join('') + '</tr>' : '<tr>' + r.map(v => cell(v)).join('') + '</tr>').join('') + (b.foot ? '<tr>' + b.foot.map(v => cell(v, 1)).join('') + '</tr>' : '') + '</table>'; UI.xls(d.name.replace(/\s+/g, '') + '_' + ym, d.name, h); };

/* ---------- rà soát hồ sơ nhân sự, lương, bảo hiểm ---------- */
KT.extraChecks.push((L, add) => {
  const S_ = KT.S; const last = L.last || D.today(); const ym = last.slice(0, 7);
  for (const e of S_.employees) {
    if (!H.activeIn(e, ym)) continue;
    if (!e.cccd) add('warn', 'W23', 'Nhân viên ' + e.code + ' ' + e.name + ' thiếu số CCCD', null);
    if (e.thueKieu !== 'vanglai' && e.thamGiaBH !== false && !e.soBHXH) add('warn', 'W24', 'Nhân viên ' + e.code + ' ' + e.name + ' đang đóng BH nhưng chưa có số sổ BHXH', null);
    if (e.thueKieu !== 'khongkhautru' && !e.mst && H.calcEmp(e, ym, (S_.payroll[ym] || { rows: {} }).rows[e.code], 26).tncn > 0) add('warn', 'W25', 'Nhân viên ' + e.code + ' ' + e.name + ' bị khấu trừ thuế TNCN nhưng chưa có MST cá nhân', null);
    { const c = H.calcEmp(e, ym, (S_.payroll[ym] || { rows: {} }).rows[e.code], 26); if (c.baseBH > 0 && c.base0 < c.san - 0.5) add('info', 'I29', e.code + ' ' + e.name + ': lương đóng BH ' + F(c.base0) + ' thấp hơn mức sàn ' + F(c.san) + ', hệ thống đã nâng lên mức sàn', null); if (c.baseBH > 0 && c.base0 > c.capBH + 0.5) add('info', 'I30', e.code + ' ' + e.name + ': lương đóng BH ' + F(c.base0) + ' vượt trần ' + F(c.capBH) + ', hệ thống đã kẹp theo trần', null); }
    if (!KT.num(e.luongCB) && !KT.num(e.luongDongBH)) add('warn', 'W26', 'Nhân viên ' + e.code + ' ' + e.name + ' chưa khai lương cơ bản', null);
  }
  const m = H.month(ym);
  if (m.rows.length && !KT.S.journal.some(l => l.tag === 'auto-bl:' + ym)) add('info', 'I27', 'Tháng ' + ym.slice(5) + '/' + ym.slice(0, 4) + ' có nhân viên nhưng chưa sinh bút toán lương (Bút toán tự động)', null);
  const b334 = L.bal('334', last); if (b334 > 0.5) add('warn', 'W28', 'TK 334 có số dư Nợ ' + F(b334) + ' – trả lương hoặc tạm ứng vượt số phải trả', null);
});
})(typeof globalThis !== 'undefined' ? globalThis : window);
