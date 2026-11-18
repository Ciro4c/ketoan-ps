/* ===== GIAO DIỆN 4: sổ theo quy định, đăng ký chứng từ, xuất tờ khai, sao lưu ===== */
(function (G) {
'use strict';
const KT = G.KT, UI = KT.ui, D = KT.d, E = KT.esc, $ = UI.$, S = () => KT.S, R = KT.rep;

/* ---------- bảng xuất Excel từ báo cáo ---------- */
const expTable = r => {
  if (r.tables) return r.tables.map(x => '<table><tr><th colspan="' + x.head.length + '">' + E(x.title) + '</th></tr><tr>' + x.head.map(h => '<th>' + E(h) + '</th>').join('') + '</tr>' + x.rows.map(rw => '<tr>' + rw.map(v => '<td>' + (typeof v === 'number' ? Math.round(v) : E(v == null ? '' : v)) + '</td>').join('') + '</tr>').join('') + '</table>').join('<br>');
  return '<table><tr><th colspan="' + r.cols.length + '">' + E((r.form ? r.form + ' – ' : '') + r.title + ' ' + (r.sub || '')) + '</th></tr><tr>' + r.cols.map(c => '<th>' + E(c.t) + '</th>').join('') + '</tr>' + r.rows.map(row => '<tr>' + r.cols.map(c => { const v = row[c.k]; const num = UI.isNumCol(c); return '<td>' + (num && typeof v === 'number' ? (c.f === 'q' || c.f === '%' ? v : Math.round(v)) : c.f === 'd' ? D.fmt(v) : E(v == null ? '' : v)) + '</td>'; }).join('') + '</tr>').join('') + '</table>';
};
/* ---------- xuất toàn bộ bảng trên màn hình hiện tại (tờ khai, bảng lương…) ---------- */
UI.act.xlspage = () => {
  const page = $('#page'); let h = ''; page.querySelectorAll('.card').forEach(c => {
    const tb = c.querySelectorAll('table.t'); if (!tb.length) return; const t = c.querySelector('h2'); if (t) h += '<h3>' + E(t.textContent) + '</h3>';
    tb.forEach(x => { const k = x.cloneNode(true); k.querySelectorAll('input').forEach(i => { const td = i.closest('td'); if (i.type === 'checkbox') i.replaceWith(i.checked ? 'x' : ''); else i.replaceWith(i.value); }); k.querySelectorAll('select').forEach(i => i.replaceWith(i.options[i.selectedIndex] ? i.options[i.selectedIndex].text : '')); k.querySelectorAll('button').forEach(b => b.remove()); h += k.outerHTML + '<br>'; });
  });
  const r = UI.routes[UI.at]; UI.xls('ho-so-' + UI.at + '-' + D.today(), r.t, h);
};
const injectXls = () => { const ph = $('#page .ph'); if (!ph || $('[data-a=xlspage]')) return; const b = document.createElement('button'); b.className = 'btn noprint'; b.dataset.a = 'xlspage'; b.textContent = 'Xuất số liệu ra Excel'; b.title = 'Tải toàn bộ bảng trên màn hình để đối chiếu hoặc nhập vào HTKK, VssID'; ph.appendChild(b); };
['gtgt', 'tndn', 'tncn', 'bhxh', 'luong', 'lich', 'monbai'].forEach(id => { const r = UI.routes[id]; if (r) r.after = injectXls; });


/* ---------- điền số vào file XML do chính HTKK kết xuất ---------- */
const dictGTGT = () => {
  const ser = KT.tax.vatSeries(KT.compute().last || D.today()); const r = ser.find(x => x.per.key === UI.sub.gtgt) || ser[ser.length - 1]; const fl = S().filings['gtgt:' + r.per.key] || {}; const d = {};
  Object.keys(r.v).forEach(k => { if (typeof r.v[k] === 'number') d[k] = Math.round(r.v[k]); });
  ['23a', '24a', '32b', '34a', '39a'].forEach(k => { if (fl[k] !== '' && fl[k] != null) d[k] = Math.round(KT.num(fl[k])); });
  return { name: '01/GTGT ' + r.per.label, d, pre: 'ct' };
};
const dictTNDN = () => {
  const y = UI.sub.tndn || +(KT.compute().last || D.today()).slice(0, 4); const c = KT.tax.cit(y); const d = {}; Object.keys(c.v).forEach(k => { if (typeof c.v[k] === 'number') d[k] = Math.round(c.v[k]); });
  return { name: '03/TNDN năm ' + y, d, pre: 'ct' };
};
UI.act.htkk = () => {
  const g = UI.at === 'gtgt' ? dictGTGT() : dictTNDN(); UI.hk = g;
  UI.modal('Điền số vào file XML của HTKK – ' + g.name,
    '<p>Mình không có bản mô tả cấu trúc (XSD) chính thức của cơ quan thuế nên không tự dựng file XML từ đầu, vì file sai cấu trúc sẽ bị HTKK hoặc eTax từ chối. Cách an toàn là để chính HTKK tạo khung file, app chỉ điền số.</p><ol class="muted" style="margin:6px 0 10px;padding-left:20px"><li>Trong HTKK, tạo tờ khai đúng kỳ, ghi lại, rồi chọn <b>Kết xuất XML</b>.</li><li>Chọn file XML đó ở bên dưới. App điền các ô chỉ tiêu có thẻ tên <span class="mono">ct…</span> và tải file đã điền về.</li><li>Mở lại file trong HTKK (Tải tờ khai từ XML), kiểm tra từng chỉ tiêu, bấm Ghi rồi nộp như bình thường.</li></ol><input type="file" id="hkfile" accept=".xml,text/xml"><div id="hkres" style="margin-top:10px"></div>', '<button class="btn" data-a="close">Đóng</button>');
};
document.addEventListener('change', e => {
  if (e.target.id !== 'hkfile' || !e.target.files[0]) return; const g = UI.hk; const rd = new FileReader();
  rd.onload = () => {
    const doc = new DOMParser().parseFromString(rd.result, 'application/xml'); const out = $('#hkres');
    if (doc.querySelector('parsererror')) { out.innerHTML = '<div class="notice bad">File không phải XML hợp lệ.</div>'; return; }
    const filled = [], skipped = []; const used = new Set();
    doc.querySelectorAll('*').forEach(el => {
      if (el.children.length) return; const m = el.localName.match(/^ct_?(\w+)$/i); if (!m) return; const k = Object.keys(g.d).find(x => x.toLowerCase() === m[1].toLowerCase()); if (k == null) return;
      el.textContent = String(g.d[k]); filled.push(m[1]); used.add(k);
    });
    const missing = Object.keys(g.d).filter(k => !used.has(k));
    const xml = new XMLSerializer().serializeToString(doc); UI.hkxml = (xml.startsWith('<?xml') ? '' : '<?xml version="1.0" encoding="UTF-8"?>\n') + xml; UI.hkname = e.target.files[0].name.replace(/\.xml$/i, '') + '-dien-so.xml';
    out.innerHTML = '<div class="notice ' + (filled.length ? 'ok' : 'bad') + '">Đã điền ' + filled.length + ' chỉ tiêu' + (filled.length ? ': ' + filled.map(x => '[' + x + ']').join(' ') : '. Không thấy thẻ chỉ tiêu nào khớp, file này có thể không phải tờ khai ' + E(g.name.split(' ')[0]) + '.') + '</div>' + (missing.length ? '<div class="notice warn small" style="margin-top:6px">Không có thẻ tương ứng trong file nên chưa điền: ' + missing.map(x => '[' + x + ']').join(' ') + '. Nhập tay trong HTKK nếu cần.</div>' : '') + (filled.length ? '<p><button class="btn pri" data-a="hkdl">Tải file XML đã điền</button></p>' : '');
  };
  rd.readAsText(e.target.files[0], 'utf-8');
});
UI.act.hkdl = () => { try { const b = new Blob([UI.hkxml], { type: 'application/xml;charset=utf-8' }); const u = URL.createObjectURL(b); const a = document.createElement('a'); a.href = u; a.download = UI.hkname; document.body.appendChild(a); a.click(); a.remove(); } catch (e) { UI.toast('Không tải được file trong môi trường này'); } };
const injectHtkk = () => { injectXls(); const ph = $('#page .ph'); if (!ph || $('[data-a=htkk]')) return; if (UI.at !== 'gtgt' && UI.at !== 'tndn') return; const b = document.createElement('button'); b.className = 'btn pri noprint'; b.dataset.a = 'htkk'; b.textContent = 'Điền số vào XML của HTKK'; ph.appendChild(b); };
['gtgt', 'tndn'].forEach(id => { if (UI.routes[id]) UI.routes[id].after = injectHtkk; });

/* ---------- nhắc sao lưu ---------- */
UI.backupPill = () => {
  if (!S().journal.length) return ''; const lb = S().meta.lastBackup; const d = lb ? D.diff(lb, D.today()) : 999;
  return d > 7 ? '<span class="pill warn" data-a="go" data-id="ht" style="cursor:pointer" title="Mở mục Công ty và hệ thống để xuất file sao lưu">' + (lb ? 'Sao lưu cách ' + d + ' ngày' : 'Chưa sao lưu file') + '</span>' : '';
};
const bk0 = UI.act.backup; UI.act.backup = () => { S().meta.lastBackup = D.today(); KT.touch(true); bk0(); setTimeout(() => UI.render(), 50); };
UI.act.snaprest = el => UI.ask('Khôi phục dữ liệu về bản chụp ngày ' + E(el.dataset.k.slice(5)) + '? Dữ liệu hiện tại sẽ bị thay thế (nên xuất sao lưu trước).', 'Khôi phục', async () => { try { await KT.snapRestore(el.dataset.k); UI.initPer(); UI.go('dash'); UI.toast('Đã khôi phục'); } catch (e) { UI.toast(e.message); } }, true);
if (UI.routes.ht) UI.routes.ht.after = async () => { const box = $('#snaps'); if (!box) return; const l = await KT.snapList(); box.innerHTML = l.length ? '<h3 style="margin:12px 0 6px">Bản chụp tự động (7 ngày gần nhất)</h3><div class="row">' + l.map(k => '<button class="btn sm" data-a="snaprest" data-k="' + E(k) + '">' + D.fmt(k.slice(5)) + '</button>').join('') + '</div><div class="muted small" style="margin-top:4px">Lưu cùng trình duyệt này, chỉ cứu được lỗi sửa nhầm. Không thay thế file sao lưu cất ở nơi khác.</div>' : ''; };

/* ---------- Sổ đăng ký và lưu trữ chứng từ ---------- */
UI.route('ctu', 'Đăng ký & lưu trữ chứng từ', 'Sổ sách & báo cáo', true, () => {
  const p = UI.P(); const o = UI.sub.ctu = Object.assign({ f: '' }, UI.sub.ctu); const { rows: all, gaps } = R.dangKy(p.from, p.to); let rows = all;
  if (o.f === 'goc') rows = all.filter(r => !r.goc && !r.auto); else if (o.f === 'auto') rows = all.filter(r => r.auto); else if (o.f === 'tay') rows = all.filter(r => !r.auto);
  const manual = all.filter(r => !r.auto); const miss = manual.filter(r => !r.goc).length; const tot = rows.reduce((s, r) => s + r.tot, 0);
  const yEnd = D.iso(+p.to.slice(0, 4), 12, 31); const must = D.addDays(yEnd, 365);
  const inp = (r, k, w) => '<input data-c="vdoc" data-id="' + E(r.id) + '" data-k="' + k + '" value="' + E(r[k]) + '" size="' + w + '"' + (r.auto ? ' disabled' : '') + '>';
  return '<div class="ph"><div><h1>Đăng ký và lưu trữ chứng từ</h1><div class="sub">Mỗi chứng từ ghi sổ có số, ngày, hồ sơ gốc và nơi cất giữ. Kỳ: ' + E(p.label) + '.</div></div></div>' +
    '<div class="grid g4"><div class="kpi"><div class="l">Chứng từ trong kỳ</div><div class="v">' + all.length + '</div><div class="s">' + manual.length + ' nhập tay, ' + (all.length - manual.length) + ' tự sinh</div></div><div class="kpi ' + (miss ? 'bad' : 'ok') + '"><div class="l">Chưa xác nhận có chứng từ gốc</div><div class="v">' + miss + '</div><div class="s">Tích “Đã có gốc” khi đã đối chiếu bản giấy/bản điện tử</div></div><div class="kpi ' + (gaps.length ? 'bad' : 'ok') + '"><div class="l">Số chứng từ bị đứt</div><div class="v">' + gaps.reduce((s, g) => s + g.miss.length, 0) + '</div><div class="s">' + (gaps.length ? gaps.map(g => E(g.k) + ': ' + g.miss.slice(0, 6).join(', ')).join(' · ') : 'Dãy số liên tục') + '</div></div><div class="kpi"><div class="l">Phải đưa vào lưu trữ trước</div><div class="v" style="font-size:17px">' + D.fmt(must) + '</div><div class="s">Trong 12 tháng sau khi kết thúc năm kế toán</div></div></div>' +
    '<div class="card"><div class="row"><label class="f">Lọc<select data-c="subo" data-o="ctu" data-k="f"><option value="">Tất cả</option><option value="tay"' + (o.f === 'tay' ? ' selected' : '') + '>Chỉ chứng từ nhập tay</option><option value="goc"' + (o.f === 'goc' ? ' selected' : '') + '>Chưa có chứng từ gốc</option><option value="auto"' + (o.f === 'auto' ? ' selected' : '') + '>Chỉ bút toán tự sinh</option></select></label><span class="sp" style="flex:1"></span><button class="btn" data-a="ctuall">Đánh dấu tất cả chứng từ đang lọc là đã có gốc</button><button class="btn" data-a="ctuxls">Xuất sổ đăng ký (Excel)</button></div></div>' +
    '<div class="card flat"><div class="tw" style="max-height:calc(100vh - 360px)"><table class="t ps"><thead><tr><th>Số CT</th><th>Ngày</th><th>Loại</th><th>Nội dung</th><th>Số HĐ</th><th>Đối tượng</th><th class="r">Số tiền</th><th class="c">Đã có gốc</th><th>Nơi lưu (tủ/quyển)</th><th>Số tờ</th><th>Ghi chú</th><th>Lưu đến</th></tr></thead><tbody>' + rows.slice(0, 500).map(r => '<tr' + (r.auto ? ' class="auto"' : '') + '><td style="padding:4px 8px">' + E(r.key) + '</td><td style="padding:4px 8px">' + D.fmt(r.date) + '</td><td style="padding:4px 8px">' + E(r.loai) + '</td><td style="padding:4px 8px;min-width:240px">' + E(r.dg) + '</td><td style="padding:4px 8px">' + E(r.hd) + '</td><td style="padding:4px 8px">' + E(r.pt) + '</td><td class="r" style="padding:4px 8px">' + KT.f(r.tot) + '</td><td class="c"><input type="checkbox" data-c="vdoc" data-id="' + E(r.id) + '" data-k="goc"' + (r.goc ? ' checked' : '') + (r.auto ? ' disabled' : '') + '></td><td>' + inp(r, 'luu', 14) + '</td><td>' + inp(r, 'to', 4) + '</td><td>' + inp(r, 'ghi', 18) + '</td><td style="padding:4px 8px">' + D.fmt(r.han) + '</td></tr>').join('') + '</tbody></table></div></div>' + (rows.length > 500 ? '<div class="muted small">Chỉ hiện 500 chứng từ đầu, thu hẹp kỳ để xem phần còn lại.</div>' : '') +
    '<div class="notice small"><b>Thời hạn lưu trữ (Luật Kế toán 2015, Điều 41):</b> chứng từ dùng trực tiếp để ghi sổ và lập báo cáo tài chính, sổ kế toán và báo cáo tài chính năm lưu ít nhất 10 năm; tài liệu dùng cho quản lý, điều hành lưu ít nhất 5 năm; tài liệu có tính sử liệu lưu vĩnh viễn. Cột “Lưu đến” tính mặc định 10 năm; chỉnh theo thực tế nếu loại tài liệu khác.</div>';
});
UI.chg.vdoc = el => { const d = S().vdoc = S().vdoc || {}; const o = d[el.dataset.id] = d[el.dataset.id] || {}; o[el.dataset.k] = el.type === 'checkbox' ? el.checked : el.value.trim(); KT.touch(true); if (el.type === 'checkbox') UI.render(); };
UI.act.ctuall = () => { const p = UI.P(); const f = UI.sub.ctu.f; const { rows } = R.dangKy(p.from, p.to); const d = S().vdoc = S().vdoc || {}; rows.filter(r => !r.auto && (f !== 'goc' || !r.goc)).forEach(r => { (d[r.id] = d[r.id] || {}).goc = true; }); KT.touch(true); UI.render(); UI.toast('Đã đánh dấu'); };
UI.act.ctuxls = () => { const p = UI.P(); const { rows } = R.dangKy(p.from, p.to); UI.xls('so-dang-ky-chung-tu', 'SỔ ĐĂNG KÝ CHỨNG TỪ – ' + p.label, '<table><tr><th>Số CT</th><th>Ngày</th><th>Loại</th><th>Nội dung</th><th>Số HĐ</th><th>Đối tượng</th><th>Số tiền</th><th>Đã có gốc</th><th>Nơi lưu</th><th>Số tờ</th><th>Ghi chú</th><th>Lưu đến</th></tr>' + rows.map(r => '<tr><td>' + E(r.key) + '</td><td>' + D.fmt(r.date) + '</td><td>' + E(r.loai) + '</td><td>' + E(r.dg) + '</td><td>' + E(r.hd) + '</td><td>' + E(r.pt) + '</td><td>' + Math.round(r.tot) + '</td><td>' + (r.goc ? 'x' : '') + '</td><td>' + E(r.luu) + '</td><td>' + E(r.to) + '</td><td>' + E(r.ghi) + '</td><td>' + D.fmt(r.han) + '</td></tr>').join('') + '</table>'); };

/* ---------- Hồ sơ sổ sách theo quy định ---------- */
UI.route('luat', 'Hồ sơ sổ sách theo luật', 'Sổ sách & báo cáo', true, () => {
  const p = UI.P(); const L = KT.compute(); const y = +p.to.slice(0, 4);
  const go = (id, sub) => '<button class="btn sm" data-a="go" data-id="' + id + '"' + (sub ? ' data-sub=\'' + E(JSON.stringify(sub)) + '\'' : '') + '>Mở</button>';
  const bk = r => ({ socai: { r: 'socai', tk: '112' }, nhatky: { r: 'nhatky' }, cdps: { r: 'cdps' }, q111: { r: 'soquy', qk: '111' }, q112: { r: 'soquy', qk: '112' }, cn: { r: 'congno', cn: '131' }, nxt: { r: 'nxt' }, tk: { r: 'thekho' }, tscd: { r: 'tscd' }, cp: { r: 'chiphi' }, bh: { r: 'banhang' } }[r]);
  const rows = [
    ['Sổ Nhật ký chung', 'Sổ tổng hợp, ghi theo thứ tự thời gian', 'sach', { bk: bk('nhatky') }], ['Sổ Cái từng tài khoản', 'Sổ tổng hợp', 'sach', { bk: bk('socai') }], ['Bảng cân đối số phát sinh', 'Đối chiếu số liệu tổng hợp', 'sach', { bk: bk('cdps') }],
    ['Sổ quỹ tiền mặt', 'Chi tiết, kiêm nhật ký thu chi tiền mặt', 'sach', { bk: bk('q111') }], ['Sổ tiền gửi ngân hàng', 'Chi tiết, kiêm nhật ký thu chi tiền gửi', 'sach', { bk: bk('q112') }],
    ['Sổ chi tiết công nợ phải thu, phải trả', 'Theo từng đối tượng (chọn Sổ cái + đối tượng)', 'sach', { bk: bk('cn') }], ['Sổ chi tiết vật liệu, hàng hóa; thẻ kho; nhập xuất tồn', 'Chi tiết hàng tồn kho', 'sach', { bk: bk('nxt') }],
    ['Sổ tài sản cố định', 'Chi tiết TSCĐ, hao mòn', 'sach', { bk: bk('tscd') }], ['Sổ chi phí sản xuất, kinh doanh', 'Chi tiết chi phí theo tài khoản', 'sach', { bk: bk('cp') }], ['Sổ chi tiết bán hàng', 'Chi tiết doanh thu', 'sach', { bk: bk('bh') }],
    ['Sổ theo dõi thuế GTGT (bảng kê hóa đơn)', 'Phục vụ tờ khai 01/GTGT', 'gtgt', {}], ['Sổ đăng ký và lưu trữ chứng từ', 'Quản lý chứng từ gốc, đứt số, thời hạn lưu', 'ctu', {}], ['Báo cáo tài chính năm B01, B02, B03, B09', 'Lập cuối năm tài chính', 'bctc', {}]];
  const ne = L.issues.filter(i => i.sev === 'err').length;
  const lock = S().lockedUntil; const yEnd = D.iso(y, 12, 31);
  const check = [['Dữ liệu PS không còn lỗi', ne === 0, ne ? ne + ' lỗi cần sửa' : 'Đạt'], ['Bảng cân đối số phát sinh cân', R.cdps(D.iso(y, 1, 1), yEnd).ok, ''], ['Bảng cân đối kế toán cân', Math.abs(R.b01(yEnd).diff) < 1, ''], ['Đã khóa sổ đến cuối năm', !!lock && lock >= yEnd, lock ? 'Đang khóa đến ' + D.fmt(lock) : 'Chưa khóa sổ'], ['Chứng từ nhập tay đã xác nhận có bản gốc', R.dangKy(D.iso(y, 1, 1), yEnd).rows.filter(r => !r.auto && !r.goc).length === 0, 'Xem mục Đăng ký chứng từ'], ['Đã xuất sao lưu trong 7 ngày', !!S().meta.lastBackup && D.diff(S().meta.lastBackup, D.today()) <= 7, '']];
  return '<div class="ph"><div><h1>Hồ sơ sổ sách theo quy định</h1><div class="sub">Bộ sổ kế toán tối thiểu một doanh nghiệp cần có, kèm danh sách kiểm tra trước khi chốt năm ' + y + '.</div></div><span class="sp"></span><button class="btn pri" data-a="bundle">Xuất bộ sổ cả năm ' + y + ' (Excel)</button></div>' +
    '<div class="notice small">Theo Luật Kế toán 2015, sổ kế toán gồm sổ tổng hợp (Nhật ký, Sổ cái) và sổ chi tiết. Thông tư 99/2025/TT-BTC cho phép doanh nghiệp tự thiết kế và bổ sung biểu mẫu sổ, miễn đủ nội dung và đúng Điều 24 Luật Kế toán; mẫu tại phụ lục chỉ để tham khảo. Mỗi đơn vị chỉ dùng một hệ thống sổ cho một kỳ kế toán. Sổ khóa tại thời điểm kết thúc kỳ để lập báo cáo tài chính. Việc in, ký, đóng dấu sổ điện tử và hình thức lưu trữ điện tử cần đối chiếu Nghị định 174/2016/NĐ-CP và quy định hiện hành, mình chưa kiểm chứng được phần này.</div>' +
    '<div class="card flat"><div class="tw"><table class="t"><thead><tr><th>Sổ</th><th>Loại, công dụng</th><th></th></tr></thead><tbody>' + rows.map(r => '<tr><td>' + E(r[0]) + '</td><td class="muted">' + E(r[1]) + '</td><td>' + (r[3].bk ? '<button class="btn sm" data-a="openbook" data-b=\'' + E(JSON.stringify(r[3].bk)) + '\'>Mở</button>' : go(r[2])) + '</td></tr>').join('') + '</tbody></table></div></div>' +
    '<div class="card"><h2>Danh sách kiểm tra chốt năm ' + y + '</h2>' + check.map(c => '<div class="row" style="padding:5px 0;border-bottom:1px solid var(--line2)"><span class="pill ' + (c[1] ? 'ok' : 'bad') + '">' + (c[1] ? 'Đạt' : 'Chưa') + '</span><span style="flex:1">' + E(c[0]) + '</span><span class="muted small">' + E(c[2]) + '</span></div>').join('') + '</div>' +
    '<div class="card"><h2>Lưu trữ và in sổ</h2><ul class="muted" style="margin:0;padding-left:18px"><li>Cuối năm: xuất bộ sổ cả năm và báo cáo tài chính, in ra giấy hoặc lưu bản điện tử có ký số, ký tên người lập, kế toán trưởng, giám đốc theo quy định hiện hành.</li><li>Chứng từ gốc, sổ, báo cáo tài chính năm: lưu ít nhất 10 năm. Tài liệu quản lý, điều hành: ít nhất 5 năm. Đưa vào lưu trữ trong vòng 12 tháng sau khi kết thúc năm kế toán.</li><li>Khóa sổ ở mục Công ty và hệ thống sau khi đã nộp tờ khai và chốt báo cáo, để không ai sửa nhầm số liệu đã kê khai.</li></ul></div>';
});
UI.act.openbook = el => { UI.sub.bk = Object.assign({ r: 'socai', tk: '112', dt: '', vt: '', cn: '131', qk: '111' }, JSON.parse(el.dataset.b)); UI.go('sach'); };
UI.act.bundle = () => {
  const p = UI.P(); const y = +p.to.slice(0, 4); const a = D.iso(y, 1, 1), b = D.iso(y, 12, 31); const L = KT.compute(); let h = '';
  const add = r => { h += expTable(r) + '<br>'; };
  add(R.nhatKy(a, b)); add(R.cdps(a, b)); add(R.soQuy('111', a, b)); add(R.soQuy('112', a, b)); add(R.congNo('131', a, b)); add(R.congNo('331', a, b)); add(R.nxt(a, b)); add(R.tscd(a, b)); add(R.chiPhi(a, b)); add(R.banHang(a, b));
  S().accounts.filter(x => x.code.length === 3).forEach(x => { const m = L.mov(x.code, a, b, {}); if (L.balBefore(x.code, a) || m.n || m.c) add(R.soCai(x.code, a, b)); });
  add(R.b01(b, D.addDays(a, -1))); add(R.b02(a, b)); add(R.b03(a, b));
  UI.xls('bo-so-ke-toan-' + y, 'BỘ SỔ KẾ TOÁN NĂM ' + y, h);
};
})(window);
