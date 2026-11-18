/* ===== GIAO DIỆN 1: khung ứng dụng, tiện ích, tổng quan, sổ PS, nhập theo mẫu, dán từ Excel, kiểm tra ===== */
(function (G) {
'use strict';
const KT = G.KT, D = KT.d, E = KT.esc;
const UI = KT.ui = { at: 'dash', per: null, sub: {}, ps: { ym: '', q: '', only: '', page: null, wide: true }, routes: {}, act: {}, chg: {} };
const $ = (s, r) => (r || document).querySelector(s), $$ = (s, r) => [...(r || document).querySelectorAll(s)];
UI.$ = $; UI.$$ = $$;
const S = () => KT.S;

/* ---------- tiện ích hiển thị ---------- */
UI.fv = (c, v) => {
  if (v == null || v === '') return '';
  switch (c.f) { case 'd': return D.fmt(v); case 'n': return KT.f(v); case 'p': return KT.fp(v); case 'q': return KT.fq(v); case '%': return KT.pct(v); default: return E(v); }
};
UI.isNumCol = c => c.f === 'n' || c.f === 'p' || c.f === 'q' || c.f === '%';
UI.repTable = (r, o) => {
  o = o || {}; const cols = r.cols; const th = cols.map(c => '<th class="' + (c.a === 'r' || UI.isNumCol(c) ? 'r' : c.a === 'c' ? 'c' : '') + '"' + (c.w && !o.exp ? ' style="min-width:' + Math.min(c.w, 360) + 'px"' : '') + '>' + E(c.t) + '</th>').join('');
  const body = r.rows.map(row => '<tr class="' + (row._cls || '') + '">' + cols.map(c => {
    const v = row[c.k]; const num = UI.isNumCol(c); const neg = num && typeof v === 'number' && v < -0.5;
    return '<td class="' + (c.a === 'r' || num ? 'r' : c.a === 'c' ? 'c' : '') + (neg ? ' neg' : '') + '">' + UI.fv(c, v) + '</td>';
  }).join('') + '</tr>').join('');
  return '<table class="t"><thead><tr>' + th + '</tr></thead><tbody>' + body + '</tbody></table>';
};
UI.repHead = r => { const c = S().company; return '<div class="rep-co"><b>' + E(c.name) + '</b>' + (c.address ? '<br>' + E(c.address) : '') + (c.mst ? ' · MST ' + E(c.mst) : '') + '</div><div class="rep-h"><span class="faint small">' + E(r.form || '') + '</span><b>' + E(r.title) + '</b><span class="muted">' + E(r.sub || '') + '</span></div>'; };
UI.report = (r, o) => {
  o = o || {};
  if (r.tables) return UI.repHead(r) + r.tables.map(t => '<h3 style="margin:14px 0 6px">' + E(t.title) + '</h3><div class="tw"><table class="t"><thead><tr>' + t.head.map((h, i) => '<th class="' + (i ? 'r' : '') + '">' + E(h) + '</th>').join('') + '</tr></thead><tbody>' + t.rows.map(rw => '<tr>' + rw.map((x, i) => '<td class="' + (i ? 'r' : '') + '">' + (typeof x === 'number' ? KT.fp(x) : E(x == null ? '' : x)) + '</td>').join('') + '</tr>').join('') + '</tbody></table></div>').join('');
  return UI.repHead(r) + '<div class="tw">' + UI.repTable(r, o) + '</div>';
};
UI.signs = () => { const c = S().company; return '<div class="row" style="justify-content:space-around;margin-top:22px;text-align:center"><div><b>Người lập biểu</b><br><span class="faint small">(Ký, họ tên)</span><br><br><br>' + E(c.nguoiLap) + '</div><div><b>Kế toán trưởng</b><br><span class="faint small">(Ký, họ tên)</span><br><br><br>' + E(c.ktt) + '</div><div><b>Giám đốc</b><br><span class="faint small">(Ký, họ tên, đóng dấu)</span><br><br><br>' + E(c.giamDoc) + '</div></div>'; };

/* ---------- xuất file ---------- */
UI.download = (name, mime, content) => {
  try { const b = new Blob(['﻿' + content], { type: mime + ';charset=utf-8' }); const u = URL.createObjectURL(b); const a = document.createElement('a'); a.href = u; a.download = name; document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(u), 3000); UI.toast('Đã tạo file ' + name); }
  catch (e) { UI.toast('Không tải được file trong môi trường này'); }
};
UI.xls = (name, title, tableHtml) => UI.download(name + '.xls', 'application/vnd.ms-excel', '<html xmlns:x="urn:schemas-microsoft-com:office:excel"><head><meta charset="utf-8"><style>td,th{mso-number-format:"\\@";border:.5pt solid #bbb;font-family:Arial}</style></head><body><h3>' + E(S().company.name) + '</h3><h3>' + E(title) + '</h3>' + tableHtml + '</body></html>');
UI.exportReport = r => {
  const num = c => UI.isNumCol(c);
  const t = r.tables ? r.tables.map(x => '<table><tr><th colspan="' + x.head.length + '">' + E(x.title) + '</th></tr><tr>' + x.head.map(h => '<th>' + E(h) + '</th>').join('') + '</tr>' + x.rows.map(rw => '<tr>' + rw.map(v => '<td>' + (typeof v === 'number' ? Math.round(v) : E(v == null ? '' : v)) + '</td>').join('') + '</tr>').join('') + '</table><br>').join('')
    : '<table><tr>' + r.cols.map(c => '<th>' + E(c.t) + '</th>').join('') + '</tr>' + r.rows.map(row => '<tr>' + r.cols.map(c => { const v = row[c.k]; return '<td' + (num(c) ? ' style="mso-number-format:\'#,##0\'"' : '') + '>' + (num(c) && typeof v === 'number' ? (c.f === 'q' ? v : c.f === '%' ? v : Math.round(v)) : c.f === 'd' ? D.fmt(v) : E(v == null ? '' : v)) + '</td>'; }).join('') + '</tr>').join('') + '</table>';
  UI.xls((r.form || 'bao-cao') + '-' + (r.title || '').slice(0, 24).replace(/\s+/g, '_'), r.title + ' ' + (r.sub || ''), t);
};

/* ---------- toast / modal ---------- */
let tt = 0;
UI.toast = m => { let t = $('.toast'); if (!t) { t = document.createElement('div'); t.className = 'toast'; t.setAttribute('role', 'status'); document.body.appendChild(t); } t.textContent = m; clearTimeout(tt); tt = setTimeout(() => t.remove(), 3200); };
UI.modal = (title, body, foot, wide) => {
  UI.closeModal(); const d = document.createElement('div'); d.className = 'modal-bg'; d.id = 'modal';
  d.innerHTML = '<div class="modal' + (wide ? ' wide' : '') + '" role="dialog" aria-modal="true" aria-label="' + E(title) + '"><header><h2>' + E(title) + '</h2><button class="btn sm" data-a="close">✕</button></header><div class="bd" id="mbody">' + body + '</div>' + (foot ? '<footer id="mfoot">' + foot + '</footer>' : '') + '</div>';
  d.addEventListener('mousedown', e => { if (e.target === d) UI.closeModal(); }); document.body.appendChild(d);
  const f = $('input:not([type=hidden]),select,textarea', d); if (f && !('ontouchstart' in G)) f.focus();
};
UI.closeModal = () => { const m = $('#modal'); if (m) m.remove(); UI.cb = null; };
UI.ask = (msg, label, fn, dng) => { UI.cb = fn; UI.modal('Xác nhận', '<p>' + msg + '</p>', '<button class="btn" data-a="close">Hủy</button><button class="btn ' + (dng ? 'dng' : 'pri') + '" data-a="ok">' + E(label || 'Đồng ý') + '</button>'); };
UI.act.close = () => UI.closeModal();
UI.act.ok = () => { const f = UI.cb; UI.closeModal(); if (f) f(); };

/* ---------- kỳ báo cáo ---------- */
UI.initPer = () => {
  const L = KT.compute(); const last = L.last || D.today(); const y = +last.slice(0, 4), m = +last.slice(5, 7);
  UI.per = { k: 'month', y, m, q: Math.ceil(m / 3), from: last.slice(0, 4) + '-01-01', to: last };
};
UI.P = () => { if (!UI.per) UI.initPer(); return KT.period(UI.per); };
UI.perHtml = () => {
  const p = UI.per; const yrs = []; const L = KT.compute(); const y0 = L.first ? +L.first.slice(0, 4) : p.y, y1 = Math.max(p.y, L.last ? +L.last.slice(0, 4) : p.y);
  for (let y = y0 - 1; y <= y1 + 1; y++) yrs.push(y);
  const ys = '<select data-c="per" data-k="y" aria-label="Năm">' + yrs.map(y => '<option' + (y === p.y ? ' selected' : '') + '>' + y + '</option>').join('') + '</select>';
  let x = '<select data-c="per" data-k="k" aria-label="Loại kỳ"><option value="month"' + (p.k === 'month' ? ' selected' : '') + '>Tháng</option><option value="quarter"' + (p.k === 'quarter' ? ' selected' : '') + '>Quý</option><option value="year"' + (p.k === 'year' ? ' selected' : '') + '>Năm</option><option value="range"' + (p.k === 'range' ? ' selected' : '') + '>Tùy chọn</option></select> ';
  if (p.k === 'month') x += '<select data-c="per" data-k="m" aria-label="Tháng">' + Array.from({ length: 12 }, (_, i) => '<option value="' + (i + 1) + '"' + (p.m === i + 1 ? ' selected' : '') + '>' + (i + 1) + '</option>').join('') + '</select> ' + ys;
  else if (p.k === 'quarter') x += '<select data-c="per" data-k="q" aria-label="Quý">' + [1, 2, 3, 4].map(i => '<option value="' + i + '"' + (p.q === i ? ' selected' : '') + '>' + i + '</option>').join('') + '</select> ' + ys;
  else if (p.k === 'year') x += ys;
  else x += '<input type="text" size="10" data-c="per" data-k="from" value="' + D.fmt(p.from) + '" aria-label="Từ ngày"> – <input type="text" size="10" data-c="per" data-k="to" value="' + D.fmt(p.to) + '" aria-label="Đến ngày">';
  return x;
};
UI.chg.per = el => { const k = el.dataset.k; let v = el.value; if (k === 'from' || k === 'to') { v = D.parse(v) || UI.per[k]; } else if (k !== 'k') v = +v; UI.per[k] = v; if (k === 'm') UI.per.q = Math.ceil(v / 3); if (k === 'q') UI.per.m = v * 3; UI.render(); };

/* ---------- khung ---------- */
const GROUPS = ['Tổng quan', 'Nhập liệu', 'Danh mục', 'Sổ sách & báo cáo', 'Thuế', 'Nhân sự – bảo hiểm', 'Hệ thống'];
UI.route = function (id, t, g, per, fn) { UI.routes[id] = { id, t, g, per, fn }; };
UI.go = (id, sub) => { if (!UI.routes[id]) id = 'dash'; UI.at = id; if (sub) UI.sub = Object.assign(UI.sub, sub); try { history.replaceState(null, '', '#' + id.replace(/[^a-z0-9-]/g, '')); } catch (e) { } UI.render(); const p = $('#page'); if (p) p.scrollTop = 0; };
UI.render = () => {
  if (!UI.per) UI.initPer();
  const R = UI.routes[UI.at] || UI.routes.dash; const L = KT.compute();
  const ne = L.issues.filter(i => i.sev === 'err').length, nw = L.issues.filter(i => i.sev === 'warn').length;
  let nav = ''; for (const g of GROUPS) { const items = Object.values(UI.routes).filter(r => r.g === g); if (!items.length) continue; nav += '<div class="nav-g">' + g + '</div>' + items.map(r => '<a data-a="go" data-id="' + r.id + '" class="' + (r.id === UI.at ? 'on' : '') + '" tabindex="0" role="link">' + E(r.t) + (r.id === 'chk' && (ne || nw) ? '<span class="bd' + (ne ? '' : ' w') + '">' + (ne || nw) + '</span>' : '') + '</a>').join(''); }
  const si = KT.saveInfo(); const c = S().company;
  let body; try { body = R.fn(); } catch (e) { console.error(e); body = '<div class="notice bad"><b>Lỗi hiển thị màn hình này.</b> ' + E(e.message) + '<br><span class="small">Dữ liệu vẫn an toàn. Hãy thử sao lưu rồi tải lại trang.</span></div>'; }
  const keepFocus = document.activeElement && document.activeElement.id; const pg0 = $('#page'); const sc0 = pg0 ? pg0.scrollTop : 0, rt0 = UI._rt; UI._rt = UI.at;
  $('#app').innerHTML = '<aside class="side"><div class="brand"><i>PS</i><div>Kế toán PS<small>' + E(c.name.length > 26 ? c.name.slice(0, 26) + '…' : c.name) + '</small></div></div><nav class="nav">' + nav + '</nav><div class="side-foot">' + (S().meta.demo ? '<span class="pill warn">Dữ liệu mẫu</span><br>' : '') + 'Lưu: <span class="savelbl">' + E(KT.saveLabel(si)) + '</span>' + '<br>' + (si.last ? 'Lần cuối ' + si.last : '') + '</div></aside>' +
    '<section class="main"><div class="top noprint">' + (R.per ? UI.perHtml() : '<b>' + E(R.t) + '</b>') + '<span class="sp"></span>' + (L.first ? '<span class="pill ' + (ne ? 'bad' : nw ? 'warn' : 'ok') + '" data-a="go" data-id="chk" style="cursor:pointer" title="Mở màn hình kiểm tra dữ liệu">' + (ne ? ne + ' lỗi' : nw ? nw + ' cảnh báo' : 'Dữ liệu sạch') + '</span>' : '') + (UI.backupPill ? UI.backupPill() : '') + '<button class="btn sm" data-a="undo"' + (KT.canUndo() ? '' : ' disabled') + ' title="Hoàn tác thao tác PS gần nhất">↶ Hoàn tác</button><button class="btn sm" data-a="theme" title="Đổi giao diện sáng/tối">Sáng/Tối</button></div><div class="page" id="page">' + body + '</div></section>';
  if (R.after) try { R.after(); } catch (e) { console.error(e); }
  if (rt0 === UI.at && $('#page')) $('#page').scrollTop = sc0;
  if (keepFocus && $('#' + keepFocus)) $('#' + keepFocus).focus();
};
UI.act.go = el => UI.go(el.dataset.id, el.dataset.sub ? JSON.parse(el.dataset.sub) : null);
UI.act.theme = () => { const r = document.documentElement; const dark = r.dataset.theme === 'dark' || (!r.dataset.theme && matchMedia('(prefers-color-scheme: dark)').matches); r.dataset.theme = dark ? 'light' : 'dark'; };
UI.act.undo = () => { if (KT.undo && KT.undo()) { UI.render(); UI.toast('Đã hoàn tác'); } };

document.addEventListener('click', e => {
  const el = e.target.closest('[data-a]'); if (!el) return; const f = UI.act[el.dataset.a]; if (f) { e.preventDefault(); f(el, e); }
});
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') UI.closeModal();
  if ((e.key === 'Enter' || e.key === ' ') && e.target.matches && e.target.matches('.nav a')) { e.preventDefault(); e.target.click(); }
});
document.addEventListener('change', e => { const el = e.target.closest('[data-c]'); if (!el) return; const f = UI.chg[el.dataset.c]; if (f) f(el, e); });
document.addEventListener('input', e => { const el = e.target.closest('[data-i]'); if (!el) return; const f = UI.chg[el.dataset.i]; if (f) f(el, e); });

/* ====================== TỔNG QUAN ====================== */
const niceMax = v => { if (v <= 0) return 1; const p = Math.pow(10, Math.floor(Math.log10(v))); const n = v / p; return (n <= 1 ? 1 : n <= 2 ? 2 : n <= 5 ? 5 : 10) * p; };
const short = v => { const a = Math.abs(v); const s = v < 0 ? '-' : ''; return a >= 1e9 ? s + (a / 1e9).toFixed(a >= 1e10 ? 0 : 1).replace('.', ',') + ' tỷ' : a >= 1e6 ? s + Math.round(a / 1e6) + ' tr' : a >= 1e3 ? s + Math.round(a / 1e3) + ' k' : s + Math.round(a); };
UI.chart = (labels, series, o) => {
  o = o || {}; const W = 640, H = 220, pl = 52, pr = 10, pt = 14, pb = 26; const n = labels.length; let mx = 0, mn = 0;
  series.forEach(s => s.v.forEach(x => { mx = Math.max(mx, x); mn = Math.min(mn, x); }));
  const top = niceMax(mx), bot = mn < 0 ? -niceMax(-mn) : 0; const y = v => pt + (H - pt - pb) * (1 - (v - bot) / (top - bot || 1)); const gw = (W - pl - pr) / n;
  let g = ''; for (let i = 0; i <= 4; i++) { const v = bot + (top - bot) * i / 4; g += '<line x1="' + pl + '" x2="' + (W - pr) + '" y1="' + y(v) + '" y2="' + y(v) + '" stroke="var(--line2)"/><text x="' + (pl - 6) + '" y="' + (y(v) + 4) + '" text-anchor="end" font-size="10.5" fill="var(--ink3)">' + short(v) + '</text>'; }
  labels.forEach((l, i) => { g += '<text x="' + (pl + gw * (i + .5)) + '" y="' + (H - 8) + '" text-anchor="middle" font-size="10.5" fill="var(--ink3)">' + E(l) + '</text>'; });
  const cols = ['var(--accent)', 'var(--info)', 'var(--warn)'];
  if (o.line) series.forEach((s, k) => { const pts = s.v.map((v, i) => (pl + gw * (i + .5)) + ',' + y(v)); g += '<polyline points="' + pts.join(' ') + '" fill="none" stroke="' + cols[k] + '" stroke-width="2.2"/>'; s.v.forEach((v, i) => { if (i === n - 1 || o.dots) g += '<circle cx="' + (pl + gw * (i + .5)) + '" cy="' + y(v) + '" r="3.6" fill="' + cols[k] + '"/>'; }); });
  else series.forEach((s, k) => { const bw = Math.min(26, gw * .7 / series.length); s.v.forEach((v, i) => { const x0 = pl + gw * (i + .5) - bw * series.length / 2 + k * bw; const y0 = y(0), y1 = y(v); g += '<rect x="' + x0 + '" y="' + Math.min(y0, y1) + '" width="' + (bw - 2) + '" height="' + Math.max(1, Math.abs(y0 - y1)) + '" fill="' + cols[k] + '" rx="2"><title>' + E(s.n + ' ' + labels[i] + ': ' + KT.f(v)) + '</title></rect>'; }); });
  const leg = series.length > 1 || o.legend ? '<div class="row small muted" style="gap:14px">' + series.map((s, k) => '<span><i style="display:inline-block;width:10px;height:10px;border-radius:2px;background:' + cols[k] + '"></i> ' + E(s.n) + '</span>').join('') + '</div>' : '';
  return leg + '<svg class="spark" viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="' + E(o.title || 'Biểu đồ') + '" preserveAspectRatio="xMidYMid meet" style="height:auto;max-height:240px">' + g + '</svg>';
};
UI.route('dash', 'Tổng quan', 'Tổng quan', false, () => {
  const L = KT.compute();
  if (!L.first && !S().journal.length) return '<div class="ph"><div><h1>Chào mừng đến Kế toán PS</h1><div class="sub">Nhập chứng từ ở một nơi duy nhất là sổ PS. Sổ cái, báo cáo tài chính, tờ khai thuế và nghĩa vụ nhân sự tự chạy từ đó.</div></div></div>' +
    '<div class="grid g3"><div class="card"><h2>Xem thử với dữ liệu mẫu</h2><p class="muted">Công ty giả định, 10 tháng năm 2026, đủ hóa đơn, lương, BHXH, tờ khai.</p><button class="btn pri" data-a="demo">Nạp dữ liệu mẫu</button></div><div class="card"><h2>Bắt đầu với công ty của bạn</h2><p class="muted">Khai báo công ty, danh mục, số dư đầu kỳ, rồi nhập PS.</p><button class="btn" data-a="go" data-id="ht">Khai báo công ty</button> <button class="btn" data-a="go" data-id="ps">Mở sổ PS</button></div><div class="card"><h2>Đã có bản sao lưu</h2><p class="muted">Khôi phục từ file .json đã xuất trước đó.</p><button class="btn" data-a="restore">Chọn file sao lưu</button></div></div>';
  const p = UI.P(); const to = p.to; const y = +to.slice(0, 4);
  const cur = KT.rep.b02(p.from, p.to).cur; const cash = L.bal('111', to) + L.bal('112', to) + L.bal('113', to);
  const ar = KT.rep.b01(to).cur; const vat = KT.tax.vatSeries(L.last || to); const lv = vat.length ? vat[vat.length - 1] : null;
  const labels = [], dt = [], lnt = [], tien = [];
  for (let m = 1; m <= 12; m++) { const ym = y + '-' + String(m).padStart(2, '0'); if (D.bom(ym) > (L.last || to)) break; const b = KT.rep.b02(D.bom(ym), D.eom(ym)).cur; labels.push('T' + m); dt.push(b[10]); lnt.push(b[50]); tien.push(L.bal('111', D.eom(ym)) + L.bal('112', D.eom(ym)) + L.bal('113', D.eom(ym))); }
  const cal = KT.tax.calendar(y, y).filter(x => x.state !== 'done').sort((a, b) => a.deadline < b.deadline ? -1 : 1);
  const todo = cal.filter(x => x.state === 'late' || x.state === 'soon').concat(cal.filter(x => x.state === 'open')).slice(0, 7);
  const ne = L.issues.filter(i => i.sev === 'err').length, nw = L.issues.filter(i => i.sev === 'warn').length;
  return '<div class="ph"><div><h1>Tổng quan – ' + E(p.label) + '</h1><div class="sub">' + E(S().company.name) + ' · ' + L.lines.length + ' dòng PS · ' + L.vouchers.length + ' chứng từ</div></div><span class="sp"></span><button class="btn pri" data-a="go" data-id="ps">+ Nhập chứng từ</button></div>' +
    '<div class="grid g4"><div class="kpi"><div class="l">Doanh thu thuần</div><div class="v">' + KT.f(cur[10], 1) + '</div><div class="s">Giá vốn ' + KT.f(cur[11], 1) + '</div></div>' +
    '<div class="kpi ' + (cur[50] < 0 ? 'bad' : 'ok') + '"><div class="l">Lợi nhuận trước thuế</div><div class="v">' + KT.fp(cur[50]) + '</div><div class="s">Sau thuế ' + KT.fp(cur[60]) + '</div></div>' +
    '<div class="kpi"><div class="l">Tiền và tương đương tiền</div><div class="v">' + KT.f(cash, 1) + '</div><div class="s">Tại ' + D.fmt(to) + '</div></div>' +
    '<div class="kpi"><div class="l">Phải thu / Phải trả</div><div class="v" style="font-size:15px">' + KT.f(ar[131] || 0, 1) + ' / ' + KT.f(ar[311] || 0, 1) + '</div><div class="s">Khách hàng / người bán</div></div>' +
    '<div class="kpi ' + (lv && lv.v[40] > 0 ? '' : 'ok') + '"><div class="l">GTGT ' + (lv ? lv.per.label : '') + '</div><div class="v">' + (lv ? (lv.v[40] > 0 ? KT.f(lv.v[40]) : KT.f(lv.v[43], 1)) : '-') + '</div><div class="s">' + (lv ? (lv.v[40] > 0 ? 'phải nộp' : 'còn được khấu trừ chuyển kỳ sau') : '') + '</div></div></div>' +
    '<div class="grid g2"><div class="card"><h2>Doanh thu và lợi nhuận trước thuế theo tháng ' + y + '</h2>' + UI.chart(labels, [{ n: 'Doanh thu thuần', v: dt }, { n: 'LNTT', v: lnt }], { title: 'Doanh thu và lợi nhuận' }) + '</div><div class="card"><h2>Số dư tiền cuối tháng ' + y + '</h2>' + UI.chart(labels, [{ n: 'Tiền mặt + tiền gửi', v: tien }], { line: 1, dots: 1, title: 'Số dư tiền' }) + '</div></div>' +
    '<div class="grid g2"><div class="card flat"><div style="padding:12px 14px 0"><h2>Nghĩa vụ sắp tới</h2></div><div style="margin-top:8px">' + (todo.length ? todo.map(x => '<div class="cal-i"><span class="d">' + D.fmt(x.deadline).slice(0, 5) + '</span><span>' + E(x.name) + '</span><span class="num">' + (x.amount > 0 ? KT.f(x.amount) : '') + '</span><span class="pill ' + x.state + '">' + ({ late: 'Quá hạn', soon: 'Sắp đến hạn', open: 'Chưa đến hạn' }[x.state] || x.state) + '</span></div>').join('') : '<div style="padding:14px" class="muted">Không còn nghĩa vụ nào chưa hoàn thành trong năm.</div>') + '</div><div style="padding:8px 14px"><button class="btn sm" data-a="go" data-id="lich">Xem lịch đầy đủ</button></div></div>' +
    '<div class="card"><h2>Kiểm soát dữ liệu PS</h2><div class="row"><span class="pill ' + (ne ? 'bad' : 'ok') + '">' + ne + ' lỗi</span><span class="pill ' + (nw ? 'warn' : 'ok') + '">' + nw + ' cảnh báo</span></div><p class="muted small">' + (ne + nw ? 'Mở màn hình kiểm tra để xem từng dòng và nhảy tới chỗ cần sửa. Báo cáo vẫn chạy nhưng số liệu chỉ đáng tin sau khi hết lỗi.' : 'Không có vấn đề nào. Bảng cân đối cân, dòng tiền khớp số dư.') + '</p><button class="btn" data-a="go" data-id="chk">Mở kiểm tra dữ liệu</button> <button class="btn" data-a="go" data-id="tudong">Bút toán tự động</button></div></div>';
});
UI.act.demo = () => { KT.setState(KT.buildDemo()); KT.scheduleSave(); UI.initPer(); const L = KT.compute(); UI.go('dash'); UI.toast('Đã nạp dữ liệu mẫu (có thể xóa ở mục Hệ thống)'); };
UI.act.restore = () => { const i = document.createElement('input'); i.type = 'file'; i.accept = '.json,application/json'; i.onchange = () => { const f = i.files[0]; if (!f) return; const r = new FileReader(); r.onload = () => { try { KT.importJSON(r.result); UI.initPer(); UI.go('dash'); UI.toast('Đã khôi phục dữ liệu'); } catch (e) { UI.toast(e.message); } }; r.readAsText(f); }; i.click(); };

/* ====================== SỔ PS ====================== */
const COLS = [
  { k: 'ct', t: 'Số CT', w: 128, g: 'b' }, { k: 'ng', t: 'Ngày', w: 104, ty: 'd', g: 'b' }, { k: 'dg', t: 'Diễn giải', w: 320, g: 'b' },
  { k: 'no', t: 'TK Nợ', w: 74, l: 'dl-acc', g: 'b' }, { k: 'co', t: 'TK Có', w: 74, l: 'dl-acc', g: 'b' }, { k: 'st', t: 'Số tiền', w: 114, ty: 'n', g: 'b' },
  { k: 'dt', t: 'Đối tượng', w: 92, l: 'dl-pt', g: 'b' }, { k: 'vt', t: 'Mã hàng', w: 76, l: 'dl-it', g: 'b' }, { k: 'sl', t: 'SL', w: 66, ty: 'q', g: 'b' }, { k: 'gia', t: 'Đơn giá', w: 92, ty: 'n', g: 'b' }, { k: 'dh', t: 'Đơn hàng', w: 74, l: 'dl-dh', g: 'b' },
  { k: 'hd', t: 'Số HĐ', w: 84, g: 't' }, { k: 'kh', t: 'Ký hiệu', w: 78, g: 't' }, { k: 'nhd', t: 'Ngày HĐ', w: 104, ty: 'd', g: 't' }, { k: 'thue', t: 'Thuế suất', w: 84, s: 'thue', g: 't' }, { k: 'gt', t: 'Giá trị chưa thuế', w: 108, ty: 'n', g: 't' }, { k: 'kt', t: 'Khấu trừ', w: 66, s: 'kt', g: 't' },
  { k: 'lc', t: 'Mã LCTT', w: 90, s: 'lc', g: 'x' }, { k: 'tn', t: 'Điều chỉnh TNDN', w: 120, s: 'tn', g: 'x' }, { k: 'nth', t: 'Người nhận/nộp', w: 110, g: 'x' }, { k: 'dvth', t: 'Đơn vị', w: 110, g: 'x' }
];
const selOpts = {
  thue: () => KT.THUE.map(x => [x.c, x.n]), kt: () => [['', 'Tự động'], ['Y', 'Được khấu trừ'], ['N', 'Không khấu trừ']],
  lc: () => [['', 'Tự động']].concat(KT.LCTT.map(x => [x.code, x.code + ' · ' + x.name.slice(0, 38)])), tn: () => [['', '(không)']].concat(KT.TN_CATS.map(x => [x.c, x.c + ' · ' + x.n.slice(0, 40)]))
};
const dls = () => '<datalist id="dl-acc">' + S().accounts.filter(a => !KT.acc.hasChildren(a.code) || a.code.length >= 3).map(a => '<option value="' + E(a.code) + '">' + E(a.name) + '</option>').join('') + '</datalist><datalist id="dl-pt">' + S().partners.concat(S().employees).map(p => '<option value="' + E(p.code) + '">' + E(p.name) + '</option>').join('') + '</datalist><datalist id="dl-it">' + S().items.map(p => '<option value="' + E(p.code) + '">' + E(p.name) + '</option>').join('') + '</datalist><datalist id="dl-dh">' + S().orders.map(p => '<option value="' + E(p.code) + '">' + E(p.name) + '</option>').join('') + '</datalist>';
const dispVal = (c, j) => { const v = j[c.k]; if (c.ty === 'd') return D.fmt(D.parse(v)) || (v || ''); if (c.ty === 'n') return KT.f(KT.num(v)); if (c.ty === 'q') return KT.fq(KT.num(v)); return v == null ? '' : v; };
const cellHtml = (c, j, ro) => {
  const ro_ = ro ? ' disabled' : '';
  if (c.s) return '<td style="min-width:' + c.w + 'px"><select data-c="psf" data-k="' + c.k + '"' + ro_ + '>' + selOpts[c.s]().map(o => '<option value="' + E(o[0]) + '"' + (String(j[c.k] || '') === o[0] ? ' selected' : '') + '>' + E(o[1]) + '</option>').join('') + '</select></td>';
  const cls = (c.ty === 'n' || c.ty === 'q' ? 'num' : '') + (c.k === 'ct' ? ' ct' : '');
  return '<td class="' + (c.ty === 'n' || c.ty === 'q' ? 'r' : '') + '" style="min-width:' + c.w + 'px"><input class="' + cls + '" data-c="psf" data-k="' + c.k + '" value="' + E(dispVal(c, j)) + '"' + (c.l ? ' list="' + c.l + '"' : '') + (c.k === 'no' || c.k === 'co' ? ' title="' + E(KT.acc.name(j[c.k]) || (j[c.k] ? 'Tài khoản chưa có trong hệ thống' : '')) + '"' : '') + ro_ + ' autocomplete="off"></td>';
};
const psFiltered = () => {
  const f = UI.ps, J = S().journal, out = []; const q = (f.q || '').toLowerCase().trim(); const L = KT.compute(); const bad = f.only === 'issue' ? new Set(L.issues.map(i => i.id).filter(Boolean)) : null;
  for (let i = 0; i < J.length; i++) {
    const j = J[i];
    if (f.ym && D.ym(D.parse(j.ng) || '') !== f.ym) continue;
    if (f.only === 'manual' && j.tag) continue; if (f.only === 'auto' && !j.tag) continue; if (bad && !bad.has(j.id)) continue;
    if (q && !((j.ct || '') + ' ' + (j.dg || '') + ' ' + (j.no || '') + ' ' + (j.co || '') + ' ' + (j.dt || '') + ' ' + (j.vt || '') + ' ' + (j.dh || '') + ' ' + (j.hd || '')).toLowerCase().includes(q)) continue;
    out.push(i);
  }
  return out;
};
const PAGE = 120;
UI.route('ps', 'Sổ PS – nhập chứng từ', 'Nhập liệu', false, () => {
  const f = UI.ps, J = S().journal, idx = psFiltered(); const np = Math.max(1, Math.ceil(idx.length / PAGE)); if (f.page == null || f.page >= np) f.page = np - 1; if (f.page < 0) f.page = 0;
  const L = KT.compute(); const sev = new Map(); for (const i of L.issues) if (i.id) { const o = sev.get(i.id); if (!o || (i.sev === 'err') || (o.sev !== 'err' && i.sev === 'warn')) sev.set(i.id, i); }
  const cols = COLS.filter(c => c.g === 'b' || (c.g === 't' && f.tax !== false) || (c.g === 'x' && f.more)); const lock = S().lockedUntil;
  const rows = idx.slice(f.page * PAGE, (f.page + 1) * PAGE); let prev = null, h = '';
  for (const i of rows) {
    const j = J[i], vk = KT.vkey(j.ct), d = D.parse(j.ng); const ro = !!j.tag || (lock && d && d <= lock); const s = sev.get(j.id);
    h += '<tr data-i="' + i + '" class="' + (vk !== prev ? 'vs ' : 'same ') + (j.tag ? 'auto ' : '') + (lock && d && d <= lock ? 'lock' : '') + '"><td class="st"><span class="dot ' + (s ? s.sev : '') + '" title="' + E(s ? s.code + ': ' + s.msg : j.tag ? 'Dòng tự sinh (' + j.tag + ') – sửa ở màn hình Bút toán tự động' : '') + '"></span></td>' + cols.map(c => cellHtml(c, j, ro)).join('') + '<td class="st">' + (ro ? '' : '<button class="x" data-a="psdup" title="Nhân đôi dòng">⎘</button><button class="x" data-a="psdel" title="Xóa dòng">✕</button>') + '</td></tr>'; prev = vk;
  }
  let tot = 0; for (const i of idx) tot += KT.num(J[i].st);
  const months = [...new Set(J.map(j => D.ym(D.parse(j.ng) || '')).filter(Boolean))].sort();
  return dls() + '<div class="ph"><div><h1>Sổ PS</h1><div class="sub">Nơi duy nhất nhập liệu. Một dòng là một cặp Nợ/Có. Các dòng cùng số chứng từ và ngày thuộc một chứng từ.</div></div><span class="sp"></span><button class="btn" data-a="paste">Dán từ Excel</button><button class="btn pri" data-a="tpl">Nhập theo mẫu</button><button class="btn" data-a="psadd">+ Dòng trống</button></div>' +
    '<div class="card" style="padding:10px 12px"><div class="row"><label class="f" style="flex-direction:row;align-items:center;gap:6px">Tháng <select data-c="psfil" data-k="ym"><option value="">Tất cả</option>' + months.map(m => '<option' + (m === f.ym ? ' selected' : '') + ' value="' + m + '">' + m.slice(5) + '/' + m.slice(0, 4) + '</option>').join('') + '</select></label><input id="psq" type="search" placeholder="Tìm số CT, diễn giải, TK, đối tượng…" value="' + E(f.q) + '" data-i="psq" style="min-width:230px"><select data-c="psfil" data-k="only"><option value="">Tất cả dòng</option><option value="manual"' + (f.only === 'manual' ? ' selected' : '') + '>Chỉ dòng nhập tay</option><option value="auto"' + (f.only === 'auto' ? ' selected' : '') + '>Chỉ dòng tự sinh</option><option value="issue"' + (f.only === 'issue' ? ' selected' : '') + '>Chỉ dòng có vấn đề</option></select><label class="row small muted" style="gap:4px"><input type="checkbox" data-c="psfil" data-k="tax"' + (f.tax !== false ? ' checked' : '') + '> Cột hóa đơn/thuế</label><label class="row small muted" style="gap:4px"><input type="checkbox" data-c="psfil" data-k="more"' + (f.more ? ' checked' : '') + '> Cột LCTT, TNDN</label><span class="sp" style="flex:1"></span><span class="muted small" id="pstot">' + idx.length + ' dòng · tổng tiền ' + KT.f(tot) + '</span><button class="btn sm" data-a="psxls">Xuất Excel</button></div></div>' +
    '<div class="card flat"><div class="tw" style="max-height:calc(100vh - 290px)"><table class="t ps"><thead><tr><th></th>' + cols.map(c => '<th class="' + (c.ty === 'n' || c.ty === 'q' ? 'r' : '') + '">' + E(c.t) + '</th>').join('') + '<th></th></tr></thead><tbody id="psb">' + (h || '<tr><td colspan="' + (cols.length + 2) + '" style="padding:22px;text-align:center" class="muted">Chưa có dòng nào khớp. Bấm “Nhập theo mẫu” để ghi chứng từ đầu tiên.</td></tr>') + '</tbody></table></div></div>' +
    (np > 1 ? '<div class="row" style="justify-content:center"><button class="btn sm" data-a="pspg" data-d="-1"' + (f.page <= 0 ? ' disabled' : '') + '>‹ Trước</button><span class="muted">Trang ' + (f.page + 1) + '/' + np + '</span><button class="btn sm" data-a="pspg" data-d="1"' + (f.page >= np - 1 ? ' disabled' : '') + '>Sau ›</button></div>' : '') +
    '<div class="notice small">Mẹo: gõ mã tài khoản, đối tượng, mã hàng rồi Tab để sang ô kế tiếp. Dòng nền xám là bút toán tự sinh (sửa ở mục Bút toán tự động). Dòng gạch chéo thuộc kỳ đã khóa sổ. Chấm màu đầu dòng là cảnh báo của kiểm soát dữ liệu (rê chuột để đọc).</div>';
});
UI.chg.psfil = el => { const k = el.dataset.k; UI.ps[k] = el.type === 'checkbox' ? el.checked : el.value; UI.ps.page = null; UI.render(); if (k === 'q') { const q = $('#psq'); if (q) { q.focus(); q.setSelectionRange(q.value.length, q.value.length); } } };
let psqT = 0;
UI.chg.psq = el => { clearTimeout(psqT); psqT = setTimeout(() => { UI.ps.q = el.value; UI.ps.page = null; UI.render(); const q = $('#psq'); if (q) { q.focus(); q.setSelectionRange(q.value.length, q.value.length); } }, 280); };
UI.act.pspg = el => { UI.ps.page += +el.dataset.d; UI.render(); };
const rowOf = el => { const tr = el.closest('tr'); return tr ? S().journal[+tr.dataset.i] : null; };
UI.chg.psf = el => {
  const j = rowOf(el); if (!j) return; const k = el.dataset.k; let v = el.value.trim(); const c = COLS.find(x => x.k === k);
  KT.snapshot();
  if (c.ty === 'd') { const p = D.parse(v); if (v && !p) { UI.toast('Ngày không hợp lệ (dùng dd/mm/yyyy)'); el.value = dispVal(c, j); return; } if (k === 'ng' && p && S().lockedUntil && p <= S().lockedUntil) { UI.toast('Kỳ đã khóa sổ đến ' + D.fmt(S().lockedUntil)); el.value = dispVal(c, j); return; } v = p; }
  else if (c.ty === 'n' || c.ty === 'q') v = v === '' ? '' : KT.num(v);
  else if (k === 'no' || k === 'co') v = v.replace(/\s/g, '');
  j[k] = v; if (c.ty) el.value = dispVal(c, j);
  if (k === 'no' || k === 'co') { el.title = KT.acc.name(v) || (v ? 'Tài khoản chưa có trong hệ thống' : ''); }
  if ((k === 'sl' || k === 'gia') && j.sl && j.gia && !KT.num(j.st)) { j.st = KT.rnd(KT.num(j.sl) * KT.num(j.gia)); const tr = el.closest('tr'); const si = $('[data-k="st"]', tr); if (si) si.value = KT.f(j.st); }
  KT.touch(true); psRefresh();
};
const psRefresh = () => {
  const L = KT.compute(); const sev = new Map(); for (const i of L.issues) if (i.id) { const o = sev.get(i.id); if (!o || i.sev === 'err') sev.set(i.id, i); }
  $$('#psb tr[data-i]').forEach(tr => { const j = S().journal[+tr.dataset.i]; if (!j) return; const d = $('.dot', tr); const s = sev.get(j.id); if (d) { d.className = 'dot ' + (s ? s.sev : ''); d.title = s ? s.code + ': ' + s.msg : ''; } });
  const ne = L.issues.filter(i => i.sev === 'err').length, nw = L.issues.filter(i => i.sev === 'warn').length; const pill = $('.top .pill'); if (pill) { pill.className = 'pill ' + (ne ? 'bad' : nw ? 'warn' : 'ok'); pill.textContent = ne ? ne + ' lỗi' : nw ? nw + ' cảnh báo' : 'Dữ liệu sạch'; }
  let tot = 0; const idx = psFiltered(); for (const i of idx) tot += KT.num(S().journal[i].st); const t = $('#pstot'); if (t) t.textContent = idx.length + ' dòng · tổng tiền ' + KT.f(tot);
};
UI.act.psadd = () => { const J = S().journal; const l = J[J.length - 1] || {}; KT.snapshot(); const n = { id: KT.newId(), ct: l.ct || '', ng: l.ng || D.today(), dg: '', no: '', co: '', st: '' }; J.push(n); KT.touch(true); UI.ps.page = null; UI.render(); const r = $('#psb tr:last-child [data-k="dg"]'); if (r) r.focus(); };
UI.act.psdup = el => { const J = S().journal; const i = +el.closest('tr').dataset.i; KT.snapshot(); const n = Object.assign({}, J[i], { id: KT.newId() }); delete n.tag; J.splice(i + 1, 0, n); KT.touch(true); UI.render(); };
UI.act.psdel = el => { const J = S().journal; const i = +el.closest('tr').dataset.i; KT.snapshot(); J.splice(i, 1); KT.touch(true); UI.render(); UI.toast('Đã xóa dòng (có thể hoàn tác)'); };
UI.act.psxls = () => { const idx = psFiltered(); const J = S().journal; const keys = ['ct', 'ng', 'dg', 'no', 'co', 'st', 'dt', 'vt', 'sl', 'gia', 'dh', 'hd', 'kh', 'nhd', 'thue', 'gt', 'lc', 'tn', 'nth', 'dvth']; const T = ['Số CT', 'Ngày', 'Diễn giải', 'TK Nợ', 'TK Có', 'Số tiền', 'Đối tượng', 'Mã hàng', 'SL', 'Đơn giá', 'Đơn hàng', 'Số HĐ', 'Ký hiệu', 'Ngày HĐ', 'Thuế suất', 'Giá trị chưa thuế', 'Mã LCTT', 'Điều chỉnh TNDN', 'Người nhận/nộp', 'Đơn vị'];
  UI.xls('so-PS', 'SỔ PS (nhật ký nhập liệu)', '<table><tr>' + T.map(t => '<th>' + t + '</th>').join('') + '</tr>' + idx.map(i => '<tr>' + keys.map(k => { const j = J[i]; let v = j[k]; if (k === 'ng' || k === 'nhd') v = D.fmt(D.parse(v)); return '<td>' + E(v == null ? '' : v) + '</td>'; }).join('') + '</tr>').join('') + '</table>'); };

/* ---------- dán từ Excel (cột C..W của sheet PS) ---------- */
const PASTE_MAP = ['ct', null, 'ng', 'hd', 'nhd', 'lc', 'dn', 'dc', 'dg', 'no', 'co', 'st', 'vt', 'dh', 'dt', 'thue', null, 'sl', 'gia', 'nth', 'dvth'];
UI.act.paste = () => UI.modal('Dán chứng từ từ Excel', '<p class="muted">Sao chép vùng dữ liệu từ sheet PS của file kế toán cũ, theo đúng thứ tự cột <b>C → W</b> (Số CT, Số phiếu, Ngày, Số HĐ, Ngày HĐ, Mã LCTT, Đối tượng Nợ, Đối tượng Có, Diễn giải, TK Nợ, TK Có, Số tiền, Mã hàng, Đơn hàng, NCC/KH, Thuế, ĐVT, SL, Đơn giá, Người nhận, Đơn vị). Dòng tiêu đề được bỏ qua tự động.</p><textarea id="pastetx" rows="10" placeholder="Dán vào đây (Ctrl+V)…"></textarea><div id="pastepv" class="muted small" style="margin-top:6px"></div>', '<button class="btn" data-a="close">Hủy</button><button class="btn pri" data-a="pastego">Ghi vào PS</button>');
const parsePaste = txt => {
  const out = []; for (const line of txt.replace(/\r/g, '').split('\n')) {
    if (!line.trim()) continue; const c = line.split('\t'); const o = {};
    PASTE_MAP.forEach((k, i) => { if (k && c[i] != null && String(c[i]).trim() !== '') o[k] = String(c[i]).trim(); });
    if (!o.no && !o.co) continue; if (/^(tk\s*)?nợ$/i.test(o.no || '') || !/^\d/.test(o.no || '')) continue;
    o.ng = D.parse(o.ng) || ''; o.nhd = D.parse(o.nhd) || ''; o.st = KT.num(o.st); if (o.sl) o.sl = KT.num(o.sl); if (o.gia) o.gia = KT.num(o.gia);
    if (o.thue != null) { const t = String(o.thue).replace('%', '').trim(); o.thue = /^(kct|kkk)$/i.test(t) ? t.toUpperCase() : (KT.num(t) > 0 && KT.num(t) < 1 ? String(Math.round(KT.num(t) * 100)) : t); }
    out.push(o);
  } return out;
};
UI.chg.pastetx = () => { };
document.addEventListener('input', e => { if (e.target.id === 'pastetx') { const r = parsePaste(e.target.value); const bad = r.filter(x => !x.ng || !x.st || !KT.acc.has(x.no) || !KT.acc.has(x.co)).length; $('#pastepv').innerHTML = r.length + ' dòng hợp lệ' + (bad ? ' · <span style="color:var(--warn)">' + bad + ' dòng có ngày/số tiền/tài khoản chưa đúng (vẫn ghi, kiểm tra sau)</span>' : ''); } });
UI.act.pastego = () => { const r = parsePaste($('#pastetx').value); if (!r.length) { UI.toast('Chưa có dòng nào để ghi'); return; } KT.snapshot(); r.forEach(o => { o.id = KT.newId(); S().journal.push(o); }); KT.touch(true); UI.closeModal(); UI.ps = Object.assign(UI.ps, { ym: '', q: '', only: '', page: null }); UI.render(); UI.toast('Đã ghi ' + r.length + ' dòng vào PS'); };

/* ---------- nhập theo mẫu ---------- */
UI.act.tpl = () => {
  let h = ''; let g = ''; for (const t of KT.TPL) { if (t.grp !== g) { g = t.grp; h += (h ? '</div>' : '') + '<h3 style="margin:12px 0 6px">' + E(g) + '</h3><div class="tpls">'; } h += '<button data-a="tplpick" data-id="' + t.id + '"><div>' + (t.icon || '') + ' <b>' + E(t.name) + '</b></div></button>'; }
  UI.modal('Chọn loại chứng từ', '<p class="muted small">Mẫu chỉ giúp sinh các dòng Nợ/Có. Kết quả vẫn nằm ở sổ PS và sửa được tại đó.</p>' + h + '</div>', '', true);
};
UI.act.tplpick = el => {
  const t = KT.tpl(el.dataset.id); const f = {}; const today = UI.lastDate || D.today(); t.fields.forEach(x => { f[x.k] = x.k === 'ng' ? today : x.def != null ? x.def : ''; });
  UI.wz = { t, f, ct: '' }; UI.wzOpen();
};
UI.wzOpen = () => {
  const { t, f } = UI.wz; const opt = (a, v) => a.map(o => '<option value="' + E(o[0]) + '"' + (String(v) === o[0] ? ' selected' : '') + '>' + E(o[1]) + '</option>').join('');
  const fld = x => { const id = 'wz_' + x.k; let inp; const v = f[x.k];
    if (x.type === 'select') inp = '<select id="' + id + '" data-i="wz" data-k="' + x.k + '">' + opt(x.opts, v) + '</select>';
    else if (x.type === 'num') inp = '<input id="' + id + '" class="num" inputmode="decimal" data-i="wz" data-k="' + x.k + '" value="' + E(v === '' ? '' : KT.f(KT.num(v))) + '">';
    else if (x.type === 'date') inp = '<input id="' + id + '" data-i="wz" data-k="' + x.k + '" value="' + E(D.fmt(v)) + '" placeholder="dd/mm/yyyy">';
    else if (x.type === 'partner') inp = '<input id="' + id + '" list="dl-pt" data-i="wz" data-k="' + x.k + '" value="' + E(v) + '" autocomplete="off">';
    else if (x.type === 'item') inp = '<input id="' + id + '" list="dl-it" data-i="wz" data-k="' + x.k + '" value="' + E(v) + '" autocomplete="off">';
    else if (x.type === 'order') inp = '<input id="' + id + '" list="dl-dh" data-i="wz" data-k="' + x.k + '" value="' + E(v) + '" autocomplete="off">';
    else if (x.type === 'acc') inp = '<input id="' + id + '" list="dl-acc" data-i="wz" data-k="' + x.k + '" value="' + E(v) + '" autocomplete="off">';
    else inp = '<input id="' + id + '" data-i="wz" data-k="' + x.k + '" value="' + E(v) + '"' + (x.ph ? ' placeholder="' + E(x.ph) + '"' : '') + '>';
    return '<label class="f' + (x.k === 'dg' ? ' w2' : '') + '">' + E(x.t) + (x.req ? ' *' : '') + inp + '</label>'; };
  UI.modal(t.name, dls() + '<div class="form">' + t.fields.map(fld).join('') + '<label class="f">Số chứng từ (để trống = tự đánh số)<input id="wz_ct" data-i="wz" data-k="__ct" value="' + E(UI.wz.ct) + '" placeholder="' + E(wzNextCt()) + '"></label></div><div id="wzpv" style="margin-top:14px"></div>', '<button class="btn" data-a="close">Hủy</button><button class="btn" data-a="wzsave" data-more="1">Ghi và nhập tiếp</button><button class="btn pri" data-a="wzsave">Ghi vào PS</button>', true);
  wzPreview();
};
const wzNextCt = () => { const { t, f } = UI.wz; const y = D.parse(f.ng) ? +D.parse(f.ng).slice(0, 4) : new Date().getFullYear(); return KT.auto.nextCt(t.pre, y); };
const wzVals = () => { const { t, f } = UI.wz; const o = {}; for (const x of t.fields) { const v = f[x.k]; o[x.k] = x.type === 'num' ? KT.num(v) : x.type === 'date' ? (D.parse(v) || '') : v == null ? '' : String(v).trim(); } return o; };
const wzPreview = () => {
  const { t } = UI.wz; const f = wzVals(); const el = $('#wzpv'); if (!el) return; const miss = t.fields.filter(x => x.req && (f[x.k] === '' || f[x.k] === 0)).map(x => x.t);
  if (miss.length) { el.innerHTML = '<div class="notice small">Còn thiếu: ' + miss.map(E).join(', ') + '</div>'; return; }
  let ls; try { ls = KT.tplBuild(t.id, f, UI.wz.ct.trim() || undefined); } catch (e) { el.innerHTML = '<div class="notice bad small">' + E(e.message) + '</div>'; return; }
  const warn = []; const pt = (f.dt || ''); if (t.fields.some(x => x.k === 'dt' && x.req) && pt && !S().partners.concat(S().employees).some(p => p.code === pt)) warn.push('Mã đối tượng “' + pt + '” chưa có trong danh mục');
  if (f.vt && !S().items.some(i => i.code === f.vt)) warn.push('Mã hàng “' + f.vt + '” chưa có trong danh mục'); ls.forEach(l => { if (!KT.acc.has(l.no) || !KT.acc.has(l.co)) warn.push('Tài khoản ' + l.no + '/' + l.co + ' chưa có trong hệ thống'); });
  const tn = ls.reduce((s, l) => s + KT.num(l.st), 0);
  el.innerHTML = '<h3>Bút toán sẽ ghi vào PS</h3><div class="tw"><table class="t"><thead><tr><th>Số CT</th><th>Diễn giải</th><th>Nợ</th><th>Có</th><th class="r">Số tiền</th><th>Đối tượng</th></tr></thead><tbody>' + ls.map(l => '<tr><td>' + E(l.ct) + '</td><td>' + E(l.dg) + '</td><td>' + E(l.no) + '</td><td>' + E(l.co) + '</td><td class="r">' + (l.st || (l.sl && l.gia) ? KT.f(l.st || l.sl * l.gia) : '<span class="faint">tự tính (giá bình quân)</span>') + '</td><td>' + E(l.dt || '') + '</td></tr>').join('') + '</tbody></table></div>' + (warn.length ? '<div class="notice warn small" style="margin-top:8px">' + [...new Set(warn)].map(E).join('<br>') + '</div>' : '');
};
UI.chg.wz = el => { const k = el.dataset.k; if (k === '__ct') { UI.wz.ct = el.value; } else { const x = UI.wz.t.fields.find(q => q.k === k); let v = el.value; if (x && x.type === 'date') { v = D.parse(v) || v; } UI.wz.f[k] = v; if (x && x.type === 'num' && el.type !== 'select-one' && el.dataset.i === 'wz' && document.activeElement !== el) { } } wzPreview(); };
document.addEventListener('focusout', e => { const el = e.target; if (el.dataset && el.dataset.i === 'wz' && UI.wz) { const x = UI.wz.t.fields.find(q => q.k === el.dataset.k); if (x && x.type === 'num') el.value = KT.f(KT.num(el.value)); if (x && x.type === 'date') { const p = D.parse(el.value); if (p) el.value = D.fmt(p); } } });
UI.act.wzsave = el => {
  const { t } = UI.wz; const f = wzVals(); const miss = t.fields.filter(x => x.req && (f[x.k] === '' || f[x.k] === 0)); if (miss.length) { UI.toast('Còn thiếu: ' + miss.map(x => x.t).join(', ')); return; }
  if (S().lockedUntil && f.ng <= S().lockedUntil) { UI.toast('Ngày chứng từ thuộc kỳ đã khóa sổ'); return; }
  const ls = KT.tplBuild(t.id, f, UI.wz.ct.trim() || undefined); KT.snapshot(); ls.forEach(l => { l.id = KT.newId(); S().journal.push(l); }); KT.touch(true); UI.lastDate = f.ng;
  UI.ps = Object.assign(UI.ps, { ym: '', q: '', only: '', page: null });
  if (el.dataset.more) { UI.wz.t = t; UI.wz.ct = ''; UI.wz.f = Object.assign({}, UI.wz.f, { dg: '', hd: '', tien: '', gia: '', sl: '' }); UI.wzOpen(); UI.toast('Đã ghi ' + ls.length + ' dòng · ' + ls[0].ct); UI.render(); UI.wzOpen(); }
  else { UI.closeModal(); UI.go('ps'); UI.toast('Đã ghi ' + ls.length + ' dòng · ' + ls[0].ct); }
};

/* ====================== KIỂM TRA DỮ LIỆU ====================== */
UI.route('chk', 'Kiểm tra dữ liệu', 'Nhập liệu', false, () => {
  const L = KT.compute(); const iss = L.issues.slice().sort((a, b) => ({ err: 0, warn: 1, info: 2 }[a.sev] - { err: 0, warn: 1, info: 2 }[b.sev]) || (a.date < b.date ? -1 : 1));
  const f = UI.sub.chk || ''; const sh = f ? iss.filter(i => i.sev === f) : iss; const cnt = s => iss.filter(i => i.sev === s).length;
  return '<div class="ph"><div><h1>Kiểm tra dữ liệu PS</h1><div class="sub">Hệ thống soát lỗi nhập liệu và lỗi nguyên lý kế toán trên toàn bộ sổ.</div></div></div>' +
    '<div class="tabs"><button class="' + (!f ? 'on' : '') + '" data-a="chkf" data-f="">Tất cả (' + iss.length + ')</button><button class="' + (f === 'err' ? 'on' : '') + '" data-a="chkf" data-f="err">Lỗi (' + cnt('err') + ')</button><button class="' + (f === 'warn' ? 'on' : '') + '" data-a="chkf" data-f="warn">Cảnh báo (' + cnt('warn') + ')</button><button class="' + (f === 'info' ? 'on' : '') + '" data-a="chkf" data-f="info">Gợi ý (' + cnt('info') + ')</button></div>' +
    '<div class="card flat">' + (sh.length ? sh.slice(0, 400).map(i => '<div class="sev"><span class="pill ' + (i.sev === 'err' ? 'bad' : i.sev === 'warn' ? 'warn' : 'info') + '">' + i.code + '</span><div class="m">' + E(i.msg) + '<div class="faint small">' + (i.date ? D.fmt(i.date) : '') + (i.ct ? ' · ' + E(i.ct) : '') + '</div></div>' + (i.id ? '<button class="btn sm" data-a="chkgo" data-id="' + E(i.id) + '" data-ct="' + E(i.ct) + '">Mở dòng</button>' : '') + '</div>').join('') + (sh.length > 400 ? '<div style="padding:10px" class="muted">…và ' + (sh.length - 400) + ' mục khác</div>' : '') : '<div style="padding:22px;text-align:center" class="muted">Không có mục nào.</div>') + '</div>' +
    '<div class="card"><h2>Các kiểm tra đang chạy</h2><p class="muted small">E01 Nợ/Có thiếu hoặc tài khoản không tồn tại · E02 số tiền ≤ 0 · E03 ngày sai · E04 thiếu đối tượng khi TK theo dõi công nợ · E05 thiếu mã hàng khi TK kho · E06 quỹ tiền mặt/tiền gửi âm · E08 tồn kho âm · E10 mã đối tượng không có trong danh mục · W07 số dư tiền âm theo ngày · W13 chi tiền mặt ≥ 5 triệu · W14 thuế ≠ giá trị × thuế suất · W15 trùng số chứng từ khác ngày · W16 số dư bất thường · W17–W21 hóa đơn, thuế suất 8%, trùng hóa đơn đầu vào, thiếu MST.</p></div>';
});
UI.act.chkf = el => { UI.sub.chk = el.dataset.f; UI.render(); };
UI.act.chkgo = el => { const id = el.dataset.id; const j = S().journal.find(x => x.id === id); UI.ps = Object.assign(UI.ps, { ym: '', q: el.dataset.ct || '', only: '', page: null }); if (!el.dataset.ct && j) UI.ps.q = j.dg || ''; UI.go('ps'); };
})(window);
