/* ===== GIAO DIỆN 11: TRUNG TÂM IN =====
   Một chỗ duy nhất để in: sổ kế toán, báo cáo tài chính, tờ khai thuế, chứng từ, hồ sơ lao động – bảo hiểm.
   In hàng loạt: tích chọn nhiều mục, bấm “Ghép thành một file” (mỗi mục một trang, ngắt trang sẵn).
   Dữ liệu lấy từ các màn hình đã có; không nhập thêm. Trong khung của ứng dụng không mở được hộp thoại in,
   nên in = tải file HTML (mở bằng trình duyệt rồi Ctrl+P) hoặc xem trước. */
(function (G) {
'use strict';
const KT = G.KT, UI = KT.ui, D = KT.d, E = KT.esc, S = () => KT.S, R = KT.rep, T = KT.tax;
const PB = h => '<div style="page-break-after:always;break-after:page">' + h + '</div>';
const err = (n, e) => '<div style="padding:16px;font:13px Arial;color:#900">Không lập được “' + E(n) + '”: ' + E(e && e.message || String(e)) + '</div>';
const repHtml = r => KT.forms.render(r) || KT.forms2.book(r) || '<p style="padding:16px">Không có dữ liệu.</p>';
const prm = () => UI.sub.pc = Object.assign({ tk: '', vt: '', dt: '', ky: '', ym: '', sel: {}, g: 'so' }, UI.sub.pc);
const accts = () => { const s = new Set(); S().journal.forEach(l => { if (l.no) s.add(String(l.no).slice(0, 3)); if (l.co) s.add(String(l.co).slice(0, 3)); }); return [...s].sort(); };
const yearOf = p => +p.to.slice(0, 4);
const vouchers = (p, k) => KT.compute().vouchers.filter(v => v.key && v.date >= p.from && v.date <= p.to && UI.voucherKind(v) === k).sort((a, b) => a.date < b.date ? -1 : 1);
const sers = () => T.vatSeries(KT.compute().last || D.today());
const kyGt = o => { const s = sers(); return s.find(x => x.per.key === o.ky) || s[s.length - 1]; };

/* ----- danh mục các mục in: id, nhóm, tên, mẫu, nơi dùng, hàm dựng HTML ----- */
const CAT = () => {
  const p = UI.P(), o = prm(), A = [];
  const add = (g, id, name, mau, note, fn, land) => A.push({ g, id, name, mau, note, fn, land });
  /* sổ kế toán */
  add('so', 'nk', 'Sổ Nhật ký chung', 'S03a-DN', 'Theo kỳ đang chọn', () => repHtml(R.nhatKy(p.from, p.to)));
  add('so', 'sc', 'Sổ Cái ' + (o.tk ? 'TK ' + o.tk : '(mọi TK có phát sinh)'), 'S03b-DN', 'Chọn TK ở khung tham số; để trống = in tất cả', () => (o.tk ? [o.tk] : accts()).map(tk => PB(repHtml(R.soCai(tk, p.from, p.to, o.dt ? { dt: o.dt } : {})))).join(''));
  add('so', 'qt', 'Sổ quỹ tiền mặt', 'S07-DN', '', () => repHtml(R.soQuy('111', p.from, p.to)));
  add('so', 'qg', 'Sổ tiền gửi ngân hàng', 'S08-DN', '', () => repHtml(R.soQuy('112', p.from, p.to)));
  add('so', 'cn', 'Sổ chi tiết công nợ phải thu, phải trả', 'S31-DN', 'Cả 131 và 331', () => ['131', '331'].map(t => PB(repHtml(R.congNo(t, p.from, p.to)))).join(''));
  add('so', 'tk', 'Bảng cân đối số phát sinh', 'Phụ biểu', '', () => repHtml(R.cdps(p.from, p.to)));
  add('so', 'nxt', 'Tổng hợp nhập – xuất – tồn', 'S11-DN', '', () => repHtml(R.nxt(p.from, p.to)));
  add('so', 'tkho', 'Thẻ kho ' + (o.vt || '(mọi mã hàng)'), 'S12-DN', 'Chọn mã ở khung tham số', () => (o.vt ? [o.vt] : S().items.map(x => x.code)).map(v => PB(repHtml(R.theKho(v, p.from, p.to)))).join(''));
  add('so', 'tscd', 'Sổ tài sản cố định', 'S21-DN', '', () => repHtml(R.tscd(p.from, p.to)));
  add('so', 'cp', 'Sổ chi phí sản xuất, kinh doanh', 'S36-DN', '', () => repHtml(R.chiPhi(p.from, p.to)));
  add('so', 'bh', 'Sổ chi tiết bán hàng', 'S35-DN', '', () => repHtml(R.banHang(p.from, p.to)));
  add('so', 'nkt', 'Nhật ký thu tiền', 'S03a1-DN', '', () => repHtml(R.nkTien('thu', p.from, p.to)));
  add('so', 'nkc', 'Nhật ký chi tiền', 'S03a2-DN', '', () => repHtml(R.nkTien('chi', p.from, p.to)));
  add('so', 'nkm', 'Nhật ký mua hàng', 'S03a3-DN', '', () => repHtml(R.nkMua(p.from, p.to)));
  add('so', 'nkb', 'Nhật ký bán hàng', 'S03a4-DN', '', () => repHtml(R.nkBan(p.from, p.to)));
  /* báo cáo tài chính */
  const y = yearOf(p), py = (d) => D.addDays(d, -365);
  add('bc', 'b01', 'Báo cáo tình hình tài chính', 'B01-DN', 'Tại ngày cuối kỳ', () => repHtml(R.b01(p.to, D.addDays(D.iso(y, 1, 1), -1))));
  add('bc', 'b02', 'Báo cáo kết quả hoạt động kinh doanh', 'B02-DN', '', () => repHtml(R.b02(p.from, p.to, py(p.from), py(p.to))));
  add('bc', 'b03', 'Báo cáo lưu chuyển tiền tệ', 'B03-DN', 'Phương pháp trực tiếp', () => repHtml(R.b03(p.from, p.to, py(p.from), py(p.to))));
  add('bc', 'b09', 'Bản thuyết minh báo cáo tài chính', 'B09-DN', '', () => { const r = R.b09(p.from, p.to); return r.cols ? repHtml(r) : UI.routeHtml('bctc', 'Thuyết minh'); });
  /* thuế */
  const s = kyGt(o);
  add('th', 'gt', '01/GTGT – Tờ khai thuế GTGT' + (s ? ' (' + s.per.label + ')' : ''), '01/GTGT', 'Chọn kỳ ở khung tham số', () => s ? KT.forms2.gtgt(s) : '<p>Chưa có dữ liệu</p>');
  add('th', 'g1', 'Bảng kê bán ra', '01-1/GTGT', 'Kèm tờ khai 01/GTGT', () => s ? KT.forms2.bkBan(s) : '');
  add('th', 'g2', 'Bảng kê mua vào', '01-2/GTGT', 'Kèm tờ khai 01/GTGT', () => s ? KT.forms2.bkMua(s) : '');
  add('th', 'tn', '03/TNDN – Quyết toán thuế TNDN năm ' + y, '03/TNDN', 'Chưa kèm phụ lục 03-1A…', () => KT.forms2.tndn(y));
  add('th', 'tc', '05/KK-TNCN – Khấu trừ thuế TNCN (kỳ đang chọn)', '05/KK-TNCN', 'Kèm bảng kê 05-1/BK', () => KT.forms2.tncn({ from: p.from, to: p.to, label: p.label }));
  add('th', 'qt', '05/QTT-TNCN – Quyết toán thuế TNCN năm ' + y, '05/QTT-TNCN', 'Kèm phụ lục chi tiết từng người', () => KT.forms2.qtt(y));
  add('th', 'mb', 'Tờ khai lệ phí môn bài năm ' + y, '01/MBAI', '', () => KT.forms2.monbai(y));
  add('th', 'nv', 'Lịch nghĩa vụ với cơ quan nhà nước', 'Danh sách', 'Mẫu, nơi nhận, hạn nộp', () => UI.routeHtml('nghiavu', 'Nghĩa vụ với cơ quan nhà nước'));
  /* lao động */
  const ym = o.ym || p.to.slice(0, 7);
  Object.keys(UI.html6.DOC).forEach(k => { const d = UI.html6.DOC[k]; add('ld', 'd' + k, d.name, d.code || 'Mẫu LĐ', 'Tháng ' + ym.slice(5) + '/' + ym.slice(0, 4), () => UI.html6.doc(k, ym)); });
  add('ld', 'd02', 'Danh sách lao động tham gia BHXH, BHYT, BHTN', 'D02-LT', 'Tháng ' + ym.slice(5) + '/' + ym.slice(0, 4), () => KT.forms2.d02(ym));
  add('ld', 'ps', 'Phiếu lương của mọi nhân viên', 'Phiếu', 'Tháng ' + ym.slice(5) + '/' + ym.slice(0, 4), () => UI.html6.slips(ym));
  add('ld', 'tl', 'Thang lương', 'Điều 93 BLLĐ', 'Gửi cơ quan lao động khi lập', () => UI.routeHtml('thangluong', 'Thang lương'));
  add('ld', 'bl', 'Bảng lương chức danh', 'Điều 93 BLLĐ', '', () => UI.routeHtml('bangmuc', 'Bảng lương chức danh'));
  add('ld', 'sl', 'Sổ quản lý lao động', 'Nghị định 145/2020', '', () => UI.soLDHtml());
  /* chứng từ */
  [['thu', 'Phiếu thu', '01-TT'], ['chi', 'Phiếu chi', '02-TT'], ['nhap', 'Phiếu nhập kho', '01-VT'], ['xuat', 'Phiếu xuất kho', '02-VT'], ['chung', 'Chứng từ kế toán khác', 'Chung']].forEach(([k, n, m]) => {
    const vs = vouchers(p, k); add('ct', 'c' + k, n + ' (' + vs.length + ' chứng từ trong kỳ)', m, 'Mỗi chứng từ một trang', () => vs.map(v => PB(UI.voucherHtml(v, k))).join('') || '<p style="padding:16px">Không có chứng từ trong kỳ.</p>');
  });
  return A;
};
const GROUPS = [['so', 'Sổ kế toán'], ['bc', 'Báo cáo tài chính'], ['th', 'Tờ khai thuế & nghĩa vụ'], ['ld', 'Lao động – bảo hiểm'], ['ct', 'Chứng từ']];
const build = it => { try { return it.fn(); } catch (e) { return err(it.name, e); } };
const doc = (title, body) => '<!doctype html><meta charset="utf-8"><title>' + E(title) + '</title><style>@page{size:A4;margin:10mm}body{margin:0;background:#fff;color:#000}</style>' + body;
const pick = () => { const o = prm(); const c = CAT(); return c.filter(x => o.sel[x.id]); };

UI.route('in', 'In sổ, báo cáo, chứng từ', 'Sổ sách & báo cáo', true, () => {
  const o = prm(), cat = CAT(), p = UI.P(), sel = cat.filter(x => o.sel[x.id]).length;
  const tab = GROUPS.map(g => '<button class="' + (o.g === g[0] ? 'on' : '') + '" data-a="pcg" data-k="' + g[0] + '">' + g[1] + ' <span class="muted">(' + cat.filter(x => x.g === g[0]).length + ')</span></button>').join('');
  const items = cat.filter(x => x.g === o.g);
  const ser = sers();
  const par = (o.g === 'so' ? '<label class="f">Tài khoản (sổ cái)<input data-c="pcp" data-k="tk" value="' + E(o.tk) + '" size="8" list="dl-acc" placeholder="trống = tất cả"></label><label class="f">Đối tượng<input data-c="pcp" data-k="dt" value="' + E(o.dt) + '" size="10" list="dl-pt" placeholder="trống = tất cả"></label><label class="f">Mã hàng (thẻ kho)<input data-c="pcp" data-k="vt" value="' + E(o.vt) + '" size="10" list="dl-vt" placeholder="trống = tất cả"></label>'
    : o.g === 'th' ? '<label class="f">Kỳ GTGT<select data-c="pcp" data-k="ky">' + ser.map(x => '<option value="' + x.per.key + '"' + (x.per.key === (kyGt(o) || { per: {} }).per.key ? ' selected' : '') + '>' + E(x.per.label || x.per.key) + '</option>').join('') + '</select></label>'
    : o.g === 'ld' ? '<label class="f">Tháng lương<input type="month" data-c="pcp" data-k="ym" value="' + (o.ym || p.to.slice(0, 7)) + '"></label>' : '<span class="muted small">Dùng kỳ đang chọn ở thanh trên: ' + E(p.label) + '</span>');
  const dl = '<datalist id="dl-acc">' + S().accounts.map(a => '<option value="' + E(a.code) + '">' + E(a.name) + '</option>').join('') + '</datalist><datalist id="dl-pt">' + S().partners.concat(S().employees).map(x => '<option value="' + E(x.code) + '">' + E(x.name) + '</option>').join('') + '</datalist><datalist id="dl-vt">' + S().items.map(x => '<option value="' + E(x.code) + '">' + E(x.name) + '</option>').join('') + '</datalist>';
  return dl + '<div class="ph"><div><h1>In sổ, báo cáo, chứng từ</h1><div class="sub">Một chỗ để xem và in tất cả. Tích chọn nhiều mục rồi “Ghép thành một file” để in hàng loạt; mỗi mục bắt đầu ở trang mới. Kỳ lấy theo thanh trên: <b>' + E(p.label) + '</b>.</div></div></div>' +
    '<div class="card"><div class="tabs" style="margin-bottom:8px">' + tab + '</div><div class="row">' + par + '</div></div>' +
    '<div class="card"><div class="row" style="margin-bottom:8px"><button class="btn sm" data-a="pcall" data-k="1">Chọn cả nhóm</button><button class="btn sm" data-a="pcall" data-k="0">Bỏ chọn nhóm</button><span class="grow"></span><span class="muted small">Đã chọn ' + sel + ' mục</span><button class="btn" data-a="pcgo"' + (sel ? '' : ' disabled') + '>Xem trước các mục đã chọn</button><button class="btn pri" data-a="pcsaveall"' + (sel ? '' : ' disabled') + '>Ghép thành một file để in</button></div>' +
    '<div class="tw"><table class="t"><thead><tr><th style="width:34px"></th><th>Mục in</th><th>Mẫu</th><th>Ghi chú</th><th></th></tr></thead><tbody>' + items.map(x => '<tr><td><input type="checkbox" data-c="pcsel" data-k="' + x.id + '"' + (o.sel[x.id] ? ' checked' : '') + '></td><td>' + E(x.name) + '</td><td><span class="pill">' + E(x.mau) + '</span></td><td class="muted small">' + E(x.note) + '</td><td class="r nw"><button class="btn sm" data-a="pcview" data-k="' + x.id + '">Xem</button> <button class="btn sm" data-a="pcsave" data-k="' + x.id + '">Tải HTML</button></td></tr>').join('') + '</tbody></table></div>' +
    '<p class="muted small" style="margin:8px 0 0">Mẫu tờ khai và sổ dựng theo Thông tư 80/2021/TT-BTC và 99/2025/TT-BTC; hãy đối chiếu với mẫu hiện hành của cơ quan thuế trước khi nộp. Muốn in từng chứng từ riêng lẻ: <a href="#" data-a="pcmauct">chọn chứng từ</a>.</p></div>';
});
UI.act.pcg = el => { prm().g = el.dataset.k; UI.render(); };
UI.chg.pcsel = el => { prm().sel[el.dataset.k] = el.checked; UI.render(); };
UI.chg.pcp = el => { prm()[el.dataset.k] = el.value.trim(); UI.render(); };
UI.act.pcall = el => { const o = prm(); CAT().filter(x => x.g === o.g).forEach(x => { o.sel[x.id] = el.dataset.k === '1'; }); UI.render(); };
UI.act.pcmauct = () => UI.go('mauct');
UI.act.pcview = el => { const x = CAT().find(i => i.id === el.dataset.k); if (x) UI.preview(x.name, build(x), { name: x.id }); };
UI.act.pcsave = el => { const x = CAT().find(i => i.id === el.dataset.k); if (x) UI.download(x.id + '.html', 'text/html', doc(x.name, build(x))); };
UI.act.pcgo = () => { const l = pick(); if (l.length) UI.preview('Các mục đã chọn (' + l.length + ')', l.map(x => PB(build(x))).join(''), { name: 'in-hang-loat' }); };
UI.act.pcsaveall = () => { const l = pick(); if (l.length) UI.download('in-hang-loat_' + UI.P().to + '.html', 'text/html', doc('In hàng loạt', l.map(x => PB(build(x))).join(''))); };
UI.printAll = () => CAT();

/* ----- in tờ khai theo mẫu từ Lịch nghĩa vụ và từ từng màn hình thuế (nav = 'gtgt:<kỳ>', 'tncn:<kỳ|năm>', 'tndn:<năm>', 'monbai', 'bhxh:<yyyy-mm>', 'b01') ----- */
const lastY = () => +(KT.compute().last || D.today()).slice(0, 4);
UI.navPrint = (nav, route) => {
  const [a, b] = String(nav || route || '').split(':'), p = UI.P(), L = KT.compute();
  try {
    if (a === 'gtgt') { const s = sers(), r = s.find(x => x.per.key === (b || UI.sub.gtgt)) || s[s.length - 1]; if (!r) return UI.toast('Chưa có dữ liệu để lập tờ khai'); return UI.preview('01/GTGT ' + r.per.label, [KT.forms2.gtgt(r), KT.forms2.bkBan(r), KT.forms2.bkMua(r)].join(''), { name: '01GTGT_' + r.per.key, note: 'Gồm tờ khai 01/GTGT, bảng kê 01-1 và 01-2. Đối chiếu với mẫu hiện hành trước khi nộp.' }); }
    if (a === 'tncn') { const key = b || UI.sub.tncn; if (/^\d{4}$/.test(String(key))) return UI.preview('05/QTT-TNCN năm ' + key, KT.forms2.qtt(+key), { name: '05QTT_' + key }); const pers = T.periods(S().company.kyTNCN, L.first || D.today(), L.last || D.today()), per = pers.find(x => x.key === key) || pers[pers.length - 1]; if (!per) return UI.toast('Chưa có dữ liệu'); return UI.preview('05/KK-TNCN ' + per.label, KT.forms2.tncn(per), { name: '05KK_' + per.key }); }
    if (a === 'tndn') { const y = +b || +UI.sub.tndn || lastY(); return UI.preview('03/TNDN năm ' + y, KT.forms2.tndn(y), { name: '03TNDN_' + y, note: 'Chưa kèm các phụ lục 03-1A, 03-2A… của mẫu.' }); }
    if (a === 'monbai') { const y = +b || UI.sub.mbY || lastY(); return UI.preview('01/MBAI năm ' + y, KT.forms2.monbai(y), { name: '01MBAI_' + y }); }
    if (a === 'bhxh') { const ym = b || p.to.slice(0, 7); return UI.preview('D02-LT tháng ' + ym, KT.forms2.d02(ym), { name: 'D02LT_' + ym }); }
    if (a === 'bctc' || a === 'b01') { const y = yearOf(p), py = d => D.addDays(d, -365); const hs = [KT.rep.b01(p.to, D.addDays(D.iso(y, 1, 1), -1)), KT.rep.b02(p.from, p.to, py(p.from), py(p.to)), KT.rep.b03(p.from, p.to, py(p.from), py(p.to)), KT.rep.b09(p.from, p.to)].map(r => r.cols ? repHtml(r) : '').join(''); return UI.preview('Báo cáo tài chính ' + p.label, hs, { name: 'BCTC_' + p.to }); }
    UI.go(a);
  } catch (e) { UI.toast('Không lập được: ' + e.message); }
};
UI.act.nvprint = el => UI.navPrint(el.dataset.n);
/* thanh “In theo mẫu” ở đầu các màn hình thuế, bảo hiểm */
const bar = (nav, label) => '<div class="row noprint" style="margin-bottom:8px"><button class="btn pri" data-a="nvprint" data-n="' + nav + '">' + label + '</button><button class="btn" data-a="nvin">Mở Trung tâm in</button><span class="muted small">Bố cục theo mẫu của văn bản pháp luật; xem trước rồi tải file để in.</span></div>';
UI.act.nvin = () => UI.go('in');
const PR = {
  gtgt: () => { const s = sers(), r = s.find(x => x.per.key === UI.sub.gtgt) || s[s.length - 1]; return r ? bar('gtgt:' + r.per.key, 'In tờ khai 01/GTGT và bảng kê (' + E(r.per.label) + ')') : ''; },
  tndn: () => bar('tndn:' + (UI.sub.tndn || lastY()), 'In tờ khai quyết toán 03/TNDN'),
  tncn: () => { const k = UI.sub.tncn; const pers = T.periods(S().company.kyTNCN, KT.compute().first || D.today(), KT.compute().last || D.today()), per = pers.find(x => x.key === k) || pers[pers.length - 1]; const y = /^\d{4}$/.test(String(k)) ? +k : (per ? +per.from.slice(0, 4) : lastY()); return bar('tncn:' + (per ? per.key : y), 'In tờ khai 05/KK-TNCN' + (per ? ' (' + E(per.label) + ')' : '')) .replace('<button class="btn" data-a="nvin">', '<button class="btn pri" data-a="nvprint" data-n="tncn:' + y + '">In quyết toán 05/QTT-TNCN năm ' + y + '</button><button class="btn" data-a="nvin">'); },
  monbai: () => bar('monbai:' + (UI.sub.mbY || lastY()), 'In tờ khai lệ phí môn bài 01/MBAI'),
  bhxh: () => bar('bhxh:' + UI.P().to.slice(0, 7), 'In danh sách lao động D02-LT'),
  bctc: () => bar('bctc', 'In bộ báo cáo tài chính (B01, B02, B03, B09)')
};
Object.keys(PR).forEach(k => { const r = UI.routes[k]; if (!r) return; const fn = r.fn; r.fn = function () { let h = fn.apply(this, arguments); const b = PR[k](); return b ? (/^<datalist[^]*?<\/datalist>/.test(h) ? h : '') + b + h.replace(/^<datalist[^]*?<\/datalist>/, '') : h; }; });
})(window);
