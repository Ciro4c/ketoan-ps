/* ===== GIAO DIỆN 9: xem trước trước khi xuất, và màn hình Nghĩa vụ với cơ quan nhà nước =====
   Mọi nút xuất Excel trong ứng dụng đi qua UI.xls; lớp này chặn lại để hiện bản xem trước (có Tải Excel, Tải HTML, In). */
(function (G) {
'use strict';
const KT = G.KT, UI = KT.ui, D = KT.d, E = KT.esc, S = () => KT.S, R = KT.rep, $ = UI.$;

/* ---------- xem trước ---------- */
const PV = UI.pv = { html: '', excel: null, name: 'bao-cao', land: false };
/** Mở cửa sổ xem trước. o = { name, land, excel: () => tải file Excel, note } */
UI.preview = (title, html, o) => {
  o = o || {}; Object.assign(PV, { html, excel: o.excel || null, name: o.name || 'bao-cao', land: !!o.land });
  UI.vp = { h: html, name: PV.name, land: PV.land };      // dùng chung nút Tải HTML và In ở UI.act.vsave, vdoprint
  UI.modal('Xem trước: ' + title, (o.note ? '<div class="notice warn small" style="margin-bottom:8px">' + o.note + '</div>' : '') + '<div style="border:1px solid var(--line);overflow:auto;max-height:64vh;background:#fff;color:#000">' + html + '</div>',
    '<button class="btn" data-a="close">Đóng</button><button class="btn" data-a="vsave">Tải file HTML</button>' + (PV.excel ? '<button class="btn" data-a="pvxls">Tải Excel</button>' : '') + '<button class="btn pri" data-a="vdoprint">In</button>', true);
};
UI.act.pvxls = () => { if (PV.excel) PV.excel(); };

/* mọi xuất Excel đều xem trước trước */
UI.xlsDirect = UI.xls;
UI.xls = (name, title, tableHtml) => UI.preview(title, '<div style="padding:12px;font:12px/1.4 Arial,sans-serif"><h3 style="margin:0">' + E(S().company.name) + '</h3><h3 style="margin:0 0 8px">' + E(title) + '</h3>' + tableHtml + '</div>', { name, excel: () => UI.xlsDirect(name, title, tableHtml), note: 'Bản xem trước dạng bảng số liệu. File Excel tải về có cùng nội dung.' });

/* sổ, báo cáo: dùng bố cục mẫu chuẩn nếu đã có, ngược lại dùng bảng tự thiết kế và nói rõ */
const exportDirect = UI.exportReport;
UI.exportReport = r => {
  const html = KT.forms.render(r) || KT.forms2.book(r);
  if (html) { UI.preview((r.title || '') + ' ' + (r.form || ''), html, { name: (r.form || 'so') + '_' + r.period.from, land: false, excel: () => UI.xlsDirect(r.form + '_' + r.period.from, r.title, html), note: KT.forms.DONE[r.form] ? 'Bố cục mẫu ' + r.form + ': ' + KT.forms.DONE[r.form] + '.' : 'Khung sổ theo Thông tư 99/2025/TT-BTC (đầu mẫu, ký hiệu cột, cộng, chữ ký). Cột theo số liệu của sổ; đối chiếu mẫu chính thức trước khi nộp.' }); return; }
  const cap = UI.xls; UI.xls = (name, title, tbl) => { UI.xls = cap; UI.preview(title, '<div style="padding:12px;font:12px/1.4 Arial,sans-serif"><h3 style="margin:0">' + E(S().company.name) + '</h3><h3 style="margin:0 0 8px">' + E(title) + '</h3>' + tbl + '</div>', { name, excel: () => UI.xlsDirect(name, title, tbl), note: (r.form ? 'Sổ ' + r.form + ': ' : '') + 'bố cục tự thiết kế, chưa đối chiếu với mẫu chuẩn của Thông tư 99/2025/TT-BTC. Nội dung số liệu đúng; hình thức cột có thể khác mẫu.' }); };
  try { exportDirect(r); } finally { UI.xls = cap; }
};

/* ---------- lấy nội dung một màn hình để xem trước (bỏ nút, ô nhập) ---------- */
const snapshot = id => {
  const r = UI.routes[id]; const doc = new DOMParser().parseFromString('<div id="x">' + r.fn() + '</div>', 'text/html'); const x = doc.getElementById('x');
  x.querySelectorAll('button, .noprint, datalist, .tabs').forEach(n => n.remove());
  x.querySelectorAll('input, select, textarea').forEach(n => { const s = doc.createElement('span'); s.textContent = n.tagName === 'SELECT' ? (n.options[n.selectedIndex] || {}).text || '' : n.type === 'checkbox' ? (n.checked ? '✔' : '') : n.value; n.replaceWith(s); });
  x.querySelectorAll('.card, .kpi').forEach(n => { n.style.border = '1px solid #999'; n.style.padding = '8px'; n.style.margin = '8px 0'; n.style.background = '#fff'; n.style.color = '#000'; });
  x.querySelectorAll('table').forEach(t => { t.style.borderCollapse = 'collapse'; t.style.width = '100%'; t.style.fontSize = '12px'; t.querySelectorAll('th, td').forEach(c => { c.style.border = '1px solid #999'; c.style.padding = '3px 5px'; c.style.color = '#000'; }); });
  return x;
};
const xlsOf = x => [...x.querySelectorAll('table')].map(t => t.outerHTML).join('<br>');
UI.routeHtml = (id, title) => { const x = snapshot(id); return '<div style="padding:12px;font:13px/1.45 Arial,sans-serif;color:#000;background:#fff"><h3 style="margin:0">' + E(S().company.name) + '</h3><div>MST: ' + E(S().company.mst || '') + '</div><h2 style="margin:10px 0">' + E(title) + '</h2>' + x.innerHTML + '</div>'; };
const previewRoute = (id, title) => { const x = snapshot(id); const html = '<div style="padding:12px;font:13px/1.45 Arial,sans-serif;color:#000;background:#fff"><h3 style="margin:0">' + E(S().company.name) + '</h3><div>MST: ' + E(S().company.mst || '') + '</div><h2 style="margin:10px 0">' + E(title) + '</h2>' + x.innerHTML + '</div>'; UI.preview(title, html, { name: id + '_' + UI.P().to, excel: () => UI.xlsDirect(id + '_' + UI.P().to, title, xlsOf(x)), note: 'Bản xem trước nội dung màn hình ở kỳ ' + UI.P().label + '. Các tờ khai nộp trên HTKK dùng nút Điền số vào XML ở màn hình tương ứng.' }); };

/* ---------- Nghĩa vụ với cơ quan nhà nước ---------- */
const ym = () => UI.P().to.slice(0, 7);
const ITEMS = [
  { g: 'Thuế', t: 'Tờ khai thuế GTGT', m: '01/GTGT', to: 'Cơ quan thuế', h: 'Tháng: ngày 20 tháng sau. Quý: ngày cuối của tháng đầu quý sau', r: 'gtgt', d: 'Chỉ tiêu, bảng kê mua vào bán ra, đối chiếu sổ cái' },
  { g: 'Thuế', t: 'Tờ khai quyết toán, tạm nộp thuế TNDN', m: '03/TNDN', to: 'Cơ quan thuế', h: 'Tạm nộp: ngày 30 tháng đầu quý sau. Quyết toán: chậm nhất ngày 90 sau khi kết thúc năm', r: 'tndn', d: 'Kết quả kinh doanh, điều chỉnh, lỗ chuyển, thuế phải nộp' },
  { g: 'Thuế', t: 'Khai thuế TNCN khấu trừ, quyết toán', m: '05/KK-TNCN, 05/QTT-TNCN', to: 'Cơ quan thuế', h: 'Khấu trừ: như GTGT. Quyết toán: ngày 90 sau khi kết thúc năm', r: 'tncn', d: 'Danh sách người lao động, thu nhập, bảo hiểm, giảm trừ, thuế' },
  { g: 'Thuế', t: 'Lệ phí môn bài', m: '01/MBAI', to: 'Cơ quan thuế', h: 'Chậm nhất ngày 30/01 hằng năm', r: 'monbai', d: 'Mức lệ phí theo vốn điều lệ' },
  { g: 'Thuế', t: 'Báo cáo tài chính năm', m: 'B01, B02, B03, B09', to: 'Cơ quan thuế (kèm quyết toán)', h: 'Chậm nhất ngày 90 sau khi kết thúc năm', r: 'bctc', d: 'Bảng cân đối kế toán, kết quả kinh doanh, lưu chuyển tiền tệ, thuyết minh' },
  { g: 'Bảo hiểm', t: 'Bảo hiểm xã hội, y tế, thất nghiệp, công đoàn', m: 'D02-LT và bảng đóng BH', to: 'Cơ quan bảo hiểm xã hội', h: 'Nộp tiền hằng tháng; kê khai tăng giảm lao động khi có biến động', r: 'bhxh', d: 'Danh sách lao động, mức đóng, số phải nộp theo từng loại' },
  { g: 'Bảo hiểm', t: 'Bảng lương tháng', m: 'Bảng thanh toán tiền lương', to: 'Lưu hồ sơ, xuất trình khi thanh tra', h: 'Hằng tháng', r: 'luong', d: 'Thu nhập, bảo hiểm, thuế của từng người' },
  { g: 'Lao động', t: 'Sổ quản lý lao động', m: 'Theo Nghị định 145/2020/NĐ-CP', to: 'Lưu tại đơn vị; khai trình với cơ quan quản lý lao động', h: 'Lập trong 30 ngày kể từ ngày bắt đầu hoạt động; báo cáo định kỳ theo quy định', fn: () => UI.act.slprint(), d: 'Hồ sơ từng người lao động' },
  { g: 'Sổ sách', t: 'Sổ Nhật ký chung', m: 'S03a-DN', to: 'Lưu tại đơn vị; xuất trình khi thanh tra', h: 'In, ký, đóng dấu khi kết thúc kỳ kế toán', fn: () => UI.exportReport(R.nhatKy(UI.P().from, UI.P().to)), d: 'Mọi nghiệp vụ theo thứ tự thời gian' },
  { g: 'Sổ sách', t: 'Sổ Cái (chọn tài khoản)', m: 'S03b-DN', to: 'Lưu tại đơn vị', h: 'Như trên', sel: 'tk', fn: v => UI.exportReport(R.soCai(v, UI.P().from, UI.P().to)), d: 'Chọn tài khoản cần in' },
  { g: 'Sổ sách', t: 'Bảng cân đối số phát sinh', m: 'S06-DN', to: 'Lưu tại đơn vị', h: 'Cuối kỳ', fn: () => UI.exportReport(R.cdps(UI.P().from, UI.P().to)), d: 'Số dư và phát sinh mọi tài khoản' },
  { g: 'Sổ sách', t: 'Sổ quỹ tiền mặt', m: 'S07-DN', to: 'Lưu tại đơn vị', h: 'Cuối kỳ', fn: () => UI.exportReport(R.soQuy('111', UI.P().from, UI.P().to)), d: 'Thu, chi, tồn quỹ' },
  { g: 'Sổ sách', t: 'Sổ tiền gửi ngân hàng', m: 'S08-DN', to: 'Lưu tại đơn vị', h: 'Cuối kỳ', fn: () => UI.exportReport(R.soQuy('112', UI.P().from, UI.P().to)), d: 'Thu, chi, số dư ngân hàng' },
  { g: 'Sổ sách', t: 'Nhập xuất tồn kho', m: 'S11-DN', to: 'Lưu tại đơn vị', h: 'Cuối kỳ', fn: () => UI.exportReport(R.nxt(UI.P().from, UI.P().to)), d: 'Số lượng, giá trị từng mã hàng' }
];
UI.route('nghiavu', 'Nghĩa vụ với cơ quan nhà nước', 'Thuế', true, () => {
  const o = UI.sub.nv = Object.assign({ g: 'Thuế', tk: '111' }, UI.sub.nv); const p = UI.P(); const gs = ['Thuế', 'Bảo hiểm', 'Lao động', 'Sổ sách'];
  const tabs = gs.map(g => '<button class="' + (o.g === g ? 'on' : '') + '" data-a="nvtab" data-k="' + g + '">' + g + '</button>').join('');
  const rows = ITEMS.map((x, i) => ({ x, i })).filter(r => r.x.g === o.g).map(r => '<tr><td><b>' + E(r.x.t) + '</b><div class="muted small">' + E(r.x.d) + '</div>' + (r.x.sel ? '<input data-c="nvtk" value="' + E(o.tk) + '" size="8" list="dl-acc2" title="Số hiệu tài khoản">' : '') + '</td><td><span class="pill">' + E(r.x.m) + '</span></td><td class="small">' + E(r.x.to) + '</td><td class="small">' + E(r.x.h) + '</td><td><button class="btn pri sm" data-a="nvview" data-i="' + r.i + '">Xem trước và xuất</button> ' + (r.x.r ? '<button class="btn sm" data-a="go" data-id="' + r.x.r + '">Mở màn hình</button>' : '') + '</td></tr>').join('');
  return '<div class="ph"><div><h1>Nghĩa vụ với cơ quan nhà nước</h1><div class="sub">Hồ sơ, sổ sách, báo cáo cần lập cuối kỳ (' + E(p.label) + '). Chọn Xem trước và xuất để kiểm tra từng mẫu rồi mới tải về hoặc in.</div></div><span class="sp"></span><button class="btn" data-a="go" data-id="lich">Xem lịch nghĩa vụ theo ngày</button></div>' +
    '<div class="notice small">Mẫu có đánh dấu "đối chiếu" là mẫu đã dựng theo bố cục trong văn bản: ' + Object.keys(KT.forms.DONE).join(', ') + '. Các sổ còn lại dùng bảng tự thiết kế đủ nội dung, chưa đúng khuôn mẫu; cần đối chiếu với phụ lục của Thông tư 99/2025/TT-BTC (đơn vị được tự thiết kế sổ nếu đủ nội dung bắt buộc). Hạn nộp ghi ở đây là hạn thông thường, cần kiểm tra theo kỳ và quy định hiện hành.</div>' +
    '<datalist id="dl-acc2">' + S().accounts.map(a => '<option value="' + E(a.code) + '">' + E(a.name) + '</option>').join('') + '</datalist>' +
    '<div class="card"><div class="tabs">' + tabs + '</div><div class="tw" style="margin-top:8px"><table class="t"><thead><tr><th>Hồ sơ</th><th>Mã mẫu</th><th>Nơi nhận</th><th>Hạn thông thường</th><th></th></tr></thead><tbody>' + rows + '</tbody></table></div></div>';
});
UI.act.nvtab = el => { UI.sub.nv.g = el.dataset.k; UI.render(); };
UI.chg.nvtk = el => { UI.sub.nv.tk = el.value.trim(); };
UI.act.nvview = el => { const x = ITEMS[+el.dataset.i]; if (x.fn) { x.fn(x.sel ? (UI.sub.nv.tk || '111') : undefined); return; } previewRoute(x.r, x.t); };
})(typeof globalThis !== 'undefined' ? globalThis : window);
