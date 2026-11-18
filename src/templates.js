/* ===== Mẫu bút toán (nhập chứng từ nhanh, vẫn ghi xuống PS) ===== */
(function (G) {
'use strict';
const KT = G.KT, D = KT.d;
const payAcc = [['331', 'Chưa trả tiền (ghi công nợ 331)'], ['111', 'Tiền mặt (111)'], ['112', 'Chuyển khoản (112)'], ['141', 'Trừ tạm ứng (141)']];
const recAcc = [['131', 'Chưa thu tiền (ghi công nợ 131)'], ['111', 'Tiền mặt (111)'], ['112', 'Chuyển khoản (112)']];
const rates = [['10', '10%'], ['8', '8% (giảm 2%)'], ['5', '5%'], ['0', '0%'], ['KCT', 'Không chịu thuế'], ['', 'Không có hóa đơn GTGT']];
const F = {
  ng: { k: 'ng', t: 'Ngày chứng từ', type: 'date', req: 1 }, dg: { k: 'dg', t: 'Diễn giải', type: 'text', req: 1 },
  hd: { k: 'hd', t: 'Số hóa đơn', type: 'text' }, kh: { k: 'kh', t: 'Ký hiệu HĐ', type: 'text', ph: '1C26TAA' }, nhd: { k: 'nhd', t: 'Ngày hóa đơn', type: 'date' },
  ts: { k: 'thue', t: 'Thuế suất GTGT', type: 'select', opts: rates, def: '10' }, dh: { k: 'dh', t: 'Mã đơn hàng', type: 'order' }
};
const vat = (f, baseAmt) => { const r = KT.rateOf(f.thue); return r ? KT.rnd(baseAmt * r) : 0; };
const common = (f, extra) => Object.assign({ ng: f.ng, dg: f.dg, hd: f.hd || '', kh: f.kh || '', nhd: f.nhd || '' }, extra);
const cashLc = (acc) => ({});

KT.TPL = [
  { id: 'mua_hang', grp: 'Mua vào', name: 'Mua hàng hóa / NVL / CCDC nhập kho', pre: 'MH', icon: '📦',
    fields: [F.ng, { k: 'dt', t: 'Nhà cung cấp', type: 'partner', req: 1 }, { k: 'kho', t: 'Nhập vào', type: 'select', opts: [['156', 'Hàng hóa (156)'], ['152', 'Nguyên vật liệu (152)'], ['153', 'Công cụ dụng cụ (153)']], def: '156' }, { k: 'vt', t: 'Mã hàng', type: 'item', req: 1 }, { k: 'sl', t: 'Số lượng', type: 'num', req: 1 }, { k: 'gia', t: 'Đơn giá chưa thuế', type: 'num', req: 1 }, F.ts, F.hd, F.kh, F.nhd, { k: 'tt', t: 'Thanh toán', type: 'select', opts: payAcc, def: '331' }, F.dg],
    build: f => { const base = KT.rnd(f.sl * f.gia), tax = vat(f, base); const out = [common(f, { no: f.kho, co: f.tt, st: base, dt: f.dt, vt: f.vt, sl: f.sl, gia: f.gia, thue: f.thue, gt: base })]; if (tax) out.push(common(f, { no: '1331', co: f.tt, st: tax, dt: f.dt, thue: f.thue, gt: base })); return out; } },
  { id: 'mua_cp', grp: 'Mua vào', name: 'Mua dịch vụ / chi phí (có hóa đơn)', pre: 'MH', icon: '🧾',
    fields: [F.ng, { k: 'dt', t: 'Nhà cung cấp', type: 'partner', req: 1 }, { k: 'tk', t: 'Hạch toán chi phí vào', type: 'acc', def: '642', req: 1 }, { k: 'tien', t: 'Giá trị chưa thuế', type: 'num', req: 1 }, F.ts, F.hd, F.kh, F.nhd, F.dh, { k: 'tt', t: 'Thanh toán', type: 'select', opts: payAcc, def: '331' }, F.dg],
    build: f => { const tax = vat(f, f.tien); const o = [common(f, { no: f.tk, co: f.tt, st: f.tien, dt: f.dt, dh: f.dh, thue: f.thue, gt: f.tien })]; if (tax) o.push(common(f, { no: '1331', co: f.tt, st: tax, dt: f.dt, thue: f.thue, gt: f.tien })); return o; } },
  { id: 'mua_tscd', grp: 'Mua vào', name: 'Mua TSCĐ (ghi tăng nguyên giá)', pre: 'MH', icon: '🖥️',
    fields: [F.ng, { k: 'dt', t: 'Nhà cung cấp', type: 'partner', req: 1 }, { k: 'tk', t: 'Loại TSCĐ', type: 'select', opts: [['2112', '2112 Máy móc, thiết bị'], ['2114', '2114 Thiết bị, dụng cụ quản lý'], ['2113', '2113 Phương tiện vận tải'], ['2111', '2111 Nhà cửa'], ['2134', '2134 Phần mềm (vô hình)'], ['2118', '2118 TSCĐ hữu hình khác']], def: '2114' }, { k: 'tien', t: 'Nguyên giá chưa thuế', type: 'num', req: 1 }, F.ts, F.hd, F.kh, F.nhd, { k: 'tt', t: 'Thanh toán', type: 'select', opts: payAcc, def: '331' }, F.dg],
    build: f => { const tax = vat(f, f.tien); const o = [common(f, { no: f.tk, co: f.tt, st: f.tien, dt: f.dt, thue: f.thue, gt: f.tien })]; if (tax) o.push(common(f, { no: '1332', co: f.tt, st: tax, dt: f.dt, thue: f.thue, gt: f.tien })); return o; } },
  { id: 'ban_hang', grp: 'Bán ra', name: 'Bán hàng / thành phẩm / dịch vụ (kèm giá vốn)', pre: 'HD', icon: '💰',
    fields: [F.ng, { k: 'dt', t: 'Khách hàng', type: 'partner', req: 1 }, { k: 'dtk', t: 'Loại doanh thu', type: 'select', opts: [['5111', '5111 Bán hàng hóa'], ['5112', '5112 Bán thành phẩm'], ['5113', '5113 Cung cấp dịch vụ']], def: '5111' }, { k: 'vt', t: 'Mã hàng (nếu bán hàng)', type: 'item' }, { k: 'sl', t: 'Số lượng', type: 'num' }, { k: 'tien', t: 'Doanh thu chưa thuế', type: 'num', req: 1 }, F.ts, F.hd, F.kh, F.nhd, F.dh, { k: 'tt', t: 'Thu tiền', type: 'select', opts: recAcc, def: '131' }, { k: 'gv', t: 'Ghi giá vốn tự động', type: 'select', opts: [['1', 'Có (giá bình quân)'], ['0', 'Không']], def: '1' }, F.dg],
    build: f => { const tax = vat(f, f.tien); const it = KT.S.items.find(x => x.code === f.vt); const o = [common(f, { no: f.tt, co: f.dtk, st: f.tien, dt: f.dt, vt: f.vt, sl: f.sl, dh: f.dh, thue: f.thue, gt: f.tien })]; if (tax) o.push(common(f, { no: f.tt, co: '33311', st: tax, dt: f.dt, dh: f.dh, thue: f.thue, gt: f.tien }));
      if (f.gv === '1' && f.vt && f.sl) o.push({ ng: f.ng, dg: 'Giá vốn – ' + f.dg, no: '632', co: (it && it.tk) || (f.dtk === '5112' ? '155' : '156'), vt: f.vt, sl: f.sl, dh: f.dh, nth: '' }); return o; } },
  { id: 'thu_kh', grp: 'Thu – Chi', name: 'Thu tiền khách hàng', pre: 'PT', icon: '⬇️',
    fields: [F.ng, { k: 'dt', t: 'Khách hàng', type: 'partner', req: 1 }, { k: 'tien', t: 'Số tiền thu', type: 'num', req: 1 }, { k: 'tk', t: 'Vào', type: 'select', opts: [['112', 'Tiền gửi NH (112)'], ['111', 'Tiền mặt (111)']], def: '112' }, F.dg],
    build: f => [{ ng: f.ng, dg: f.dg, no: f.tk, co: '131', st: f.tien, dt: f.dt }] },
  { id: 'chi_ncc', grp: 'Thu – Chi', name: 'Trả tiền nhà cung cấp', pre: 'PC', icon: '⬆️',
    fields: [F.ng, { k: 'dt', t: 'Nhà cung cấp', type: 'partner', req: 1 }, { k: 'tien', t: 'Số tiền trả', type: 'num', req: 1 }, { k: 'tk', t: 'Từ', type: 'select', opts: [['112', 'Tiền gửi NH (112)'], ['111', 'Tiền mặt (111)']], def: '112' }, F.dg],
    build: f => [{ ng: f.ng, dg: f.dg, no: '331', co: f.tk, st: f.tien, dt: f.dt }] },
  { id: 'chi_phi', grp: 'Thu – Chi', name: 'Chi phí trả ngay (không qua công nợ)', pre: 'PC', icon: '🧾',
    fields: [F.ng, { k: 'tk', t: 'Hạch toán vào', type: 'acc', def: '642', req: 1 }, { k: 'tien', t: 'Số tiền', type: 'num', req: 1 }, { k: 'tt', t: 'Chi từ', type: 'select', opts: [['111', 'Tiền mặt'], ['112', 'Tiền gửi NH']], def: '112' }, F.dh, F.dg],
    build: f => [{ ng: f.ng, dg: f.dg, no: f.tk, co: f.tt, st: f.tien, dh: f.dh }] },
  { id: 'kh_ung', grp: 'Thu – Chi', name: 'Khách hàng ứng / đặt cọc trước', pre: 'BC', icon: '📥',
    fields: [F.ng, { k: 'dt', t: 'Khách hàng', type: 'partner', req: 1 }, { k: 'tien', t: 'Số tiền', type: 'num', req: 1 }, { k: 'tk', t: 'Vào', type: 'select', opts: [['112', 'Tiền gửi NH'], ['111', 'Tiền mặt']], def: '112' }, F.dg],
    build: f => [{ ng: f.ng, dg: f.dg, no: f.tk, co: '131', st: f.tien, dt: f.dt }] },
  { id: 'rut_nop', grp: 'Thu – Chi', name: 'Rút / nộp tiền ngân hàng', pre: 'PC', icon: '🏦',
    fields: [F.ng, { k: 'tien', t: 'Số tiền', type: 'num', req: 1 }, { k: 'huong', t: 'Chiều', type: 'select', opts: [['rut', 'Rút TGNH về quỹ (Nợ 111 / Có 112)'], ['nop', 'Nộp quỹ vào NH (Nợ 112 / Có 111)']], def: 'rut' }, F.dg],
    build: f => [{ ng: f.ng, dg: f.dg, no: f.huong === 'rut' ? '111' : '112', co: f.huong === 'rut' ? '112' : '111', st: f.tien }] },
  { id: 'gop_von', grp: 'Vốn – Vay', name: 'Chủ sở hữu góp vốn', pre: 'GV', icon: '🏛️',
    fields: [F.ng, { k: 'dt', t: 'Chủ sở hữu / thành viên', type: 'partner', req: 1 }, { k: 'tien', t: 'Số tiền góp', type: 'num', req: 1 }, { k: 'tk', t: 'Vào', type: 'select', opts: [['112', 'Tiền gửi NH'], ['111', 'Tiền mặt']], def: '112' }, F.dg],
    build: f => [{ ng: f.ng, dg: f.dg, no: f.tk, co: '4111', st: f.tien, dt: f.dt }] },
  { id: 'vay', grp: 'Vốn – Vay', name: 'Nhận vay / trả nợ gốc / trả lãi', pre: 'BC', icon: '🏧',
    fields: [F.ng, { k: 'dt', t: 'Bên cho vay', type: 'partner', req: 1 }, { k: 'loai', t: 'Nghiệp vụ', type: 'select', opts: [['nhan_ng', 'Nhận vay ngắn hạn (Nợ 112 / Có 34111)'], ['nhan_dh', 'Nhận vay dài hạn (Nợ 112 / Có 34112)'], ['goc_ng', 'Trả gốc vay ngắn hạn'], ['goc_dh', 'Trả gốc vay dài hạn'], ['lai', 'Trả lãi vay (Nợ 635 / Có 112)']], def: 'nhan_ng' }, { k: 'tien', t: 'Số tiền', type: 'num', req: 1 }, F.dg],
    build: f => { const m = { nhan_ng: ['112', '34111'], nhan_dh: ['112', '34112'], goc_ng: ['34111', '112'], goc_dh: ['34112', '112'], lai: ['6351', '112'] }[f.loai]; return [{ ng: f.ng, dg: f.dg, no: m[0], co: m[1], st: f.tien, dt: f.loai === 'lai' ? '' : f.dt }]; } },
  { id: 'nop_thue', grp: 'Nghĩa vụ', name: 'Nộp thuế / lệ phí vào ngân sách', pre: 'BN', icon: '🏛️',
    fields: [F.ng, { k: 'tk', t: 'Sắc thuế', type: 'select', opts: [['3331', 'Thuế GTGT (3331)'], ['3334', 'Thuế TNDN (3334)'], ['3335', 'Thuế TNCN (3335)'], ['3338', 'Môn bài / thuế khác (3338)'], ['3337', 'Thuế nhà đất, tiền thuê đất (3337)']], def: '3331' }, { k: 'tien', t: 'Số tiền nộp', type: 'num', req: 1 }, { k: 'tt', t: 'Từ', type: 'select', opts: [['112', 'Tiền gửi NH'], ['111', 'Tiền mặt']], def: '112' }, F.dg],
    build: f => [{ ng: f.ng, dg: f.dg, no: f.tk, co: f.tt, st: f.tien }] },
  { id: 'nop_bh', grp: 'Nghĩa vụ', name: 'Nộp BHXH, BHYT, BHTN, KPCĐ', pre: 'BN', icon: '🛡️',
    fields: [F.ng, { k: 'ym', t: 'Tháng bảng lương', type: 'month', req: 1 }, { k: 'tt', t: 'Từ', type: 'select', opts: [['112', 'Tiền gửi NH'], ['111', 'Tiền mặt']], def: '112' }, { k: 'kp', t: 'Gồm cả kinh phí công đoàn', type: 'select', opts: [['0', 'Không (nộp BHXH riêng)'], ['1', 'Có']], def: '0' }, F.dg],
    build: f => { const m = KT.hr.month(f.ym); let x = { '3383': 0, '3384': 0, '3386': 0, '3382': 0 }; for (const r of m.rows) { x['3383'] += r.c.nld.bhxh + r.c.nsd.bhxh; x['3384'] += r.c.nld.bhyt + r.c.nsd.bhyt; x['3386'] += r.c.nld.bhtn + r.c.nsd.bhtn; x['3382'] += r.c.kpcd; } return Object.keys(x).filter(k => x[k] > 0 && (k !== '3382' || f.kp === '1')).map(k => ({ ng: f.ng, dg: f.dg + ' – ' + KT.acc.name(k), no: k, co: f.tt, st: x[k] })); } },
  { id: 'tra_luong', grp: 'Nghĩa vụ', name: 'Chi trả lương (thực lĩnh)', pre: 'PC', icon: '👥',
    fields: [F.ng, { k: 'ym', t: 'Tháng bảng lương', type: 'month', req: 1 }, { k: 'tt', t: 'Chi từ', type: 'select', opts: [['112', 'Chuyển khoản'], ['111', 'Tiền mặt']], def: '112' }, F.dg],
    build: f => KT.hr.month(f.ym).rows.filter(r => r.c.thucLinh > 0).map(r => ({ ng: f.ng, dg: f.dg + ' – ' + r.e.name, no: '334', co: f.tt, st: r.c.thucLinh, dt: r.e.code })) },
  { id: 'xuat_sx', grp: 'Kho – Sản xuất', name: 'Xuất kho NVL cho sản xuất', pre: 'PX', icon: '🏭',
    fields: [F.ng, { k: 'vt', t: 'Mã NVL', type: 'item', req: 1 }, { k: 'sl', t: 'Số lượng', type: 'num', req: 1 }, F.dh, F.dg],
    build: f => [{ ng: f.ng, dg: f.dg, no: '621', co: '152', vt: f.vt, sl: f.sl, dh: f.dh }] },
  { id: 'nhap_tp', grp: 'Kho – Sản xuất', name: 'Nhập kho thành phẩm (giá thành tự động)', pre: 'PN', icon: '✅',
    fields: [F.ng, { k: 'vt', t: 'Mã thành phẩm', type: 'item', req: 1 }, { k: 'sl', t: 'Số lượng', type: 'num', req: 1 }, { k: 'dh', t: 'Mã đơn hàng / lệnh SX', type: 'order', req: 1 }, F.dg],
    build: f => [{ ng: f.ng, dg: f.dg, no: '155', co: '154', vt: f.vt, sl: f.sl, dh: f.dh }] },
  { id: 'tam_ung', grp: 'Thu – Chi', name: 'Tạm ứng / hoàn ứng', pre: 'PC', icon: '🔁',
    fields: [F.ng, { k: 'dt', t: 'Nhân viên', type: 'partner', req: 1 }, { k: 'loai', t: 'Nghiệp vụ', type: 'select', opts: [['ung', 'Chi tạm ứng (Nợ 141 / Có 111)'], ['hoan', 'Hoàn ứng thừa (Nợ 111 / Có 141)']], def: 'ung' }, { k: 'tien', t: 'Số tiền', type: 'num', req: 1 }, F.dg],
    build: f => [{ ng: f.ng, dg: f.dg, no: f.loai === 'ung' ? '141' : '111', co: f.loai === 'ung' ? '111' : '141', st: f.tien, dt: f.dt }] },
  { id: 'lai_nh', grp: 'Thu – Chi', name: 'Lãi tiền gửi ngân hàng', pre: 'BC', icon: '📈',
    fields: [F.ng, { k: 'tien', t: 'Số tiền lãi', type: 'num', req: 1 }, F.dg],
    build: f => [{ ng: f.ng, dg: f.dg, no: '112', co: '515', st: f.tien }] }
];

/* ---- bổ sung các nghiệp vụ trọng yếu cho thương mại, sản xuất, dịch vụ ---- */
const dtNo = [['5211', '5211 Chiết khấu thương mại'], ['5212', '5212 Hàng bán bị trả lại'], ['5213', '5213 Giảm giá hàng bán']];
KT.TPL.push(
  { id: 'giam_tru_dt', grp: 'Bán ra', name: 'Chiết khấu thương mại, giảm giá, hàng bán bị trả lại (giảm doanh thu)', pre: 'HD', icon: '↩️',
    fields: [F.ng, { k: 'dt', t: 'Khách hàng', type: 'partner', req: 1 }, { k: 'tk', t: 'Loại giảm trừ', type: 'select', opts: dtNo, def: '5211' }, { k: 'tien', t: 'Số tiền chưa thuế', type: 'num', req: 1 }, F.ts, F.hd, F.kh, F.nhd, { k: 'tt', t: 'Giảm vào', type: 'select', opts: [['131', 'Công nợ phải thu (131)'], ['111', 'Hoàn tiền mặt (111)'], ['112', 'Hoàn chuyển khoản (112)']], def: '131' }, { k: 'vt', t: 'Mã hàng nhập lại kho (nếu hàng trả lại)', type: 'item' }, { k: 'sl', t: 'Số lượng nhập lại', type: 'num' }, { k: 'gv', t: 'Đơn giá vốn khi bán', type: 'num' }, F.dg],
    build: f => { const tax = vat(f, f.tien); const o = [common(f, { no: f.tk, co: f.tt, st: f.tien, dt: f.dt, thue: f.thue, gt: f.tien })]; if (tax) o.push(common(f, { no: '33311', co: f.tt, st: tax, dt: f.dt, thue: f.thue, gt: f.tien }));
      if (f.tk === '5212' && f.vt && f.sl) { const it = KT.S.items.find(x => x.code === f.vt); o.push({ ng: f.ng, dg: 'Nhập lại hàng bán bị trả lại – ' + f.dg, no: (it && it.tk) || '156', co: '632', vt: f.vt, sl: f.sl, gia: f.gv || undefined, st: f.gv ? KT.rnd(f.sl * f.gv) : 0 }); } return o; } },
  { id: 'tra_hang_mua', grp: 'Mua vào', name: 'Hàng mua trả lại, giảm giá hàng mua, chiết khấu thương mại được hưởng', pre: 'MH', icon: '↪️',
    fields: [F.ng, { k: 'dt', t: 'Nhà cung cấp', type: 'partner', req: 1 }, { k: 'loai', t: 'Nghiệp vụ', type: 'select', opts: [['tra', 'Trả lại hàng (xuất kho trả)'], ['giam', 'Giảm giá, chiết khấu thương mại (giảm giá trị hàng)']], def: 'tra' }, { k: 'kho', t: 'Tài khoản kho', type: 'select', opts: [['156', '156 Hàng hóa'], ['152', '152 Nguyên vật liệu'], ['153', '153 Công cụ dụng cụ']], def: '156' }, { k: 'vt', t: 'Mã hàng', type: 'item' }, { k: 'sl', t: 'Số lượng trả (nếu trả lại)', type: 'num' }, { k: 'tien', t: 'Giá trị chưa thuế', type: 'num', req: 1 }, F.ts, F.hd, F.kh, F.nhd, { k: 'tt', t: 'Giảm vào', type: 'select', opts: [['331', 'Công nợ phải trả (331)'], ['111', 'Nhận lại tiền mặt (111)'], ['112', 'Nhận lại chuyển khoản (112)']], def: '331' }, F.dg],
    build: f => { const tax = vat(f, f.tien); const o = [common(f, { no: f.tt, co: f.kho, st: f.tien, dt: f.dt, vt: f.vt, sl: f.loai === 'tra' ? f.sl : '', thue: f.thue, gt: f.tien })]; if (tax) o.push(common(f, { no: f.tt, co: '1331', st: tax, dt: f.dt, thue: f.thue, gt: f.tien })); return o; } },
  { id: 'nhap_khau', grp: 'Mua vào', name: 'Nhập khẩu hàng hóa (thuế nhập khẩu, GTGT hàng nhập khẩu)', pre: 'MH', icon: '🚢',
    fields: [F.ng, { k: 'dt', t: 'Nhà cung cấp nước ngoài', type: 'partner', req: 1 }, { k: 'kho', t: 'Nhập vào', type: 'select', opts: [['156', 'Hàng hóa (156)'], ['152', 'Nguyên vật liệu (152)'], ['153', 'Công cụ dụng cụ (153)']], def: '156' }, { k: 'vt', t: 'Mã hàng', type: 'item', req: 1 }, { k: 'sl', t: 'Số lượng', type: 'num', req: 1 }, { k: 'cif', t: 'Giá trị hàng (CIF) quy đồng', type: 'num', req: 1 }, { k: 'tnk', t: 'Thuế nhập khẩu phải nộp', type: 'num' }, { k: 'tttdb', t: 'Thuế tiêu thụ đặc biệt (nếu có)', type: 'num' }, F.ts, F.hd, F.nhd, F.dg],
    build: f => { const base = KT.rnd(f.cif) + KT.rnd(f.tnk || 0) + KT.rnd(f.tttdb || 0), tax = vat(f, base); const o = [common(f, { no: f.kho, co: '331', st: base, dt: f.dt, vt: f.vt, sl: f.sl })];
      if (f.tnk) o.push(common(f, { no: '331', co: '3333', st: KT.rnd(f.tnk), dt: f.dt, dg: 'Thuế nhập khẩu – ' + f.dg })); if (f.tttdb) o.push(common(f, { no: '331', co: '3332', st: KT.rnd(f.tttdb), dt: f.dt, dg: 'Thuế TTĐB hàng nhập khẩu – ' + f.dg }));
      if (tax) { o.push(common(f, { no: '1331', co: '33312', st: tax, thue: f.thue, gt: base, dg: 'GTGT hàng nhập khẩu – ' + f.dg })); } return o; } },
  { id: 'xuat_ccdc', grp: 'Kho – Sản xuất', name: 'Xuất kho công cụ dụng cụ / hàng dùng nội bộ', pre: 'PX', icon: '🧰',
    fields: [F.ng, { k: 'vt', t: 'Mã hàng', type: 'item', req: 1 }, { k: 'sl', t: 'Số lượng', type: 'num', req: 1 }, { k: 'tk', t: 'Hạch toán vào', type: 'select', opts: [['6422', '6422 Chi phí quản lý (đồ dùng văn phòng)'], ['6412', '6412 Chi phí bán hàng'], ['6272', '6272 Chi phí sản xuất chung'], ['242', '242 Chi phí chờ phân bổ (CCDC giá trị lớn)']], def: '6422' }, { k: 'kho', t: 'Xuất từ', type: 'select', opts: [['153', '153 Công cụ dụng cụ'], ['156', '156 Hàng hóa'], ['152', '152 Nguyên vật liệu']], def: '153' }, F.dh, F.dg],
    build: f => [{ ng: f.ng, dg: f.dg, no: f.tk, co: f.kho, vt: f.vt, sl: f.sl, dh: f.dh }] },
  { id: 'kiem_ke', grp: 'Kho – Sản xuất', name: 'Kiểm kê hàng tồn kho phát hiện thừa, thiếu, hao hụt', pre: 'KK', icon: '📋',
    fields: [F.ng, { k: 'vt', t: 'Mã hàng', type: 'item', req: 1 }, { k: 'sl', t: 'Số lượng chênh lệch', type: 'num', req: 1 }, { k: 'loai', t: 'Kết quả kiểm kê', type: 'select', opts: [['thieu', 'Thiếu so với sổ sách'], ['thua', 'Thừa so với sổ sách']], def: 'thieu' }, { k: 'xl', t: 'Xử lý', type: 'select', opts: [['cho', 'Chờ xử lý (1381 nếu thiếu, 3381 nếu thừa)'], ['dm', 'Hao hụt trong định mức, tính vào giá vốn (632)'], ['cn', 'Bắt bồi thường cá nhân (1388)'], ['sx', 'Thừa: ghi giảm giá vốn (632)']], def: 'cho' }, { k: 'gia', t: 'Đơn giá (bắt buộc nếu hàng thừa)', type: 'num' }, F.dg],
    build: f => { const it = KT.S.items.find(x => x.code === f.vt); const kho = (it && it.tk) || '156';
      if (f.loai === 'thieu') return [{ ng: f.ng, dg: f.dg, no: f.xl === 'dm' ? '632' : f.xl === 'cn' ? '1388' : '1381', co: kho, vt: f.vt, sl: f.sl }];
      return [{ ng: f.ng, dg: f.dg, no: kho, co: f.xl === 'sx' ? '632' : '3381', vt: f.vt, sl: f.sl, gia: f.gia }]; } },
  { id: 'thanh_ly', grp: 'Tài sản – Đầu tư', name: 'Thanh lý, nhượng bán TSCĐ', pre: 'TL', icon: '🏷️',
    fields: [F.ng, { k: 'ts', t: 'Mã TSCĐ (theo danh mục)', type: 'text' }, { k: 'dt', t: 'Bên mua', type: 'partner' }, { k: 'tk', t: 'Tài khoản nguyên giá', type: 'select', opts: [['2111', '2111 Nhà cửa'], ['2112', '2112 Máy móc, thiết bị'], ['2113', '2113 Phương tiện vận tải'], ['2114', '2114 Thiết bị, dụng cụ quản lý'], ['2118', '2118 TSCĐ hữu hình khác'], ['2134', '2134 Phần mềm']], def: '2114' }, { k: 'ng_gia', t: 'Nguyên giá', type: 'num', req: 1 }, { k: 'hm', t: 'Hao mòn lũy kế đến ngày thanh lý', type: 'num', req: 1 }, { k: 'gb', t: 'Giá bán chưa thuế (0 nếu thanh lý bỏ)', type: 'num' }, F.ts, F.hd, F.kh, F.nhd, { k: 'tt', t: 'Thu tiền', type: 'select', opts: recAcc, def: '131' }, F.dg],
    build: f => { const hm = KT.rnd(f.hm), gl = KT.rnd(f.ng_gia) - hm, tk = f.tk === '2134' ? '2143' : '2141'; const o = [];
      if (hm) o.push({ ng: f.ng, dg: 'Hao mòn lũy kế TSCĐ thanh lý – ' + f.dg, no: tk, co: f.tk, st: hm, ts: f.ts }); if (gl) o.push({ ng: f.ng, dg: 'Giá trị còn lại TSCĐ thanh lý – ' + f.dg, no: '811', co: f.tk, st: gl, ts: f.ts });
      if (f.gb) { o.push(common(f, { no: f.tt, co: '711', st: KT.rnd(f.gb), dt: f.dt, thue: f.thue, gt: f.gb, ts: f.ts })); const t = vat(f, f.gb); if (t) o.push(common(f, { no: f.tt, co: '33311', st: t, dt: f.dt, thue: f.thue, gt: f.gb })); } return o; } },
  { id: 'dau_tu', grp: 'Tài sản – Đầu tư', name: 'Đầu tư tài chính, tiền gửi có kỳ hạn (mua, thu hồi gốc)', pre: 'BC', icon: '📊',
    fields: [F.ng, { k: 'tk', t: 'Loại đầu tư', type: 'select', opts: [['1281', '1281 Tiền gửi có kỳ hạn'], ['121', '121 Chứng khoán kinh doanh'], ['221', '221 Đầu tư vào công ty con'], ['222', '222 Đầu tư vào công ty liên doanh, liên kết'], ['228', '228 Đầu tư khác']], def: '1281' }, { k: 'loai', t: 'Nghiệp vụ', type: 'select', opts: [['mua', 'Chi tiền đầu tư'], ['thu', 'Thu hồi vốn gốc (không lãi, lỗ)']], def: 'mua' }, { k: 'tien', t: 'Số tiền gốc', type: 'num', req: 1 }, { k: 'tt', t: 'Tài khoản tiền', type: 'select', opts: [['112', 'Chuyển khoản (112)'], ['111', 'Tiền mặt (111)']], def: '112' }, F.dg],
    build: f => [{ ng: f.ng, dg: f.dg, no: f.loai === 'mua' ? f.tk : f.tt, co: f.loai === 'mua' ? f.tt : f.tk, st: f.tien }] },
  { id: 'thu_nhap_tc', grp: 'Thu – Chi', name: 'Cổ tức được chia, lãi cho vay, thu nhập hoạt động tài chính', pre: 'BC', icon: '💹',
    fields: [F.ng, { k: 'dt', t: 'Đối tượng', type: 'partner' }, { k: 'tien', t: 'Số tiền', type: 'num', req: 1 }, { k: 'tt', t: 'Thu qua', type: 'select', opts: recAcc, def: '112' }, F.dg],
    build: f => [{ ng: f.ng, dg: f.dg, no: f.tt, co: '515', st: f.tien, dt: f.dt }] },
  { id: 'khac', grp: 'Thu – Chi', name: 'Thu nhập khác, chi phí khác (phạt, bồi thường, quà biếu không đủ điều kiện)', pre: 'PC', icon: '🧩',
    fields: [F.ng, { k: 'dt', t: 'Đối tượng', type: 'partner' }, { k: 'loai', t: 'Nghiệp vụ', type: 'select', opts: [['thu', 'Thu nhập khác (711)'], ['chi', 'Chi phí khác, phạt (811)']], def: 'chi' }, { k: 'tien', t: 'Số tiền', type: 'num', req: 1 }, { k: 'tt', t: 'Thu, chi qua', type: 'select', opts: [['111', 'Tiền mặt (111)'], ['112', 'Chuyển khoản (112)'], ['131', 'Công nợ phải thu (131)'], ['331', 'Công nợ phải trả (331)'], ['3388', 'Phải trả khác (3388)']], def: '112' }, F.dg],
    build: f => [{ ng: f.ng, dg: f.dg, no: f.loai === 'thu' ? f.tt : '811', co: f.loai === 'thu' ? '711' : f.tt, st: f.tien, dt: f.dt }] },
  { id: 'ck_tt', grp: 'Thu – Chi', name: 'Chiết khấu thanh toán (được hưởng, hoặc cho khách hàng hưởng)', pre: 'BC', icon: '🪙',
    fields: [F.ng, { k: 'dt', t: 'Đối tượng', type: 'partner', req: 1 }, { k: 'loai', t: 'Nghiệp vụ', type: 'select', opts: [['nhan', 'Được nhà cung cấp giảm (Nợ 331 / Có 515)'], ['cho', 'Cho khách hàng hưởng (Nợ 635 / Có 131)']], def: 'nhan' }, { k: 'tien', t: 'Số tiền', type: 'num', req: 1 }, F.dg],
    build: f => [{ ng: f.ng, dg: f.dg, no: f.loai === 'nhan' ? '331' : '635', co: f.loai === 'nhan' ? '515' : '131', st: f.tien, dt: f.dt }] },
  { id: 'du_phong', grp: 'Điều chỉnh cuối kỳ', name: 'Trích lập, hoàn nhập dự phòng; xử lý nợ phải thu không đòi được', pre: 'DP', icon: '🛟',
    fields: [F.ng, { k: 'loai', t: 'Nghiệp vụ', type: 'select', opts: [['trich', 'Trích lập dự phòng phải thu khó đòi (Nợ 642 / Có 2293)'], ['hoan', 'Hoàn nhập dự phòng phải thu khó đòi (Nợ 2293 / Có 642)'], ['htk', 'Trích lập dự phòng giảm giá hàng tồn kho (Nợ 632 / Có 2294)'], ['htkh', 'Hoàn nhập dự phòng giảm giá hàng tồn kho (Nợ 2294 / Có 632)'], ['xoa', 'Xóa nợ phải thu không đòi được (Nợ 2293, 642 / Có 131)']], def: 'trich' }, { k: 'dt', t: 'Khách hàng (khi xóa nợ)', type: 'partner' }, { k: 'tien', t: 'Số tiền (khi xóa nợ: tổng số nợ)', type: 'num', req: 1 }, { k: 'dpd', t: 'Trong đó đã lập dự phòng (khi xóa nợ)', type: 'num' }, F.dg],
    build: f => { const m = { trich: ['642', '2293'], hoan: ['2293', '642'], htk: ['632', '2294'], htkh: ['2294', '632'] }[f.loai];
      if (m) return [{ ng: f.ng, dg: f.dg, no: m[0], co: m[1], st: f.tien }]; const dp = Math.min(KT.rnd(f.dpd || 0), KT.rnd(f.tien)), ck = KT.rnd(f.tien) - dp; const o = [];
      if (dp) o.push({ ng: f.ng, dg: f.dg, no: '2293', co: '131', st: dp, dt: f.dt }); if (ck) o.push({ ng: f.ng, dg: f.dg, no: '642', co: '131', st: ck, dt: f.dt }); return o; } },
  { id: 'phan_phoi', grp: 'Điều chỉnh cuối kỳ', name: 'Phân phối lợi nhuận: trích quỹ, chia cổ tức, lợi nhuận', pre: 'PP', icon: '🧮',
    fields: [F.ng, { k: 'loai', t: 'Nghiệp vụ', type: 'select', opts: [['kt', 'Trích quỹ khen thưởng (Nợ 421 / Có 3531)'], ['pl', 'Trích quỹ phúc lợi (Nợ 421 / Có 3532)'], ['dtpt', 'Trích quỹ đầu tư phát triển (Nợ 421 / Có 414)'], ['ct', 'Chia cổ tức, lợi nhuận phải trả (Nợ 421 / Có 3388)'], ['tra', 'Chi trả cổ tức, lợi nhuận (Nợ 3388 / Có 112)'], ['quy', 'Chi từ quỹ phúc lợi (Nợ 3532 / Có 111, 112)']], def: 'kt' }, { k: 'dt', t: 'Cổ đông, thành viên (nếu có)', type: 'partner' }, { k: 'tien', t: 'Số tiền', type: 'num', req: 1 }, { k: 'tt', t: 'Tiền chi (khi chi trả)', type: 'select', opts: [['112', 'Chuyển khoản (112)'], ['111', 'Tiền mặt (111)']], def: '112' }, F.dg],
    build: f => { const m = { kt: ['421', '3531'], pl: ['421', '3532'], dtpt: ['421', '414'], ct: ['421', '3388'], tra: ['3388', f.tt], quy: ['3532', f.tt] }[f.loai]; return [{ ng: f.ng, dg: f.dg, no: m[0], co: m[1], st: f.tien, dt: f.dt }]; } },
  { id: 'nhan_truoc', grp: 'Điều chỉnh cuối kỳ', name: 'Doanh thu nhận trước và phân bổ; ký quỹ, ký cược', pre: 'BC', icon: '📆',
    fields: [F.ng, { k: 'dt', t: 'Đối tượng', type: 'partner' }, { k: 'loai', t: 'Nghiệp vụ', type: 'select', opts: [['nhan', 'Nhận tiền trước nhiều kỳ (Nợ 112 / Có 3387)'], ['pb', 'Phân bổ doanh thu kỳ này (Nợ 3387 / Có 5113)'], ['kqg', 'Chi ký quỹ, ký cược (Nợ 244 / Có 112)'], ['kqt', 'Nhận lại ký quỹ, ký cược (Nợ 112 / Có 244)'], ['nkq', 'Nhận ký quỹ, ký cược của người khác (Nợ 112 / Có 344)']], def: 'nhan' }, { k: 'tien', t: 'Số tiền', type: 'num', req: 1 }, F.dg],
    build: f => { const m = { nhan: ['112', '3387'], pb: ['3387', '5113'], kqg: ['244', '112'], kqt: ['112', '244'], nkq: ['112', '344'] }[f.loai]; return [{ ng: f.ng, dg: f.dg, no: m[0], co: m[1], st: f.tien, dt: f.dt }]; } }
);
KT.tpl = id => KT.TPL.find(t => t.id === id);
KT.tplBuild = (id, f, ct) => { const t = KT.tpl(id); const ng = f.ng; const num = ct || KT.auto.nextCt(t.pre, +ng.slice(0, 4)); return t.build(f).map(l => Object.assign({ ct: num, nth: '' }, l)); };

})(typeof globalThis !== 'undefined' ? globalThis : window);
