/* ===== GIAO DIỆN 10: Ctrl+K, Nhập nhanh hóa đơn nhiều dòng, thang bảng lương, quy ước mã, tải file, phân quyền ===== */
(function (G) {
'use strict';
const KT = G.KT, UI = KT.ui, D = KT.d, E = KT.esc, F = KT.f, S = () => KT.S, $ = UI.$;

/* ---------- tải file qua capability downloads (window.open, print bị chặn trong khung) ---------- */
let dlCap = null;
(async () => { try { dlCap = G.claude ? await G.claude.use('downloads') : null; } catch (e) { dlCap = null; } })();
const dl0 = UI.download;
UI.download = (name, mime, content) => {
  if (!dlCap) return dl0(name, mime, content);
  dlCap.save({ filename: name, data: new Blob(['﻿' + content], { type: mime + ';charset=utf-8' }) })
    .then(() => UI.toast('Đã lưu file ' + name)).catch(e => { if (!e || e.code !== 'cancelled') UI.toast('Chưa lưu được file ' + name); });
};
UI.act.vdoprint = () => UI.act.vsave();
UI.act.printrep = () => UI.toast('Trong phần mềm này không mở được hộp thoại in. Bấm Xuất Excel hoặc Tải file HTML rồi in từ file.');

/* ---------- chỉ Quản trị được nạp mẫu, xóa, khôi phục khi dùng chung ---------- */
['demo', 'restore', 'wipe', 'snaprest'].forEach(n => {
  const f = UI.act[n]; if (!f) return;
  UI.act[n] = function () { if (KT.dbMode && KT.role !== 'quantri') { UI.toast('Chỉ Quản trị được thao tác này trên dữ liệu dùng chung.'); return; } return f.apply(this, arguments); };
});

/* ---------- khung: nút tìm, nhãn vai trò, cột trái giữ vị trí cuộn và thu gọn theo nhóm ---------- */
UI.navClosed = {};
const render0 = UI.render;
UI.render = function () {
  const old = $('.side'); const st = old ? old.scrollTop : 0;
  render0.apply(this, arguments);
  const top = $('.top'); if (top && !$('#cmdk-btn')) {
    const sp = top.querySelector('.sp');
    const b = document.createElement('button'); b.className = 'btn sm'; b.id = 'cmdk-btn'; b.dataset.a = 'cmdk'; b.title = 'Tìm sổ, danh mục, chứng từ, nhân viên'; b.textContent = 'Tìm · Ctrl+K';
    top.insertBefore(b, sp ? sp.nextSibling : null);
    if (KT.dbMode) { const p = document.createElement('span'); p.className = 'pill ' + (KT.readOnly ? 'warn' : 'ok'); p.textContent = KT.roleName(); p.title = 'Vai trò của bạn trên dữ liệu dùng chung'; top.insertBefore(p, b); }
  }
  const nav = $('.nav'); if (nav) {
    let g = null; [...nav.children].forEach(n => {
      if (n.classList.contains('nav-g')) { g = n.textContent; n.dataset.a = 'navg'; n.dataset.g = g; n.classList.toggle('closed', !!UI.navClosed[g]); n.setAttribute('role', 'button'); n.title = 'Thu gọn hoặc mở nhóm'; }
      else if (g && UI.navClosed[g] && !n.classList.contains('on')) n.style.display = 'none';
    });
  }
  const side = $('.side'); if (side) { side.scrollTop = st; const on = $('.nav a.on'); if (on) { const r = on.getBoundingClientRect(), q = side.getBoundingClientRect(); if (r.top < q.top + 40 || r.bottom > q.bottom - 40) on.scrollIntoView({ block: 'center' }); } }
};
UI.act.navg = el => { const g = el.dataset.g; UI.navClosed[g] = !UI.navClosed[g]; UI.render(); };

/* ====================== Ctrl+K ====================== */
const norm = s => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D').toLowerCase();
const index = () => {
  const out = [];
  Object.values(UI.routes).filter(r => r.g).forEach(r => out.push({ k: 'Màn hình', t: r.t, s: r.g, go: () => UI.go(r.id) }));
  [['BAN', 'Nhập nhanh: hóa đơn bán hàng'], ['MUA', 'Nhập nhanh: hóa đơn mua hàng'], ['THU', 'Nhập nhanh: phiếu thu tiền khách hàng'], ['CHI', 'Nhập nhanh: phiếu chi trả nhà cung cấp']].forEach(a => out.push({ k: 'Làm ngay', t: a[1], s: 'Nhập liệu', go: () => { UI.nn.loai = a[0]; UI.nn.lines = [blank()]; UI.go('nn'); } }));
  S().partners.forEach(p => out.push({ k: 'Đối tượng', t: p.code + ' · ' + p.name, s: (p.type || '') + (p.mst ? ' · MST ' + p.mst : ''), go: () => UI.dmGo('dt', p.code) }));
  S().items.forEach(p => out.push({ k: 'Hàng hóa', t: p.code + ' · ' + p.name, s: (p.unit || '') + ' · TK ' + p.tk, go: () => UI.dmGo('vt', p.code) }));
  S().employees.forEach(p => out.push({ k: 'Nhân viên', t: p.code + ' · ' + p.name, s: p.chucDanh || '', go: () => UI.dmGo('nv', p.code) }));
  const seen = {}; S().journal.forEach(l => { if (l.ct && !seen[l.ct]) { seen[l.ct] = 1; out.push({ k: 'Chứng từ', t: l.ct + ' · ' + (l.dg || ''), s: D.fmt(l.ng), go: () => { UI.ps.q = l.ct; UI.go('ps'); } }); } });
  return out;
};
let cm = null;
const cmRender = () => {
  const q = norm(cm.q), toks = q.split(/\s+/).filter(Boolean);
  let rs = cm.all.filter(x => { const h = norm(x.t + ' ' + x.s + ' ' + x.k); return toks.every(t => h.includes(t)); });
  const rank = x => { const t = norm(x.t); return (toks.length && t.startsWith(toks[0]) ? 0 : 1) + (x.k === 'Màn hình' || x.k === 'Làm ngay' ? 0 : 2); };
  rs.sort((a, b) => rank(a) - rank(b)); cm.rs = rs.slice(0, 40); cm.i = Math.min(cm.i, Math.max(0, cm.rs.length - 1));
  $('#cmdk-list').innerHTML = cm.rs.length ? cm.rs.map((x, i) => '<div class="cmi' + (i === cm.i ? ' on' : '') + '" data-a="cmgo" data-i="' + i + '"><span class="cmk">' + E(x.k) + '</span><span class="cmt">' + E(x.t) + '</span><span class="cms">' + E(x.s) + '</span></div>').join('') : '<div class="cmi muted">Không có kết quả. Thử gõ mã khách hàng, số chứng từ, tên màn hình…</div>';
  const on = $('#cmdk-list .on'); if (on) on.scrollIntoView({ block: 'nearest' });
};
const cmClose = () => { const e = $('#cmdk'); if (e) e.remove(); cm = null; };
UI.act.cmdk = () => {
  if (cm) return cmClose();
  cm = { q: '', i: 0, all: index(), rs: [] };
  const d = document.createElement('div'); d.id = 'cmdk'; d.className = 'modal-bg';
  d.innerHTML = '<div class="cmbox" role="dialog" aria-modal="true" aria-label="Tìm nhanh"><input id="cmdk-in" placeholder="Tìm màn hình, khách hàng, hàng hóa, nhân viên, số chứng từ…" autocomplete="off"><div id="cmdk-list" class="cml"></div><div class="cmh">↑ ↓ chọn · Enter mở · Esc đóng</div></div>';
  d.addEventListener('mousedown', e => { if (e.target === d) cmClose(); });
  document.body.appendChild(d); cmRender(); $('#cmdk-in').focus();
  $('#cmdk-in').addEventListener('input', e => { cm.q = e.target.value; cm.i = 0; cmRender(); });
};
UI.act.cmgo = el => { const x = cm && cm.rs[+el.dataset.i]; cmClose(); if (x) x.go(); };
document.addEventListener('keydown', e => {
  if ((e.ctrlKey || e.metaKey) && (e.key === 'k' || e.key === 'K')) { e.preventDefault(); UI.act.cmdk(); return; }
  if (!cm) return;
  if (e.key === 'Escape') { e.stopPropagation(); cmClose(); }
  else if (e.key === 'ArrowDown') { e.preventDefault(); cm.i = Math.min(cm.rs.length - 1, cm.i + 1); cmRender(); }
  else if (e.key === 'ArrowUp') { e.preventDefault(); cm.i = Math.max(0, cm.i - 1); cmRender(); }
  else if (e.key === 'Enter') { e.preventDefault(); const x = cm.rs[cm.i]; cmClose(); if (x) x.go(); }
}, true);

/* ====================== NHẬP NHANH ====================== */
const blank = () => ({ vt: '', sl: '', gia: '', thue: '' });
UI.nn = { loai: 'BAN', ng: '', dt: '', tt: '', hd: '', kh: '', nhd: '', dg: '', tien: '', tk: '112', lines: [blank()], last: '' };
const TYPES = { BAN: ['Bán hàng', 'Khách hàng', 'HD'], MUA: ['Mua hàng', 'Nhà cung cấp', 'MH'], THU: ['Thu tiền khách hàng', 'Khách hàng', 'PT'], CHI: ['Trả tiền nhà cung cấp', 'Nhà cung cấp', 'PC'] };
const PAY = { BAN: [['131', 'Chưa thu tiền (ghi công nợ 131)'], ['111', 'Tiền mặt (111)'], ['112', 'Chuyển khoản (112)']], MUA: [['331', 'Chưa trả tiền (ghi công nợ 331)'], ['111', 'Tiền mặt (111)'], ['112', 'Chuyển khoản (112)'], ['141', 'Trừ tạm ứng (141)']] };
const item = c => S().items.find(x => x.code === c);
const partner = c => S().partners.find(x => x.code === c);
const rates = [['10', '10%'], ['8', '8% (giảm 2%)'], ['5', '5%'], ['0', '0%'], ['KCT', 'Không chịu thuế'], ['', 'Không có hóa đơn GTGT']];
const nnDefaultPay = n => n.tt || (n.loai === 'BAN' ? '131' : '331');
const nnLines = n => {   // trả về {ls, tot, err}
  const o = n.ng ? D.parse(n.ng) : ''; const err = []; if (!o) err.push('Chọn ngày chứng từ.');
  if (!n.dt) err.push('Chọn ' + TYPES[n.loai][1].toLowerCase() + '.'); else if (!partner(n.dt)) err.push('Mã đối tượng “' + n.dt + '” chưa có trong danh mục.');
  const ls = []; let base = 0, tax = 0;
  const hdr = l => Object.assign({ ng: o, hd: n.hd || '', kh: n.kh || '', nhd: D.parse(n.nhd) || '', nth: '' }, l);
  if (n.loai === 'THU' || n.loai === 'CHI') {
    const t = KT.num(n.tien); if (!(t > 0)) err.push('Nhập số tiền.');
    const dg = n.dg || (n.loai === 'THU' ? 'Thu tiền khách hàng ' : 'Trả tiền nhà cung cấp ') + n.dt;
    if (t > 0) ls.push(hdr({ dg, no: n.loai === 'THU' ? n.tk : '331', co: n.loai === 'THU' ? '131' : n.tk, st: t, dt: n.dt })); return { ls, base: t, tax: 0, err };
  }
  const tt = nnDefaultPay(n); let any = false;
  n.lines.forEach((r, i) => {
    if (!r.vt && !r.sl && !r.gia) return; any = true; const it = item(r.vt); const sl = KT.num(r.sl);
    if (!it) { err.push('Dòng ' + (i + 1) + ': mã hàng “' + r.vt + '” chưa có trong danh mục.'); return; }
    if (!(sl > 0)) { err.push('Dòng ' + (i + 1) + ': nhập số lượng.'); return; }
    const gia = r.gia !== '' && r.gia != null ? KT.num(r.gia) : KT.num(n.loai === 'BAN' ? it.giaBan : it.giaMua);
    if (!(gia > 0)) { err.push('Dòng ' + (i + 1) + ': chưa có đơn giá (nhập hoặc đặt giá chuẩn ở danh mục hàng hóa).'); return; }
    const th = r.thue !== '' && r.thue != null ? r.thue : (it.thue != null ? it.thue : '10'); const b = KT.rnd(sl * gia), rt = KT.rateOf(th), tx = rt ? KT.rnd(b * rt) : 0; base += b; tax += tx;
    const dg = n.dg || (n.loai === 'BAN' ? 'Bán ' : 'Mua ') + it.name + ' ' + (n.loai === 'BAN' ? 'cho ' : 'của ') + n.dt;
    if (n.loai === 'BAN') {
      ls.push(hdr({ dg, no: tt, co: it.tkDT || '5111', st: b, dt: n.dt, vt: it.code, sl, gia, thue: th, gt: b }));
      if (tx) ls.push(hdr({ dg, no: tt, co: '33311', st: tx, dt: n.dt, thue: th, gt: b }));
      if (it.loai !== 'DV') ls.push({ ng: o, dg: 'Giá vốn – ' + dg, no: '632', co: it.tk || '156', vt: it.code, sl, nth: '' });
    } else {
      ls.push(hdr({ dg, no: it.tk || '156', co: tt, st: b, dt: n.dt, vt: it.code, sl, gia, thue: th, gt: b }));
      if (tx) ls.push(hdr({ dg, no: '1331', co: tt, st: tx, dt: n.dt, thue: th, gt: b }));
    }
  });
  if (!any) err.push('Nhập ít nhất một dòng hàng.');
  return { ls, base, tax, err };
};
const nnCt = n => { const y = D.parse(n.ng) ? +D.parse(n.ng).slice(0, 4) : new Date().getFullYear(); return KT.auto.nextCt(TYPES[n.loai][2], y); };
UI.route('nn', 'Nhập nhanh hóa đơn, phiếu thu chi', 'Nhập liệu', false, () => {
  const n = UI.nn; if (!n.ng) n.ng = UI.lastDate || D.today();
  const isHd = n.loai === 'BAN' || n.loai === 'MUA'; const r = nnLines(n);
  const tabs = Object.keys(TYPES).map(k => '<button class="' + (n.loai === k ? 'on' : '') + '" data-a="nntab" data-k="' + k + '">' + TYPES[k][0] + '</button>').join('');
  const dl = '<datalist id="dl-nnpt">' + S().partners.filter(p => n.loai === 'BAN' || n.loai === 'THU' ? p.type !== 'NCC' : p.type !== 'KH').map(p => '<option value="' + E(p.code) + '">' + E(p.name) + '</option>').join('') + '</datalist><datalist id="dl-nnit">' + S().items.map(p => '<option value="' + E(p.code) + '">' + E(p.name) + '</option>').join('') + '</datalist>';
  const pt = partner(n.dt); const ptInfo = pt ? '<span class="small muted">' + E(pt.name) + (pt.mst ? ' · MST ' + E(pt.mst) : ' · <b class="neg">thiếu MST</b>') + (pt.dieuKhoan ? ' · hạn thanh toán ' + pt.dieuKhoan + ' ngày' : '') + '</span>' : '';
  const hdr = '<div class="grid2"><label class="f">Ngày chứng từ<input type="date" data-c="nnf" data-k="ng" value="' + E(D.parse(n.ng)) + '"></label><label class="f">' + TYPES[n.loai][1] + '<input list="dl-nnpt" data-c="nnf" data-k="dt" value="' + E(n.dt) + '" placeholder="Gõ mã hoặc tên rồi chọn" autocomplete="off">' + ptInfo + '</label>' +
    (isHd ? '<label class="f">Thanh toán<select data-c="nnf" data-k="tt">' + PAY[n.loai].map(o => '<option value="' + o[0] + '"' + (nnDefaultPay(n) === o[0] ? ' selected' : '') + '>' + E(o[1]) + '</option>').join('') + '</select></label>' :
      '<label class="f">' + (n.loai === 'THU' ? 'Thu vào' : 'Chi từ') + '<select data-c="nnf" data-k="tk"><option value="112"' + (n.tk === '112' ? ' selected' : '') + '>Tiền gửi ngân hàng (112)</option><option value="111"' + (n.tk === '111' ? ' selected' : '') + '>Tiền mặt (111)</option></select></label><label class="f">Số tiền<input class="num" data-c="nnf" data-k="tien" value="' + (n.tien === '' ? '' : F(KT.num(n.tien))) + '"></label>') +
    (isHd ? '<label class="f">Số hóa đơn<input data-c="nnf" data-k="hd" value="' + E(n.hd) + '"></label><label class="f">Ký hiệu hóa đơn<input data-c="nnf" data-k="kh" value="' + E(n.kh) + '" placeholder="1C26TAA"></label><label class="f">Ngày hóa đơn<input type="date" data-c="nnf" data-k="nhd" value="' + E(D.parse(n.nhd)) + '"></label>' : '') +
    '<label class="f" style="grid-column:1/-1">Diễn giải (để trống thì tự sinh)<input data-c="nnf" data-k="dg" value="' + E(n.dg) + '"></label></div>';
  let lines = '';
  if (isHd) {
    lines = '<div class="tw"><table class="t ps"><thead><tr><th>#</th><th>Mã hàng</th><th>Tên</th><th class="r">Số lượng</th><th class="r">Đơn giá (trống = giá chuẩn)</th><th>Thuế suất (trống = theo hàng)</th><th class="r">Thành tiền</th><th></th></tr></thead><tbody>' +
      n.lines.map((l, i) => { const it = item(l.vt); const sl = KT.num(l.sl); const g = l.gia !== '' ? KT.num(l.gia) : it ? KT.num(n.loai === 'BAN' ? it.giaBan : it.giaMua) : 0; return '<tr data-i="' + i + '"><td>' + (i + 1) + '</td><td><input list="dl-nnit" data-c="nnl" data-k="vt" value="' + E(l.vt) + '" size="12" autocomplete="off"></td><td class="small">' + E(it ? it.name + ' (' + (it.unit || '') + ')' : '') + '</td><td><input class="num" data-c="nnl" data-k="sl" size="7" value="' + E(l.sl) + '"></td><td><input class="num" data-c="nnl" data-k="gia" size="11" placeholder="' + (it ? F(KT.num(n.loai === 'BAN' ? it.giaBan : it.giaMua)) : '') + '" value="' + (l.gia === '' ? '' : F(KT.num(l.gia))) + '"></td><td><select data-c="nnl" data-k="thue"><option value="">' + (it ? 'Theo hàng (' + (it.thue || '10') + ')' : 'Theo hàng') + '</option>' + rates.filter(x => x[0] !== '').map(o => '<option value="' + o[0] + '"' + (l.thue === o[0] ? ' selected' : '') + '>' + o[1] + '</option>').join('') + '</select></td><td class="r">' + F(KT.rnd(sl * g)) + '</td><td><button class="btn sm dng" data-a="nndel" data-i="' + i + '">✕</button></td></tr>'; }).join('') + '</tbody></table></div><div class="row" style="margin-top:6px"><button class="btn" data-a="nnadd">+ Thêm dòng hàng</button><span class="sp"></span><span class="muted">Tiền hàng <b>' + F(r.base) + '</b> · Thuế GTGT <b>' + F(r.tax) + '</b> · Tổng thanh toán <b>' + F(r.base + r.tax) + '</b></span></div>';
  }
  const prev = r.ls.length ? '<div class="tw"><table class="t"><thead><tr><th>Nợ</th><th>Có</th><th class="r">Số tiền</th><th>Mã hàng</th><th class="r">SL</th><th>Diễn giải</th></tr></thead><tbody>' + r.ls.map(l => '<tr><td>' + E(l.no) + '</td><td>' + E(l.co) + '</td><td class="r">' + (l.st ? F(l.st) : '') + '</td><td>' + E(l.vt || '') + '</td><td class="r">' + (l.sl ? KT.fq(l.sl) : '') + '</td><td class="small">' + E(l.dg) + '</td></tr>').join('') + '</tbody></table></div>' : '<div class="muted small">Bút toán sẽ hiện ở đây khi nhập đủ.</div>';
  return dl + '<div class="ph"><div><h1>Nhập nhanh</h1><div class="sub">Một hóa đơn hoặc một phiếu thu chi là một lần nhập. Hệ thống tự sinh bút toán kho, thuế GTGT, giá vốn, công nợ và tự đánh số chứng từ. Nghiệp vụ khác (kết chuyển, điều chỉnh, vay, góp vốn…) nhập ở Sổ PS hoặc Mẫu nghiệp vụ.</div></div></div>' +
    (KT.readOnly ? '<div class="notice warn small">Bạn chỉ có quyền xem; không lưu được chứng từ.</div>' : '') +
    '<div class="tabs">' + tabs + '</div><div class="card">' + hdr + '</div><div class="card"><h2>' + (isHd ? 'Hàng hóa, dịch vụ' : 'Bút toán') + '</h2>' + lines + '<h3 style="margin:12px 0 6px">Bút toán sẽ ghi sổ · số chứng từ ' + E(nnCt(n)) + '</h3>' + prev +
    (r.err.length && (n.dt || n.lines.some(x => x.vt || x.sl) || n.tien) ? '<div class="notice warn small" style="margin-top:8px">' + r.err.map(E).join('<br>') + '</div>' : '') +
    '<div class="row" style="margin-top:10px"><button class="btn pri" data-a="nnsave"' + (r.err.length ? ' disabled' : '') + '>Ghi sổ</button><button class="btn" data-a="nnclear">Nhập lại</button>' + (n.last ? '<span class="muted small">Vừa ghi: ' + E(n.last) + '</span>' : '') + '</div></div>';
});
UI.act.nntab = el => { UI.nn.loai = el.dataset.k; UI.nn.tt = ''; UI.nn.dt = ''; UI.nn.lines = [blank()]; UI.render(); };
UI.chg.nnf = el => { UI.nn[el.dataset.k] = el.type === 'date' ? el.value : el.value.trim(); if (el.dataset.k === 'dt') { const v = UI.nn.dt.toLowerCase(); const p = S().partners.find(x => x.code.toLowerCase() === v) || S().partners.find(x => x.name.toLowerCase() === v); if (p) UI.nn.dt = p.code; } UI.render(); };
UI.chg.nnl = el => { const i = +el.closest('tr').dataset.i; const k = el.dataset.k; let v = el.value.trim(); if (k === 'vt') { const it = S().items.find(x => x.code.toLowerCase() === v.toLowerCase() || x.name.toLowerCase() === v.toLowerCase()); if (it) v = it.code; } UI.nn.lines[i][k] = v; if (k === 'vt' && i === UI.nn.lines.length - 1 && v) UI.nn.lines.push(blank()); UI.render(); };
UI.act.nnadd = () => { UI.nn.lines.push(blank()); UI.render(); };
UI.act.nndel = el => { UI.nn.lines.splice(+el.dataset.i, 1); if (!UI.nn.lines.length) UI.nn.lines.push(blank()); UI.render(); };
UI.act.nnclear = () => { Object.assign(UI.nn, { dt: '', tt: '', hd: '', kh: '', nhd: '', dg: '', tien: '', lines: [blank()] }); UI.render(); };
UI.act.nnsave = () => {
  const n = UI.nn; const r = nnLines(n); if (r.err.length) return UI.toast(r.err[0]);
  if (KT.readOnly) return UI.toast('Bạn chỉ có quyền xem.');
  const ct = nnCt(n); KT.snapshot(); r.ls.forEach(l => { l.ct = ct; l.id = KT.newId(); S().journal.push(l); });
  UI.lastDate = D.parse(n.ng); n.last = ct + ' (' + r.ls.length + ' dòng)';
  const keep = { loai: n.loai, ng: n.ng, tk: n.tk }; Object.assign(n, { dt: '', tt: '', hd: '', kh: '', nhd: '', dg: '', tien: '', lines: [blank()] }, keep);
  KT.touch(true); UI.toast('Đã ghi ' + ct); UI.render();
};

/* ====================== DANH MỤC: mỗi loại một màn hình ====================== */
[['dm_dk', 'Số dư đầu kỳ', 'dk'], ['dm_dt', 'Khách hàng, nhà cung cấp', 'dt'], ['dm_vt', 'Hàng hóa, vật tư', 'vt'], ['dm_dh', 'Đơn hàng, công trình', 'dh'], ['dm_nv', 'Nhân viên', 'nv'], ['dm_ts', 'Tài sản cố định, chi phí trả trước', 'ts'], ['dm_tk', 'Hệ thống tài khoản', 'tk'], ['dm_tl', 'Thang lương', 'tl']].forEach(a => {
  UI.route(a[0], a[1], a[0] === 'dm_tl' ? '' : 'Danh mục', false, () => { UI.sub.dmg = a[2]; if (UI.sub.dm !== a[2] && !(a[2] === 'ts' && UI.sub.dm === 'cp')) UI.sub.dm = a[2]; return UI.routes.dm.fn(); });
});
UI.routes.dm.g = '';
/* gộp trùng lặp: các màn hình in/danh mục tài liệu chuyển vào Trung tâm in; vẫn mở được bằng liên kết */
['nghiavu', 'mauct'].forEach(k => { if (UI.routes[k]) UI.routes[k].g = ''; });
if (UI.routes.kh) UI.routes.kh.t = 'Công nợ khách hàng, nhà cung cấp';
if (UI.routes.luat) UI.routes.luat.t = 'Kiểm tra hồ sơ theo luật';
UI.dmGo = (key, q) => { UI.sub.dm = key; UI.sub.dmq = q || ''; UI.go('dm_' + key); };

/* ====================== THANG LƯƠNG, BẢNG LƯƠNG ====================== */
const vung = () => S().company.vung || 2;
const minWage = () => { const lt = S().legal.luongTT[vung()]; return lt ? KT.at(lt, D.today()).v : 0; };
const hs = x => (Math.round(x * 100) / 100).toString().replace('.', ',');
const scaleHtml = () => {
  const sc = S().payScale, tt = minWage();
  return '<table class="t"><thead><tr><th rowspan="2">Mã ngạch</th><th rowspan="2">Ngạch, nhóm chức danh</th><th rowspan="2" class="r">Mức lương bậc 1 (đồng)</th><th colspan="8" class="c">Hệ số lương theo bậc</th><th rowspan="2">Kiểm tra</th></tr><tr>' + [1, 2, 3, 4, 5, 6, 7, 8].map(i => '<th class="r">Bậc ' + i + '</th>').join('') + '</tr></thead><tbody>' + sc.map(g => {
    const h = [0, 1, 2, 3, 4, 5, 6, 7].map(i => i ? (g.h[i] === '' || g.h[i] == null ? 0 : KT.num(g.h[i])) : 1); const used = h.filter(x => x);
    const dec = used.some((x, i) => i && x < used[i - 1]); const low = KT.num(g.min) && tt && KT.num(g.min) < tt * 1.07;
    return '<tr><td>' + E(g.code) + '</td><td>' + E(g.name) + '</td><td class="r">' + F(KT.num(g.min)) + '</td>' + h.map(x => '<td class="r">' + (x ? hs(x) : '') + '</td>').join('') + '<td class="small">' + (dec ? '<b class="neg">Hệ số bậc sau thấp hơn bậc trước</b>' : low ? '<b class="neg">Mức bậc 1 thấp hơn lương tối thiểu vùng cộng 7%</b>' : 'Đạt') + '</td></tr>'; }).join('') + '</tbody></table>';
};
const grades = () => {   // bảng lương: gom nhân viên theo chức danh, ngạch, bậc
  const m = {}; S().employees.filter(e => !e.nghi).forEach(e => { const k = [e.chucDanh || '', e.ngach || '', e.bac || ''].join('|'); const g = (m[k] = m[k] || { cd: e.chucDanh || '(chưa ghi chức danh)', ngach: e.ngach || '', bac: e.bac || '', luong: KT.num(e.luongCB), pc: KT.num(e.phuCap), n: 0 }); g.n++; });
  return Object.values(m).sort((a, b) => b.luong - a.luong);
};
const bangHtml = () => {
  const gs = grades();
  return '<table class="t"><thead><tr><th>STT</th><th>Chức danh, vị trí công việc</th><th>Ngạch</th><th class="c">Bậc</th><th class="r">Hệ số</th><th class="r">Mức lương (đồng/tháng)</th><th class="r">Phụ cấp lương</th><th class="r">Số người</th></tr></thead><tbody>' + gs.map((g, i) => { const sc = S().payScale.find(x => x.code === g.ngach); const h = sc && g.bac ? KT.scaleAmt(sc, g.bac) / (KT.num(sc.min) || 1) : 0; return '<tr><td>' + (i + 1) + '</td><td>' + E(g.cd) + '</td><td>' + E(g.ngach) + '</td><td class="c">' + E(g.bac) + '</td><td class="r">' + (h ? hs(h) : '') + '</td><td class="r">' + F(g.luong) + '</td><td class="r">' + (g.pc ? F(g.pc) : '') + '</td><td class="r">' + g.n + '</td></tr>'; }).join('') + '<tr class="tot"><td colspan="7">Tổng số lao động</td><td class="r">' + gs.reduce((s, g) => s + g.n, 0) + '</td></tr></tbody></table>';
};
const lawDoc = (title, tbl) => { const c = S().company; return '<div style="padding:18px;font:13px/1.5 Arial,sans-serif;color:#000;background:#fff"><div style="display:flex;justify-content:space-between"><div><b>' + E(c.name) + '</b><br>' + E(c.address || '') + '</div><div style="text-align:center"><b>CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</b><br><u>Độc lập – Tự do – Hạnh phúc</u></div></div><h2 style="text-align:center;margin:16px 0 4px">' + title + '</h2><div style="text-align:center;margin-bottom:10px"><i>(Ban hành kèm theo Quyết định số ......../QĐ-.... ngày ...... tháng ...... năm ......)</i></div>' + tbl.replace(/<table class="t">/, '<table style="border-collapse:collapse;width:100%;font-size:12px">').replace(/<(th|td)([ >])/g, '<$1 style="border:1px solid #333;padding:4px 6px"$2') + '<div style="display:flex;justify-content:space-around;margin-top:26px;text-align:center"><div><b>Người lập biểu</b><br><i>(Ký, họ tên)</i><br><br><br>' + E(c.nguoiLap || '') + '</div><div><b>Người sử dụng lao động</b><br><i>(Ký, đóng dấu, họ tên)</i><br><br><br>' + E(c.giamDoc || '') + '</div></div></div>'; };
UI.route('thangluong', 'Thang lương', 'Nhân sự – bảo hiểm', false, () => {
  const sc = S().payScale, tt = minWage(), used = {}; S().employees.forEach(e => { if (e.ngach) used[e.ngach] = (used[e.ngach] || 0) + 1; });
  return '<div class="ph"><div><h1>Thang lương</h1><div class="sub">Mỗi ngạch có mức lương bậc 1 và hệ số các bậc. Người sử dụng lao động xây dựng thang lương, bảng lương, công bố công khai tại nơi làm việc và gửi cơ quan quản lý lao động địa phương (Điều 93 Bộ luật Lao động 2019). Cần đối chiếu văn bản hiện hành trước khi nộp.</div></div><span class="sp"></span><button class="btn" data-a="go" data-id="dm_tl">Sửa thang lương</button><button class="btn" data-a="go" data-id="bangmuc">Bảng lương chức danh</button><button class="btn pri" data-a="tlprint">Xem và tải để in</button></div>' +
    '<div class="notice small">Lương tối thiểu vùng ' + vung() + ' hiện hành: <b>' + F(minWage()) + '</b> đồng/tháng; công việc qua đào tạo phải cao hơn ít nhất 7%. Nhân viên đang áp ngạch: ' + (Object.keys(used).map(k => E(k) + ' (' + used[k] + ')').join(', ') || 'chưa có') + '. Chọn Ngạch và Bậc ở danh mục Nhân viên thì Lương cơ bản tự lấy từ đây.</div><div class="card"><div class="tw">' + (sc.length ? scaleHtml() : '<div class="muted" style="padding:14px">Chưa có thang lương. Bấm Sửa thang lương rồi Thêm.</div>') + '</div></div>';
});
UI.act.tlprint = () => UI.preview('Thang lương', lawDoc('THANG LƯƠNG', scaleHtml()), { name: 'ThangLuong', land: true });
UI.route('bangmuc', 'Bảng lương chức danh', 'Nhân sự – bảo hiểm', false, () =>
  '<div class="ph"><div><h1>Bảng lương</h1><div class="sub">Mức lương theo chức danh, vị trí công việc đang áp dụng. Bảng tự lập từ danh mục Nhân viên (chức danh, ngạch, bậc, lương); không nhập ở đây. Bảng lương tháng của từng người ở mục Bảng lương tháng.</div></div><span class="sp"></span><button class="btn" data-a="go" data-id="thangluong">Thang lương</button><button class="btn pri" data-a="blprint">Xem và tải để in</button></div><div class="card"><div class="tw">' + bangHtml() + '</div></div>');
UI.act.blprint = () => UI.preview('Bảng lương', lawDoc('BẢNG LƯƠNG', bangHtml()), { name: 'BangLuong', land: true });
UI.html = UI.html || {}; UI.html.thangLuong = () => lawDoc('THANG LƯƠNG', scaleHtml()); UI.html.bangLuong = () => lawDoc('BẢNG LƯƠNG', bangHtml());

/* ====================== QUY ƯỚC MÃ ====================== */
const QU = [
  ['Khách hàng', 'KH' + '001, KH002…', 'KH + số thứ tự 3 chữ số. Một đơn vị vừa mua vừa bán: chọn loại theo vai trò chính, hoặc tạo hai mã KH và NCC có cùng MST.', 'KH001 Công ty ABC'],
  ['Nhà cung cấp', 'NCC001…', 'NCC + số thứ tự 3 chữ số.', 'NCC001 Công ty Thiết bị XYZ'],
  ['Hàng hóa, vật tư', 'nhóm-tên-số', 'Chữ in hoa, không dấu, ngăn bằng gạch ngang, không khoảng trắng. Nhóm: HH hàng hóa, NVL nguyên vật liệu, CCDC công cụ, TP thành phẩm, DV dịch vụ.', 'HH-LAPTOP-01, NVL-USB-01'],
  ['Nhân viên', 'NV001…', 'NV + số thứ tự 3 chữ số, không dùng lại mã người đã nghỉ.', 'NV001'],
  ['Ngạch lương', '2 đến 4 chữ cái', 'Viết tắt chức danh hoặc nhóm công việc.', 'QL, KT, CM'],
  ['Tài sản cố định', 'TS-nhóm-số', 'TS + nhóm + số thứ tự.', 'TS-MT-001 (máy tính)'],
  ['Đơn hàng, công trình', 'DH01, CT01', 'DH đơn hàng sản xuất, CT công trình, DV hợp đồng dịch vụ.', 'DH01'],
  ['Số hóa đơn bán', 'HDyy-nnnn', 'Hệ thống tự đánh khi dùng Nhập nhanh: HD26-0001.', 'HD26-0001'],
  ['Số hóa đơn mua', 'MHyy-nnnn', 'Tự đánh; số hóa đơn của nhà cung cấp ghi ở ô Số hóa đơn.', 'MH26-0001'],
  ['Phiếu thu, phiếu chi', 'PTyy-nnnn, PCyy-nnnn', 'Tự đánh theo năm, không nhảy số, không sửa tay.', 'PT26-0001'],
  ['Ký hiệu hóa đơn điện tử', '1 C yy T XX', 'Theo Thông tư 78/2021/TT-BTC: 1 là hóa đơn GTGT, C có mã của cơ quan thuế (K không có mã), yy là 2 số cuối năm lập, T hóa đơn đã nộp thuế, hai chữ cuối do đơn vị tự đặt.', '1C26TAA'],
  ['Tài khoản kế toán', 'theo hệ thống TK', 'Tài khoản chi tiết thêm ở Danh mục, Tài khoản, dùng mã của tài khoản cha thêm hậu tố.', '1121, 11211']
];
UI.route('quyuoc', 'Quy ước đặt mã', 'Tổng quan', false, () => '<div class="ph"><div><h1>Quy ước đặt mã</h1><div class="sub">Đặt mã thống nhất ngay từ đầu để tìm nhanh (Ctrl+K), lọc và đối chiếu sổ. Mã không dấu, không khoảng trắng, không đổi sau khi đã dùng.</div></div></div><div class="card"><div class="tw"><table class="t"><thead><tr><th>Đối tượng</th><th>Dạng mã</th><th>Quy tắc</th><th>Ví dụ</th></tr></thead><tbody>' + QU.map(r => '<tr><td><b>' + E(r[0]) + '</b></td><td>' + E(r[1]) + '</td><td>' + E(r[2]) + '</td><td>' + E(r[3]) + '</td></tr>').join('') + '</tbody></table></div></div>');

/* ====================== LẦN ĐẦU DÙNG (dữ liệu chung còn trống) ====================== */
UI.welcome = () => {
  if (KT.role === 'quantri') UI.modal('Chào mừng', '<p>Cơ sở dữ liệu chung còn trống. Bạn là <b>Quản trị</b>, hãy chọn cách bắt đầu:</p><p class="small muted">Kế toán (người được cấp quyền Contributor) nhập chứng từ; người chỉ xem (Viewer) xem sổ sách và báo cáo; Quản trị (Editor) còn sửa thông tin công ty, tham số pháp lý, hệ thống tài khoản.</p>', '<button class="btn" data-a="close">Bắt đầu với dữ liệu trống</button><button class="btn pri" data-a="demo2">Nạp dữ liệu mẫu để xem thử</button>');
  else UI.toast('Dữ liệu chung chưa có gì. Nhờ Quản trị khởi tạo hoặc bắt đầu nhập chứng từ.');
};
UI.act.demo2 = () => { UI.closeModal(); UI.act.demo(); };
})(window);
