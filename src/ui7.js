/* ===== GIAO DIỆN 7: sổ quản lý lao động ===== */
(function (G) {
'use strict';
const KT = G.KT, UI = KT.ui, D = KT.d, E = KT.esc, S = () => KT.S, H = KT.hr, F = KT.f, $ = UI.$;
const LHD = [['', 'Chưa chọn'], ['kxd', 'Không xác định thời hạn'], ['xd', 'Xác định thời hạn'], ['thuviec', 'Thử việc'], ['thoivu', 'Dưới 1 tháng']];
const LHDT = Object.fromEntries(LHD);
const EV = [['luong', 'Điều chỉnh lương, nâng bậc'], ['hd', 'Thay đổi hợp đồng (ký mới, phụ lục, gia hạn)'], ['daotao', 'Đào tạo, bồi dưỡng, nâng cao kỹ năng'], ['phep', 'Nghỉ phép năm (số ngày)'], ['kyluat', 'Kỷ luật lao động'], ['vatchat', 'Trách nhiệm vật chất'], ['tnld', 'Tai nạn lao động, bệnh nghề nghiệp'], ['khac', 'Khác']];
const EVT = Object.fromEntries(EV);
const yr = () => UI.P().to.slice(0, 4);
const info = (e, y) => {
  const ls = (e.ls || []).filter(x => (x.ngay || '').slice(0, 4) === y); let phep = 0, ot = 0;
  ls.filter(x => x.loai === 'phep').forEach(x => { phep += KT.num(x.so); });
  Object.keys(S().payroll || {}).forEach(ym => { if (ym.slice(0, 4) === y) { const r = ((S().payroll[ym] || {}).rows || {})[e.code]; if (r) ot += KT.num(r.gioOT); } });
  const cnt = k => (e.ls || []).filter(x => x.loai === k).length;
  return { phep, ot, kl: cnt('kyluat'), vc: cnt('vatchat'), tn: cnt('tnld') };
};
const cur = (e) => { const ym = UI.P().to.slice(0, 7); const c = H.calcEmp(e, ym, ((S().payroll[ym] || {}).rows || {})[e.code], 26); return c; };
const FIELDS = [['gioiTinh', 'Giới tính', 'sel', [['', ''], ['Nam', 'Nam'], ['Nữ', 'Nữ']]], ['ngaySinh', 'Ngày sinh', 'd'], ['quocTich', 'Quốc tịch', 't'], ['cccd', 'Số CCCD, hộ chiếu', 't'], ['cuTru', 'Nơi cư trú', 't', 160], ['trinhDo', 'Trình độ chuyên môn', 't'], ['bacKyNang', 'Bậc trình độ kỹ năng nghề', 't'], ['chucDanh', 'Vị trí việc làm', 't'], ['boPhan', 'Bộ phận', 't'], ['loaiHD', 'Loại hợp đồng', 'sel', LHD], ['soHD', 'Số hợp đồng', 't'], ['ngayHD', 'Ngày ký', 'd'], ['hanHD', 'Hết hạn', 'd'], ['vao', 'Bắt đầu làm việc', 'd'], ['nghi', 'Chấm dứt HĐ', 'd'], ['lyDoNghi', 'Lý do chấm dứt', 't']];
UI.route('solaodong', 'Sổ quản lý lao động', 'Nhân sự – bảo hiểm', true, () => {
  const y = yr(); const emps = S().employees; const f = (UI.sub.sl = Object.assign({ q: '', st: 'all' }, UI.sub.sl));
  const miss = e => ['gioiTinh', 'ngaySinh', 'cccd', 'cuTru', 'loaiHD', 'soHD'].filter(k => !e[k]).length;
  const list = emps.map((e, i) => ({ e, i })).filter(x => (f.st === 'all' || (f.st === 'dang' ? !x.e.nghi : !!x.e.nghi)) && (!f.q || (x.e.code + ' ' + x.e.name).toLowerCase().includes(f.q.toLowerCase())));
  const inp = (i, c, e) => { const k = c[0], ty = c[2]; if (ty === 'sel') return '<select data-c="lao" data-i="' + i + '" data-k="' + k + '">' + c[3].map(o => '<option value="' + o[0] + '"' + ((e[k] || '') === o[0] ? ' selected' : '') + '>' + E(o[1]) + '</option>').join('') + '</select>'; return '<input data-c="lao" data-i="' + i + '" data-k="' + k + '" data-ty="' + ty + '" value="' + E(ty === 'd' ? D.fmt(e[k]) : e[k] == null ? '' : e[k]) + '" size="' + (c[3] ? 22 : ty === 'd' ? 10 : 14) + '" placeholder="' + (ty === 'd' ? 'dd/mm/yyyy' : '') + '">'; };
  const body = list.map((x, n) => { const e = x.e, a = info(e, y), c = cur(e); return '<tr><td>' + (n + 1) + '</td><td>' + E(e.code) + '</td><td><b>' + E(e.name) + '</b>' + (miss(e) ? '<div><span class="pill warn">thiếu ' + miss(e) + ' mục</span></div>' : '') + '</td>' + FIELDS.map(c => '<td>' + inp(x.i, c, e) + '</td>').join('') + '<td class="r">' + F(KT.num(e.luongCB)) + '</td><td>' + E(e.soBHXH || '') + '</td><td class="r">' + F(c.baseBH) + '</td><td class="r">' + a.phep + '</td><td class="r">' + a.ot + '</td><td class="r">' + a.kl + ' / ' + a.vc + ' / ' + a.tn + '</td><td><button class="btn sm" data-a="lsopen" data-i="' + x.i + '">' + (e.ls || []).length + ' mục</button></td></tr>'; }).join('');
  const tabs = [['all', 'Tất cả'], ['dang', 'Đang làm việc'], ['nghi', 'Đã nghỉ']].map(t => '<button class="' + (f.st === t[0] ? 'on' : '') + '" data-a="sltab" data-k="' + t[0] + '">' + t[1] + '</button>').join('');
  const dang = emps.filter(e => !e.nghi).length;
  return '<div class="ph"><div><h1>Sổ quản lý lao động</h1><div class="sub">Hồ sơ từng người lao động và quá trình làm việc, năm ' + y + '. Một nguồn dữ liệu dùng chung với bảng lương, bảo hiểm.</div></div><span class="sp"></span><button class="btn" data-a="slxls">Xuất Excel</button><button class="btn pri" data-a="slprint">Xem và in sổ</button></div>' +
    '<div class="grid g3"><div class="kpi"><span>Đang làm việc</span><b>' + dang + '</b></div><div class="kpi"><span>Đã nghỉ</span><b>' + (emps.length - dang) + '</b></div><div class="kpi"><span>Hồ sơ còn thiếu thông tin</span><b>' + emps.filter(e => miss(e)).length + '</b></div></div>' +
    '<div class="notice small">Người sử dụng lao động phải lập sổ quản lý lao động (giấy hoặc bản điện tử) tại trụ sở trong vòng 30 ngày kể từ ngày bắt đầu hoạt động, cập nhật khi có thay đổi, và xuất trình khi cơ quan quản lý yêu cầu; đồng thời khai trình việc sử dụng lao động trong 30 ngày kể từ ngày bắt đầu hoạt động và báo cáo định kỳ thay đổi (Bộ luật Lao động 2019 Điều 12, Nghị định 145/2020/NĐ-CP Điều 3). Nội dung gồm họ tên, giới tính, ngày sinh, quốc tịch, nơi cư trú, số CCCD hoặc hộ chiếu, trình độ chuyên môn, bậc kỹ năng nghề, vị trí việc làm, loại hợp đồng, ngày bắt đầu làm việc, tham gia BHXH, tiền lương, nâng bậc lương, số ngày nghỉ phép năm, số giờ làm thêm, đào tạo, kỷ luật, trách nhiệm vật chất, tai nạn lao động, bệnh nghề nghiệp, ngày và lý do chấm dứt hợp đồng. Chưa có mẫu bắt buộc; cần đối chiếu văn bản hiện hành. Việc khai trình gửi cơ quan quản lý lao động phải làm trên hệ thống của cơ quan đó, phần mềm không nộp thay.</div>' +
    '<div class="card"><div class="row"><div class="tabs">' + tabs + '</div><input data-i="slq" placeholder="Tìm mã, tên" value="' + E(f.q) + '" size="20"></div><div class="tw" style="margin-top:8px;max-height:calc(100vh - 360px)"><table class="t ps"><thead><tr><th>STT</th><th>Mã</th><th>Họ và tên</th>' + FIELDS.map(c => '<th>' + c[1] + '</th>').join('') + '<th class="r">Tiền lương hiện tại</th><th>Số sổ BHXH</th><th class="r">Lương đóng BH</th><th class="r">Nghỉ phép năm (ngày)</th><th class="r">Giờ làm thêm năm</th><th title="Kỷ luật / trách nhiệm vật chất / tai nạn, bệnh nghề nghiệp">Kỷ luật / vật chất / TNLĐ</th><th>Quá trình</th></tr></thead><tbody>' + (body || '<tr><td colspan="30" class="muted" style="padding:16px">Chưa có nhân viên. Thêm tại Danh mục, mục Nhân viên.</td></tr>') + '</tbody></table></div></div>';
});
UI.act.sltab = el => { UI.sub.sl.st = el.dataset.k; UI.render(); };
UI.chg.slq = el => { UI.sub.sl.q = el.value; UI.render(); };
UI.chg.lao = el => { const e = S().employees[+el.dataset.i]; const k = el.dataset.k; let v = el.value.trim(); if (el.dataset.ty === 'd') v = D.parse(v) || ''; e[k] = v; KT.touch(true); };

/* quá trình làm việc */
UI.act.lsopen = el => {
  const i = +el.dataset.i; const e = S().employees[i]; UI.lsi = i; e.ls = e.ls || [];
  const rows = e.ls.map((x, j) => ({ x, j })).sort((a, b) => (a.x.ngay || '') < (b.x.ngay || '') ? 1 : -1).map(r => '<tr><td>' + D.fmt(r.x.ngay) + '</td><td>' + E(EVT[r.x.loai] || r.x.loai) + '</td><td>' + E(r.x.nd || '') + '</td><td class="r">' + (r.x.so ? F(KT.num(r.x.so)) : '') + '</td><td><button class="btn sm dng" data-a="lsdel" data-j="' + r.j + '">✕</button></td></tr>').join('');
  UI.modal('Quá trình làm việc – ' + e.name,
    '<div class="row" style="margin-bottom:10px"><label class="f">Ngày<input id="lsn" value="' + D.fmt(D.today()) + '" size="10"></label><label class="f">Loại<select id="lsl">' + EV.map(o => '<option value="' + o[0] + '">' + o[1] + '</option>').join('') + '</select></label><label class="f" style="flex:1;min-width:200px">Nội dung<input id="lsd" placeholder="Ví dụ: Nâng lương từ 12 triệu lên 14 triệu theo QĐ số 05"></label><label class="f">Số tiền hoặc số ngày<input id="lss" size="10"></label><button class="btn pri" data-a="lsadd">Thêm</button></div>' +
    '<div class="tw"><table class="t"><thead><tr><th>Ngày</th><th>Loại</th><th>Nội dung</th><th class="r">Số</th><th></th></tr></thead><tbody>' + (rows || '<tr><td colspan="5" class="muted">Chưa ghi nhận sự kiện nào</td></tr>') + '</tbody></table></div>', '<button class="btn pri" data-a="close">Xong</button>', true);
};
UI.act.lsadd = () => { const e = S().employees[UI.lsi]; const d = D.parse($('#lsn').value); if (!d) { UI.toast('Ngày không hợp lệ'); return; } e.ls.push({ ngay: d, loai: $('#lsl').value, nd: $('#lsd').value.trim(), so: KT.num($('#lss').value) }); KT.touch(true); UI.act.lsopen({ dataset: { i: UI.lsi } }); };
UI.act.lsdel = el => { S().employees[UI.lsi].ls.splice(+el.dataset.j, 1); KT.touch(true); UI.act.lsopen({ dataset: { i: UI.lsi } }); };

/* in sổ */
const book = () => {
  const c = S().company, y = yr(); const TD = 'border:1px solid #000;padding:3px 4px;vertical-align:top', TH = TD + ';text-align:center';
  const rows = S().employees.map((e, n) => { const a = info(e, y), cu = cur(e); const ls = (e.ls || []).slice().sort((p, q) => (p.ngay || '') < (q.ngay || '') ? -1 : 1).map(x => D.fmt(x.ngay) + ' ' + (EVT[x.loai] || '') + (x.nd ? ': ' + x.nd : '') + (x.so ? ' (' + F(KT.num(x.so)) + ')' : '')).join('; ');
    return '<tr>' + [n + 1, e.name, e.gioiTinh || '', D.fmt(e.ngaySinh), e.quocTich || '', e.cccd || '', e.cuTru || '', e.trinhDo || '', e.bacKyNang || '', e.chucDanh || '', LHDT[e.loaiHD || ''] + (e.soHD ? ' số ' + e.soHD : '') + (e.ngayHD ? ' ngày ' + D.fmt(e.ngayHD) : ''), D.fmt(e.vao), (e.soBHXH ? 'Sổ ' + e.soBHXH + '; ' : '') + 'mức đóng ' + F(cu.baseBH), F(KT.num(e.luongCB)), a.phep, a.ot, a.kl + ' / ' + a.vc + ' / ' + a.tn, ls, e.nghi ? D.fmt(e.nghi) + (e.lyDoNghi ? ': ' + e.lyDoNghi : '') : ''].map(v => '<td style="' + TD + '">' + E(String(v)) + '</td>').join('') + '</tr>'; }).join('');
  const h = ['STT', 'Họ và tên', 'Giới tính', 'Ngày sinh', 'Quốc tịch', 'Số CCCD, hộ chiếu', 'Nơi cư trú', 'Trình độ chuyên môn', 'Bậc kỹ năng nghề', 'Vị trí việc làm', 'Loại hợp đồng', 'Bắt đầu làm việc', 'Tham gia BHXH', 'Tiền lương', 'Nghỉ phép năm (ngày)', 'Giờ làm thêm', 'Kỷ luật / vật chất / TNLĐ', 'Nâng lương, đào tạo, khác', 'Chấm dứt hợp đồng'].map(t => '<th style="' + TH + '">' + t + '</th>').join('');
  return '<div style="font:11px/1.4 \'Times New Roman\',serif;color:#000;background:#fff;padding:12px"><div style="display:flex;justify-content:space-between"><div><b>' + E(c.name || 'Tên đơn vị') + '</b><br>' + E(c.address || '') + (c.mst ? '<br>MST: ' + E(c.mst) : '') + '</div><div style="text-align:center"><i>Lập theo Nghị định 145/2020/NĐ-CP, Điều 3</i></div></div><div style="text-align:center;margin:10px 0"><h2 style="font-size:18px;margin:0">SỔ QUẢN LÝ LAO ĐỘNG</h2><i>Năm ' + y + '. Cập nhật đến ngày ' + D.fmt(D.today()) + '</i></div><table style="width:100%;border-collapse:collapse"><tr>' + h + '</tr>' + rows + '</table><div style="display:flex;justify-content:space-around;text-align:center;margin-top:14px"><div><b>Người lập sổ</b><br><i>(Ký, họ tên)</i><br><br><br>' + E(c.nguoiLap || '') + '</div><div><b>Người sử dụng lao động</b><br><i>(Ký, đóng dấu)</i><br><br><br>' + E(c.giamDoc || '') + '</div></div></div>';
};
UI.soLDHtml = () => book();
UI.act.slprint = () => { const h = book(); UI.vp = { h, name: 'SoQuanLyLaoDong_' + yr(), land: true }; UI.modal('Sổ quản lý lao động', '<div style="border:1px solid var(--line);overflow:auto;max-height:62vh;background:#fff">' + h + '</div>', '<button class="btn" data-a="close">Đóng</button><button class="btn" data-a="vsave">Tải file HTML</button><button class="btn pri" data-a="vdoprint">In</button>', true); };
UI.act.slxls = () => { const y = yr(); let h = '<table><tr>' + ['STT', 'Mã', 'Họ và tên', ...FIELDS.map(c => c[1]), 'Tiền lương', 'Số sổ BHXH', 'Lương đóng BH', 'Nghỉ phép năm', 'Giờ làm thêm', 'Kỷ luật', 'Trách nhiệm vật chất', 'TNLĐ, BNN'].map(t => '<th>' + t + '</th>').join('') + '</tr>'; S().employees.forEach((e, n) => { const a = info(e, y), cu = cur(e); h += '<tr>' + [n + 1, e.code, e.name, ...FIELDS.map(c => c[2] === 'd' ? D.fmt(e[c[0]]) : c[3] && c[0] === 'loaiHD' ? LHDT[e.loaiHD || ''] : e[c[0]] || ''), Math.round(KT.num(e.luongCB)), e.soBHXH || '', Math.round(cu.baseBH), a.phep, a.ot, a.kl, a.vc, a.tn].map(v => '<td style="mso-number-format:\'@\'">' + E(String(v == null ? '' : v)) + '</td>').join('') + '</tr>'; }); UI.xls('SoQuanLyLaoDong_' + y, 'Sổ quản lý lao động', h + '</table>'); };

/* kiểm tra hồ sơ lao động */
KT.extraChecks.push((L, add) => {
  const last = L.last || D.today();
  const act = S().employees.filter(e => H.activeIn(e, last.slice(0, 7)));
  const thieu = act.filter(e => ['gioiTinh', 'ngaySinh', 'cuTru', 'loaiHD', 'soHD'].some(k => !e[k]));
  if (thieu.length) add('info', 'I31', thieu.length + ' nhân viên chưa đủ thông tin cho Sổ quản lý lao động (giới tính, ngày sinh, nơi cư trú, loại và số hợp đồng)', null);
  act.filter(e => e.hanHD && e.hanHD >= last && e.hanHD <= D.addDays(last, 30)).forEach(e => add('info', 'I32', e.code + ' ' + e.name + ': hợp đồng hết hạn ngày ' + D.fmt(e.hanHD) + ', cần gia hạn hoặc ký mới', null));
  act.filter(e => e.loaiHD === 'thuviec' && e.vao && D.addDays(e.vao, 60) < last).forEach(e => add('info', 'I33', e.code + ' ' + e.name + ': thử việc đã quá 60 ngày, kiểm tra thời hạn thử việc tối đa theo loại công việc và chuyển sang hợp đồng chính thức (có đóng bảo hiểm)', null));
});
})(typeof globalThis !== 'undefined' ? globalThis : window);
