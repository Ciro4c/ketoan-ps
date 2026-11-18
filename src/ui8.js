/* ===== GIAO DIỆN 8: phân loại thu nhập (bảo hiểm, thuế TNCN) và bảng chi tiết các khoản trên bảng lương ===== */
(function (G) {
'use strict';
const KT = G.KT, UI = KT.ui, D = KT.d, E = KT.esc, S = () => KT.S, H = KT.hr, F = KT.f;
const THUE = { ct: ['Chịu thuế', 'warn'], tran: ['Miễn đến mức', ''], mien: ['Miễn thuế', 'ok'] };
const badge = c => '<span class="pill ' + (c.bh ? 'warn' : '') + '" title="' + (c.bh ? 'Tính vào lương đóng BH' : 'Không tính vào lương đóng BH') + '">' + (c.bh ? 'Tính BH' : 'Không BH') + '</span> <span class="pill ' + THUE[c.thue][1] + '">' + THUE[c.thue][0] + '</span>';

/* ---- thẻ chi tiết trên màn hình Bảng lương ---- */
const matrix = () => {
  const ym = UI.P().to.slice(0, 7), B = H.breakdown(ym); if (!B.rows.length) return '';
  const cols = B.cols.filter(c => c.loai || B.rows.some(r => r.v[c.k]));
  const th = cols.map(c => '<th class="r" style="min-width:96px">' + E(c.ten) + '<div>' + badge(c) + '</div></th>').join('');
  const body = B.rows.map(r => '<tr><td><b>' + E(r.e.name) + '</b><div><button class="btn sm" data-a="khoan" data-i="' + S().employees.indexOf(r.e) + '">Phụ cấp, hỗ trợ</button></div></td>' + cols.map(c => '<td class="r">' + (r.v[c.k] ? F(r.v[c.k]) : '<span class="muted">–</span>') + '</td>').join('') + '<td class="r"><b>' + F(r.c.baseBH) + '</b></td><td class="r">' + F(r.c.mienThue) + '</td><td class="r"><b>' + F(r.c.tnct) + '</b></td></tr>').join('');
  return '<div class="card"><h2>Chi tiết các khoản thu nhập và phân loại</h2><p class="muted small" style="margin:2px 0 8px">Mỗi cột là một khoản; hai nhãn dưới tên cho biết khoản đó có tính vào lương đóng bảo hiểm không và có chịu thuế TNCN không. Ba cột cuối là kết quả: lương đóng BH (đã kẹp sàn, trần), thu nhập miễn thuế, thu nhập chịu thuế. Thêm khoản cho nhân viên bằng nút Phụ cấp, hỗ trợ ở Danh mục; đổi phân loại mặc định ở màn hình Phân loại thu nhập.</p><div class="tw"><table class="t"><thead><tr><th>Nhân viên</th>' + th + '<th class="r">Lương đóng BH</th><th class="r">Thu nhập miễn thuế</th><th class="r">Thu nhập chịu thuế</th></tr></thead><tbody>' + body + '</tbody></table></div><div class="row" style="margin-top:8px"><button class="btn" data-a="go" data-id="phanloai">Xem và sửa phân loại</button><button class="btn" data-a="clview2">Xem trước, in, xuất Excel bảng này</button></div></div>';
};
const lr = UI.routes.luong; if (lr) { const f = lr.fn; lr.fn = () => f() + matrix(); }
UI.act.clview2 = () => UI.act.clview({ dataset: { k: 'pc' } });

/* ---- màn hình Phân loại thu nhập ---- */
UI.route('phanloai', 'Phân loại thu nhập', 'Nhân sự – bảo hiểm', false, () => {
  const cat = H.pcCat(), nh = [...new Set(cat.map(x => x.nhom))];
  const th = (x) => '<select data-c="pcdef" data-l="' + x.loai + '" data-k="thue">' + [['ct', 'Chịu thuế'], ['tran', 'Miễn đến mức'], ['mien', 'Miễn toàn bộ']].map(o => '<option value="' + o[0] + '"' + (x.thue === o[0] ? ' selected' : '') + '>' + o[1] + '</option>').join('') + '</select>';
  const rows = nh.map(g => '<tr><td colspan="5" style="background:var(--surface2)"><b>' + E(g) + '</b></td></tr>' + cat.filter(x => x.nhom === g).map(x => '<tr><td>' + E(x.ten) + '</td><td class="c"><input type="checkbox" data-c="pcdef" data-l="' + x.loai + '" data-k="bh"' + (x.bh ? ' checked' : '') + '></td><td>' + th(x) + '</td><td><input class="num" size="10" data-c="pcdef" data-l="' + x.loai + '" data-k="tran" value="' + (x.thue === 'tran' ? F(KT.num(x.tran)) : '') + '" placeholder="mức/tháng"></td><td class="muted small">' + E(x.note) + '</td></tr>').join('')).join('');
  const fixed = H.FIXED.map(x => '<tr><td>' + E(x.ten) + '</td><td class="c">' + (x.bh ? '✔' : '') + '</td><td>' + THUE[x.thue][0] + '</td><td></td><td class="muted small">' + E(x.note) + '</td></tr>').join('');
  return '<div class="ph"><div><h1>Phân loại thu nhập</h1><div class="sub">Khoản nào tính vào lương đóng bảo hiểm, khoản nào chịu thuế thu nhập cá nhân.</div></div></div>' +
    '<div class="grid g3"><div class="card"><h2>Tính vào lương đóng BH</h2><p class="muted small">Mức lương theo công việc, phụ cấp lương và các khoản bổ sung có số tiền xác định, trả thường xuyên, ghi trong hợp đồng lao động (Luật BHXH 2024, Nghị định 158/2025). Sau đó kẹp giữa sàn và trần.</p></div><div class="card"><h2>Chịu thuế TNCN</h2><p class="muted small">Mọi khoản có tính chất tiền lương, tiền công, kể cả thưởng và phụ cấp, trừ khoản được miễn (ăn giữa ca có trần, làm thêm giờ, công tác phí theo quy chế…).</p></div><div class="card"><h2>Được trừ khi tính thuế</h2><p class="muted small">Bảo hiểm bắt buộc người lao động đóng, giảm trừ gia cảnh, bảo hiểm hưu trí bổ sung và nhân thọ có trần.</p></div></div>' +
    '<div class="card"><h2>Danh mục phụ cấp, hỗ trợ (sửa được)</h2><div class="notice warn small">Đây là phân loại mặc định để khi thêm khoản cho nhân viên không phải chọn lại; từng nhân viên vẫn sửa riêng được. Hãy đối chiếu quy chế công ty, hợp đồng lao động và văn bản hiện hành, nhất là các khoản xăng xe, điện thoại, nhà ở, trang phục.</div><div class="tw" style="margin-top:8px"><table class="t"><thead><tr><th>Khoản</th><th class="c">Tính BH</th><th>Thuế TNCN</th><th>Mức miễn</th><th>Ghi chú</th></tr></thead><tbody>' + rows + '</tbody></table></div><div class="row" style="margin-top:8px"><button class="btn" data-a="pcreset">Khôi phục mặc định</button></div></div>' +
    '<div class="card"><h2>Các khoản cố định trong bảng lương</h2><div class="tw"><table class="t"><thead><tr><th>Khoản</th><th class="c">Tính BH</th><th>Thuế TNCN</th><th></th><th>Ghi chú</th></tr></thead><tbody>' + fixed + '</tbody></table></div></div>';
});
UI.chg.pcdef = el => { const o = (S().company.pcDef = S().company.pcDef || {}); const l = el.dataset.l, k = el.dataset.k; const r = (o[l] = o[l] || {}); if (el.type === 'checkbox') r[k] = el.checked ? 1 : 0; else if (k === 'tran') r[k] = KT.num(el.value); else r[k] = el.value; KT.touch(true); };
UI.act.pcreset = () => UI.ask('Khôi phục phân loại mặc định? Các chỉnh sửa danh mục phụ cấp sẽ bị xóa; phân loại đã gán cho từng nhân viên giữ nguyên.', 'Khôi phục', () => { delete S().company.pcDef; KT.touch(true); });
})(typeof globalThis !== 'undefined' ? globalThis : window);
