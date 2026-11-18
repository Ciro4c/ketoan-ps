/* ===== NHÂN SỰ: lương, BHXH/BHYT/BHTN/KPCĐ, thuế TNCN ===== */
(function (G) {
'use strict';
const KT = G.KT, D = KT.d;
const H = KT.hr = {};

H.legalAt = (ym) => { const S = KT.S, lg = S.legal, d = D.eom(ym); const vung = S.company.vung || 2;
  return { luongCoSo: KT.at(lg.luongCoSo, d).v, luongTT: KT.at(lg.luongTT[vung], d).v, gt: KT.at(lg.giamTru, d), bieu: KT.at(lg.bieuThue, d).b, bh: lg.bh }; };
H.bieu = (income, brackets, scale) => {     // thuế lũy tiến từng phần
  let tax = 0, prev = 0; scale = scale || 1;
  for (const [cap, r] of brackets) { const top = cap == null ? Infinity : cap * scale; if (income > prev) tax += (Math.min(income, top) - prev) * r; if (income <= top) break; prev = top; }
  return KT.rnd(tax);
};
H.nptCount = (e, ym) => (e.npt || []).filter(n => (!n.tu || n.tu <= D.eom(ym)) && (!n.den || n.den >= D.bom(ym))).length;
H.activeIn = (e, ym) => (!e.vao || e.vao <= D.eom(ym)) && (!e.nghi || e.nghi >= D.bom(ym));

/** Tính lương một nhân viên trong tháng. rec: {ngayCong, thuong, ot, otMienThue, khauTruKhac, ung, khongDongBH, thuNhapKhac} */
H.legalVal = k => { const v = KT.S.legal[k]; return v != null ? v : KT.defaultLegal()[k]; };
H.anTruaCap = ym => ym >= '2026-07' ? H.legalVal('anTruaMienThue2') : H.legalVal('anTruaMienThue');
H.vlNguong = ym => ym >= '2026-07' ? H.legalVal('nguongKhauTruVangLai2') : H.legalVal('nguongKhauTruVangLai');
H.otMienToanBo = ym => ym >= String(H.legalVal('otMienToanBoTu')).slice(0, 7);
H.bhTnCap = ym => ym >= '2026-07' ? H.legalVal('bhTuNguyenTran2') : H.legalVal('bhTuNguyenTran');
/* ===== DANH MỤC PHÂN LOẠI THU NHẬP: khoản nào tính bảo hiểm, khoản nào chịu thuế TNCN =====
   bh   : tính vào tiền lương đóng BHXH, BHYT, BHTN (Luật BHXH 2024, NĐ 158/2025)
   thue : 'ct' chịu thuế | 'tran' miễn đến mức trần | 'mien' miễn toàn bộ (Luật Thuế TNCN 2025, NĐ 253/2026)
   Người dùng sửa mặc định ở màn hình Phân loại thu nhập (lưu ở company.pcDef); từng nhân viên vẫn chỉnh riêng được. */
H.PC = [
  { loai: 'chucvu', ten: 'Phụ cấp chức vụ, chức danh', bh: 1, thue: 'ct', nhom: 'Phụ cấp lương', note: 'Phụ cấp lương theo Luật BHXH 2024' },
  { loai: 'tn', ten: 'Phụ cấp trách nhiệm', bh: 1, thue: 'ct', nhom: 'Phụ cấp lương', note: 'Phụ cấp lương' },
  { loai: 'doc', ten: 'Phụ cấp nặng nhọc, độc hại, nguy hiểm', bh: 1, thue: 'ct', nhom: 'Phụ cấp lương', note: 'Phần chênh lệch cao hơn mức bình thường có thể được miễn thuế theo quy định; chọn Miễn đến mức nếu đủ điều kiện' },
  { loai: 'tnien', ten: 'Phụ cấp thâm niên', bh: 1, thue: 'ct', nhom: 'Phụ cấp lương', note: 'Phụ cấp lương' },
  { loai: 'kv', ten: 'Phụ cấp khu vực, thu hút, lưu động', bh: 1, thue: 'ct', nhom: 'Phụ cấp lương', note: 'Phụ cấp lương' },
  { loai: 'bs', ten: 'Khoản bổ sung khác ghi trong HĐLĐ', bh: 1, thue: 'ct', nhom: 'Khoản bổ sung', note: 'Chỉ tính BH khi có số tiền xác định, trả thường xuyên, ghi trong hợp đồng' },
  { loai: 'kn', ten: 'Phụ cấp kiêm nhiệm', bh: 0, thue: 'ct', nhom: 'Hỗ trợ, phụ cấp khác', note: 'Không tính BH nếu không phải phụ cấp lương ghi trong hợp đồng' },
  { loai: 'cc', ten: 'Phụ cấp chuyên cần', bh: 0, thue: 'ct', nhom: 'Hỗ trợ, phụ cấp khác', note: '' },
  { loai: 'xang', ten: 'Hỗ trợ xăng xe', bh: 0, thue: 'ct', nhom: 'Hỗ trợ, phụ cấp khác', note: 'Không tính BH; chịu thuế TNCN' },
  { loai: 'dt', ten: 'Hỗ trợ điện thoại', bh: 0, thue: 'ct', nhom: 'Hỗ trợ, phụ cấp khác', note: 'Không tính BH; chịu thuế TNCN' },
  { loai: 'dl', ten: 'Hỗ trợ đi lại', bh: 0, thue: 'ct', nhom: 'Hỗ trợ, phụ cấp khác', note: 'Không tính BH; chịu thuế TNCN' },
  { loai: 'nha', ten: 'Hỗ trợ tiền nhà ở', bh: 0, thue: 'ct', nhom: 'Hỗ trợ, phụ cấp khác', note: 'Không tính BH; chịu thuế TNCN' },
  { loai: 'gt', ten: 'Hỗ trợ giữ trẻ, nuôi con nhỏ', bh: 0, thue: 'ct', nhom: 'Hỗ trợ, phụ cấp khác', note: 'Không tính BH' },
  { loai: 'hh', ten: 'Hỗ trợ hiếu, hỷ, sinh nhật', bh: 0, thue: 'ct', nhom: 'Hỗ trợ, phụ cấp khác', note: 'Không tính BH' },
  { loai: 'tp', ten: 'Trang phục (tiền)', bh: 0, thue: 'tran', tran: 416667, nhom: 'Hỗ trợ, phụ cấp khác', note: 'Miễn thuế đến mức trần hằng năm (5 triệu đồng/năm quy ra tháng theo hướng dẫn cũ); cần đối chiếu quy định hiện hành' },
  { loai: 'ctp', ten: 'Công tác phí theo quy chế', bh: 0, thue: 'mien', nhom: 'Hỗ trợ, phụ cấp khác', note: 'Miễn thuế khi chi đúng quy chế, có chứng từ' }
];
/** Phân loại cố định của các khoản có ô riêng trong bảng lương (không sửa được) */
H.FIXED = [
  { ten: 'Lương theo hợp đồng', bh: 1, thue: 'ct', note: 'Tính BH theo mức ghi trong hợp đồng' },
  { ten: 'Phụ cấp tính BH (cột trong danh mục nhân viên)', bh: 1, thue: 'ct', note: '' },
  { ten: 'Ăn giữa ca, ăn trưa', bh: 0, thue: 'tran', note: 'Miễn thuế đến mức trần theo ngày hiệu lực (xem tham số)' },
  { ten: 'Thưởng', bh: 0, thue: 'ct', note: 'Không tính BH; chịu thuế TNCN. Thưởng sáng kiến có điều kiện riêng' },
  { ten: 'Làm thêm giờ, làm đêm', bh: 0, thue: 'mien', note: 'Từ kỳ tính thuế 2026 miễn thuế phần theo luật; phần vượt chịu thuế' },
  { ten: 'Thu nhập khác chịu thuế', bh: 0, thue: 'ct', note: '' },
  { ten: 'Thu nhập miễn thuế khác (ngày phép chưa nghỉ, trợ cấp thôi việc)', bh: 0, thue: 'mien', note: '' }
];
/** Danh mục đã áp dụng thay đổi mặc định của người dùng */
H.pcCat = () => { const o = (KT.S.company.pcDef) || {}; return H.PC.map(x => Object.assign({}, x, o[x.loai] || {})); };
/** Bảng phân tích thu nhập từng nhân viên theo từng khoản, có tổng thu nhập tính BH và thu nhập chịu thuế */
H.breakdown = ym => {
  const m = H.month(ym), cat = H.pcCat();
  const cols = [{ k: 'luongCB', ten: 'Lương theo ngày công', bh: 1, thue: 'ct' }, { k: 'pcbh', ten: 'Phụ cấp tính BH (cột danh mục)', bh: 1, thue: 'ct' }, { k: 'anTrua', ten: 'Ăn trưa', bh: 0, thue: 'tran' }, ...cat.map(x => ({ k: 'k:' + x.loai, ten: x.ten, bh: x.bh, thue: x.thue, loai: x.loai })), { k: 'khac', ten: 'Khoản khác (ngoài danh mục)', bh: 0, thue: 'ct' }, { k: 'thuong', ten: 'Thưởng', bh: 0, thue: 'ct' }, { k: 'ot', ten: 'Làm thêm giờ', bh: 0, thue: 'mien' }, { k: 'tnk', ten: 'Thu nhập khác', bh: 0, thue: 'ct' }];
  const rows = m.rows.map(x => { const v = {}; const c = x.c; v.luongCB = c.luongCB; v.pcbh = c.phuCapLuong; v.anTrua = c.anTrua + c.phuCapKhac;
    for (const q of c.khoan) { const key = q.loai && cat.some(y => y.loai === q.loai) ? 'k:' + q.loai : 'khac'; v[key] = (v[key] || 0) + q.amt; }
    v.thuong = c.thuong; v.ot = c.ot; v.tnk = KT.num(x.rec.thuNhapKhac) + c.mienKhac; return { e: x.e, c, v }; });
  return { m, cols, rows };
};
/** Các khoản phụ cấp, hỗ trợ khai báo theo nhân viên: {ten, loai, so, bh(tính vào lương đóng BH), thue: ct|mien|tran, tran, codinh(không tính theo ngày công), tu, den} */
H.khoanActive = (e, ym) => (e.khoan || []).filter(k => (!k.tu || k.tu <= D.eom(ym)) && (!k.den || k.den >= D.bom(ym)));
/** Tính lương một nhân viên trong tháng. rec: {ngayCong, thuong, ot, otMienThue, mienKhac, bhTuNguyen, khauTruKhac, ung, khongDongBH, thuNhapKhac} */
H.calcEmp = (e, ym, rec, std) => {
  const lg = H.legalAt(ym); rec = rec || {}; const r = {};
  std = std || 26; const cong = rec.ngayCong != null && rec.ngayCong !== '' ? KT.num(rec.ngayCong) : std;
  const k = Math.min(1, cong / std);
  r.luongCB = KT.rnd(KT.num(e.luongCB) * k);
  r.phuCapLuong = KT.rnd(KT.num(e.phuCap) * k);                // phụ cấp tính vào lương đóng BH
  r.anTrua = KT.rnd(KT.num(e.anTrua) * k); r.phuCapKhac = KT.rnd(KT.num(e.phuCapKhac) * k);
  r.khoan = []; let khTong = 0, khMien = 0, khBHfull = 0;
  for (const x of H.khoanActive(e, ym)) {
    const full = KT.num(x.so), amt = x.codinh ? full : KT.rnd(full * k); let mien = 0;
    if (x.thue === 'mien') mien = amt; else if (x.thue === 'tran') mien = Math.min(amt, KT.num(x.tran));
    r.khoan.push({ ten: x.ten, loai: x.loai, amt, bh: !!x.bh, mien }); khTong += amt; khMien += mien; if (x.bh) khBHfull += full;
  }
  r.khoanTong = khTong;
  r.thuong = KT.num(rec.thuong); r.ot = KT.num(rec.ot);
  const otSet = rec.otMienThue !== undefined && rec.otMienThue !== '' && rec.otMienThue != null;
  r.otMien = otSet ? Math.min(KT.num(rec.otMienThue), r.ot) : (H.otMienToanBo(ym) ? r.ot : 0);
  r.mienKhac = KT.num(rec.mienKhac);                            // thu nhập khác được miễn thuế (ngày phép chưa nghỉ, trợ cấp thôi việc…)
  r.tong = r.luongCB + r.phuCapLuong + r.anTrua + r.phuCapKhac + khTong + r.thuong + r.ot + KT.num(rec.thuNhapKhac) + r.mienKhac;
  // đóng BH: lương + phụ cấp lương + khoản bổ sung tính BH; không gồm thưởng, ăn ca, xăng xe, điện thoại… (khai báo ở bảng khoản)
  const bhOn = e.thamGiaBH !== false && !rec.khongDongBH && e.hdlLoai !== 'thoivu' && e.loaiHD !== 'thoivu' && e.loaiHD !== 'thuviec';
  const base0 = KT.num(e.luongDongBH) || (KT.num(e.luongCB) + KT.num(e.phuCap) + khBHfull);
  const capBH = lg.luongCoSo * lg.bh.capMul, capTN = lg.luongTT * lg.bh.capMul;
  const san = lg.luongTT * (e.quaDaoTao ? 1 + H.legalVal('congQuaDaoTao') : 1);
  r.san = san; r.capBH = capBH; r.capTN = capTN; r.base0 = base0;
  r.baseBH = bhOn ? Math.min(Math.max(base0, san), capBH) : 0;
  r.baseTN = bhOn && e.dongBHTN !== false ? Math.min(Math.max(base0, san), capTN) : 0;
  const n = lg.bh.nld, s = lg.bh.nsd;
  r.nld = { bhxh: KT.rnd(r.baseBH * n.bhxh), bhyt: KT.rnd(r.baseBH * n.bhyt), bhtn: KT.rnd(r.baseTN * n.bhtn) };
  r.nsd = { bhxh: KT.rnd(r.baseBH * s.bhxh), bhyt: KT.rnd(r.baseBH * s.bhyt), bhtn: KT.rnd(r.baseTN * s.bhtn) };
  r.kpcd = bhOn ? KT.rnd(r.baseBH * lg.bh.kpcd) : 0;
  r.bhNLD = r.nld.bhxh + r.nld.bhyt + r.nld.bhtn; r.bhNSD = r.nsd.bhxh + r.nsd.bhyt + r.nsd.bhtn;
  // thuế TNCN
  r.anTruaMien = Math.min(r.anTrua, H.anTruaCap(ym));
  r.mienThue = r.anTruaMien + r.otMien + khMien + r.mienKhac;
  r.tnct = r.tong - r.mienThue;
  r.giamTruGC = lg.gt.ban + lg.gt.pt * H.nptCount(e, ym);
  r.bhTN = Math.min(KT.num(rec.bhTuNguyen), H.bhTnCap(ym));     // bảo hiểm hưu trí bổ sung / nhân thọ được trừ (có trần)
  const ktBieu = e.thueKieu !== 'vanglai' && e.thueKieu !== 'khongkhautru';
  r.tntt = ktBieu ? Math.max(0, r.tnct - r.bhNLD - r.bhTN - r.giamTruGC) : 0;
  if (e.thueKieu === 'vanglai') r.tncn = r.tnct >= H.vlNguong(ym) ? KT.rnd(r.tnct * H.legalVal('thueKhauTruVangLai')) : 0;
  else if (e.thueKieu === 'khongkhautru') r.tncn = 0;
  else r.tncn = H.bieu(r.tntt, lg.bieu);
  r.ung = KT.num(rec.ung); r.khauTruKhac = KT.num(rec.khauTruKhac);
  r.thucLinh = r.tong - r.bhNLD - r.tncn - r.ung - r.khauTruKhac;
  r.chiPhiDN = r.tong + r.bhNSD + r.kpcd;
  r.cong = cong; return r;
};
H.month = (ym) => {
  const S = KT.S, pr = S.payroll[ym] || { rows: {}, std: D.workdays(ym, true) - 0 }; const std = KT.num(pr.std) || 26;
  const rows = []; const T = { tong: 0, bhNLD: 0, bhNSD: 0, kpcd: 0, tncn: 0, thucLinh: 0, chiPhiDN: 0, mienThue: 0, tnct: 0, tntt: 0 };
  for (const e of S.employees) { if (!H.activeIn(e, ym)) continue; const rec = pr.rows[e.code] || {}; const c = H.calcEmp(e, ym, rec, std); rows.push({ e, c, rec }); for (const k of Object.keys(T)) T[k] += c[k]; }
  return { ym, std, rows, T, posted: !!pr.posted };
};
H.bhMonth = (ym) => { const m = H.month(ym); let nl = 0, ns = 0, kp = 0; for (const r of m.rows) { nl += r.c.bhNLD; ns += r.c.bhNSD; kp += r.c.kpcd; } return { nld: nl, nsd: ns, kpcd: kp, total: nl + ns }; };
/** Thuế TNCN khấu trừ trong kỳ (từ bảng lương) */
H.pitPeriod = (from, to) => { let withheld = 0, income = 0, n = 0; for (const per of KT.tax.periods('thang', from, to)) { const m = H.month(per.key); if (m.rows.length) { withheld += m.T.tncn; income += m.T.tong; n = Math.max(n, m.rows.length); } } return { withheld, income, n }; };
/** Quyết toán TNCN năm (theo lũy tiến năm) */
H.qtt = (year) => {
  const out = []; const lgEnd = H.legalAt(year + '-12'); const sc = 12;
  for (const e of KT.S.employees) {
    let tong = 0, mien = 0, bh = 0, daKT = 0, gc = 0, months = 0, tnct = 0, thucLinh = 0;
    for (let m = 1; m <= 12; m++) { const ym = year + '-' + String(m).padStart(2, '0'); if (!H.activeIn(e, ym)) continue; const rec = (KT.S.payroll[ym] || { rows: {} }).rows[e.code] || {}; const std = KT.num((KT.S.payroll[ym] || {}).std) || 26; const c = H.calcEmp(e, ym, rec, std); months++; tong += c.tong; mien += c.mienThue; bh += c.bhNLD + c.bhTN; daKT += c.tncn; gc += c.giamTruGC; }
    if (!months) continue;
    tnct = tong - mien; const tntt = Math.max(0, tnct - bh - gc);
    const lg = H.legalAt(year + '-12'); const thue = (e.thueKieu === 'vanglai' || e.thueKieu === 'khongkhautru') ? daKT : H.bieu(tntt, lg.bieu, 12);
    out.push({ e, months, tong, mien, tnct, bh, gc, tntt, thue, daKT, chenh: thue - daKT });
  }
  return out;
};
/** Danh sách lao động tham gia BHXH (D02-LT) + tăng/giảm so với tháng trước */
H.d02 = (ym) => {
  const cur = H.month(ym), prev = H.month(D.addMonths(ym, -1)); const pm = new Map(prev.rows.map(r => [r.e.code, r]));
  const rows = cur.rows.filter(r => r.c.baseBH > 0).map((r, i) => {
    const p = pm.get(r.e.code); let ghi = '';
    if (!p || p.c.baseBH <= 0) ghi = 'Tăng lao động'; else if (Math.abs(p.c.baseBH - r.c.baseBH) > 0.5) ghi = 'Điều chỉnh mức đóng (' + KT.f(p.c.baseBH) + ' → ' + KT.f(r.c.baseBH) + ')';
    return { stt: i + 1, ma: r.e.code, ten: r.e.name, so: r.e.soBHXH || '', cccd: r.e.cccd || '', chucDanh: r.e.chucDanh || '', baseBH: r.c.baseBH, baseTN: r.c.baseTN, nld: r.c.bhNLD, nsd: r.c.bhNSD, ghi };
  });
  const giam = []; for (const r of prev.rows) if (r.c.baseBH > 0 && !cur.rows.find(x => x.e.code === r.e.code && x.c.baseBH > 0)) giam.push({ ma: r.e.code, ten: r.e.name, so: r.e.soBHXH || '', ghi: 'Giảm lao động' });
  return { ym, rows, giam, T: cur.T };
};

/* ---------- bút toán tự sinh ---------- */
const A = KT.auto = {};
const lastDay = ym => D.eom(ym);
A.tagOf = (kind, key) => 'auto-' + kind + ':' + key;
A.lines = (tag) => KT.S.journal.filter(l => l.tag === tag);
/** thay thế toàn bộ dòng tự sinh của tag bằng `lines` mới (xem trước khi áp dụng) */
A.apply = (tag, lines) => {
  KT.snapshot();
  KT.S.journal = KT.S.journal.filter(l => l.tag !== tag);
  lines.forEach(l => { l.tag = tag; l.id = KT.newId(); l.mod = D.today(); KT.S.journal.push(l); });
  KT.touch();
};
A.remove = tag => { KT.snapshot(); KT.S.journal = KT.S.journal.filter(l => l.tag !== tag); KT.touch(); };
A.exists = tag => KT.S.journal.some(l => l.tag === tag);
const ln = (ct, ng, no, co, st, dg, x) => Object.assign({ ct, ng, no, co, st: KT.rnd(st), dg, nth: 'Tự động' }, x || {});
const nextCt = (p, y) => { const mx = KT.S.journal.reduce((m, l) => { const r = String(l.ct || '').match(new RegExp('^' + p + String(y).slice(2) + '-(\\d+)')); return r ? Math.max(m, +r[1]) : m; }, 0); return p + String(y).slice(2) + '-' + String(mx + 1).padStart(4, '0'); };
A.nextCt = nextCt;

/** Lương + BH + TNCN */
A.payroll = (ym) => {
  const m = H.month(ym); const d = lastDay(ym); const y = +ym.slice(0, 4); const ct = A.tagOf('bl', ym); const out = [];
  const num = (ex) => ex; const cn = 'BL' + String(y).slice(2) + '-' + ym.slice(5);   // BL26-03 : số CT theo tháng
  for (const r of m.rows) {
    const e = r.e, c = r.c, cost = e.tkChiPhi || '642';
    const lab = ' – ' + e.name + ' T' + ym.slice(5) + '/' + y; const dh = e.dh || '';
    const thuongQuy = r.rec && r.rec.thuongNguon === 'quy';       // thưởng chi từ quỹ khen thưởng (3531) thay vì chi phí
    out.push(ln(cn, d, cost, '334', c.tong - (thuongQuy ? c.thuong : 0), 'Tiền lương, phụ cấp' + (c.thuong && !thuongQuy ? ' và thưởng' : '') + lab, { dt: e.code, dh }));
    if (thuongQuy && c.thuong) out.push(ln(cn, d, '3531', '334', c.thuong, 'Thưởng từ quỹ khen thưởng' + lab, { dt: e.code }));
    if (c.bhNSD) { out.push(ln(cn, d, cost, '3383', c.nsd.bhxh, 'BHXH 17,5% NSDLĐ' + lab, { dt: '', dh })); out.push(ln(cn, d, cost, '3384', c.nsd.bhyt, 'BHYT 3% NSDLĐ' + lab, { dh })); if (c.nsd.bhtn) out.push(ln(cn, d, cost, '3386', c.nsd.bhtn, 'BHTN 1% NSDLĐ' + lab, { dh })); }
    if (c.kpcd) out.push(ln(cn, d, cost, '3382', c.kpcd, 'Kinh phí công đoàn 2%' + lab, { dh }));
    if (c.bhNLD) { out.push(ln(cn, d, '334', '3383', c.nld.bhxh, 'BHXH 8% trừ lương' + lab, { dt: e.code })); out.push(ln(cn, d, '334', '3384', c.nld.bhyt, 'BHYT 1,5% trừ lương' + lab, { dt: e.code })); if (c.nld.bhtn) out.push(ln(cn, d, '334', '3386', c.nld.bhtn, 'BHTN 1% trừ lương' + lab, { dt: e.code })); }
    if (c.tncn) out.push(ln(cn, d, '334', '3335', c.tncn, 'Khấu trừ thuế TNCN' + lab, { dt: e.code }));
  }
  return { tag: ct, lines: out.filter(x => x.st > 0), count: m.rows.length };
};
/** Khấu hao TSCĐ */
A.depreciation = (ym) => {
  const out = []; const cn = 'KH' + ym.slice(2, 4) + '-' + ym.slice(5);
  for (const a of KT.S.assets) {
    const ng = KT.num(a.nguyenGia), n = Math.max(1, +a.thang || 1), kh = ng / n, start = a.batDau ? D.ym(a.batDau) : ''; if (!start) continue;
    const from = a.khauHaoTuThangSau === false ? start : D.addMonths(start, 1);   // mặc định: từ tháng kế tiếp tháng đưa vào sử dụng
    const idx = D.monthsBetween(from, ym); if (idx < 0 || idx >= n) continue;
    if (a.thanhLy && D.ym(a.thanhLy) < ym) continue;
    const luyKe = kh * idx; let amt = idx === n - 1 ? ng - luyKe : kh; amt = KT.rnd(amt); if (!amt) continue;
    const co = a.nhom === '213' ? '2143' : '2141';
    out.push(ln(cn, lastDay(ym), a.tkChiPhi || '642', co, amt, 'Khấu hao ' + a.name + ' T' + ym.slice(5) + '/' + ym.slice(0, 4), { ts: a.code, dh: a.dh || '' }));
  }
  return { tag: A.tagOf('kh', ym), lines: out };
};
/** Phân bổ chi phí chờ phân bổ / CCDC */
A.prepaid = (ym) => {
  const out = []; const cn = 'PB' + ym.slice(2, 4) + '-' + ym.slice(5);
  for (const p of KT.S.prepaids) {
    const tot = KT.num(p.gia), n = Math.max(1, +p.thang || 1), start = D.ym(p.tu || ''); if (!p.tu) continue;
    const idx = D.monthsBetween(start, ym); if (idx < 0 || idx >= n) continue;
    const amt = KT.rnd(idx === n - 1 ? tot - KT.rnd(tot / n) * idx : tot / n); if (!amt) continue;
    out.push(ln(cn, lastDay(ym), p.tkChiPhi || '642', '242', amt, 'Phân bổ ' + p.name + ' T' + ym.slice(5) + '/' + ym.slice(0, 4), { dh: p.dh || '' }));
  }
  return { tag: A.tagOf('pb', ym), lines: out };
};
/** Kết chuyển chi phí SX vào 154 theo đơn hàng */
A.production = (ym) => {
  const L = KT.compute(); const from = D.bom(ym), to = lastDay(ym); const out = []; const cn = 'SX' + ym.slice(2, 4) + '-' + ym.slice(5);
  const direct = new Map(); const un = { '621': 0, '622': 0, '627': 0 };
  // bỏ dòng tự sinh SX của chính kỳ để tính lại
  const skip = A.tagOf('sx', ym);
  for (const a of ['621', '622', '627']) for (const e of (L.byAcc.get(a) || [])) { const l = e.l; if (e.s !== 'N' || l.date < from || l.date > to || l.tag === skip) continue; if (l.dh) { const x = direct.get(l.dh) || { '621': 0, '622': 0, '627': 0 }; x[a] += l.amt; direct.set(l.dh, x); } else un[a] += l.amt; }
  // trừ các khoản đã kết chuyển bằng tay (Có 6xx)
  for (const a of ['621', '622', '627']) for (const e of (L.byAcc.get(a) || [])) { const l = e.l; if (e.s !== 'C' || l.date < from || l.date > to || l.tag === skip) continue; if (l.dh && direct.has(l.dh)) direct.get(l.dh)[a] -= l.amt; else un[a] -= l.amt; }
  const sxOrders = KT.S.orders.filter(o => o.loai === 'SX' && direct.has(o.code)); const keys = sxOrders.map(o => o.code);
  const totDirect = keys.reduce((s, k) => s + direct.get(k)['621'] + direct.get(k)['622'], 0) || keys.length;
  for (const k of keys) {
    const x = direct.get(k); const w = totDirect === keys.length && !keys.reduce((s, q) => s + direct.get(q)['621'] + direct.get(q)['622'], 0) ? 1 / keys.length : (x['621'] + x['622']) / totDirect;
    for (const a of ['621', '622', '627']) { const amt = x[a] + un[a] * w; if (Math.round(amt) > 0) out.push(ln(cn, to, '154', a, amt, 'Kết chuyển ' + a + ' vào giá thành ' + k + ' T' + ym.slice(5) + '/' + ym.slice(0, 4), { dh: k })); }
  }
  return { tag: skip, lines: out, note: keys.length ? '' : 'Chưa có đơn hàng loại "Sản xuất" phát sinh chi phí 621/622/627 trong kỳ.' };
};
/** Kết chuyển cuối kỳ xác định kết quả (911) */
A.closing = (from, to, label) => {
  const L = KT.compute(); const out = []; const key = to; const cn = 'KC' + to.slice(2, 4) + '-' + to.slice(5, 7);
  const net = (a, side) => { const m = L.mov(a, from, to, { noClose: true }); return side === 'C' ? m.c - m.n : m.n - m.c; };
  const stage = (no, co, amt, dg) => { if (KT.rnd(amt) !== 0) out.push(ln(cn, to, no, co, amt, dg)); };
  const r521 = net('521', 'D'); stage('511', '521', r521, 'Kết chuyển giảm trừ doanh thu ' + label);
  const r511 = net('511', 'C') - r521; stage('511', '911', r511, 'Kết chuyển doanh thu thuần ' + label);
  stage('515', '911', net('515', 'C'), 'Kết chuyển doanh thu tài chính ' + label); stage('711', '911', net('711', 'C'), 'Kết chuyển thu nhập khác ' + label);
  for (const a of ['632', '635', '641', '642', '811', '821']) stage('911', a, net(a, 'D'), 'Kết chuyển ' + KT.acc.name(a).toLowerCase() + ' ' + label);
  const pnl = (net('511', 'C') - r521) + net('515', 'C') + net('711', 'C') - ['632', '635', '641', '642', '811', '821'].reduce((s, a) => s + net(a, 'D'), 0);
  if (pnl > 0) stage('911', '421', pnl, 'Kết chuyển lãi ' + label); else if (pnl < 0) stage('421', '911', -pnl, 'Kết chuyển lỗ ' + label);
  return { tag: A.tagOf('kc', from + '_' + to), lines: out, pnl };
};
/** Khấu trừ thuế GTGT: Nợ 3331 / Có 133 */
A.vatOffset = (perKey) => {
  const s = KT.tax.vatSeries(KT.compute().last || D.today()); const r = s.find(x => x.per.key === perKey); const tag = A.tagOf('gtgt', perKey); if (!r) return { tag, lines: [] };
  const L = KT.compute(); const to = r.per.to; const old = A.lines(tag); const oldBy = a => old.filter(l => l.co === a).reduce((x, l) => x + l.st, 0);
  const gl3331 = -L.bal('3331', to) + old.reduce((x, l) => x + l.st, 0);
  const b1 = L.bal('1331', to) + oldBy('1331'), b2 = L.bal('1332', to) + oldBy('1332'), b0 = L.bal('133', to) - L.bal('1331', to) - L.bal('1332', to) + oldBy('133');
  let rest = Math.max(0, Math.min(gl3331, Math.max(0, b1) + Math.max(0, b2) + Math.max(0, b0)));
  const lines = []; const cn = 'KT' + to.slice(2, 4) + '-' + to.slice(5, 7) + 'G';
  for (const [acc, av] of [['1331', b1], ['1332', b2], ['133', b0]]) { const t = Math.min(rest, Math.max(0, av)); if (t > 0) { lines.push(ln(cn, to, '33311', acc, t, 'Khấu trừ thuế GTGT ' + r.per.label)); rest -= t; } }
  return { tag, lines };
};
/** Chi phí thuế TNDN hiện hành */
A.citExpense = (year) => {
  const c = KT.tax.cit(year); const tag = A.tagOf('tndn', String(year)); const amt = c.v.C12; const [, y1] = D.yRange(year);
  return { tag, lines: amt > 0 ? [ln('KT' + String(year).slice(2) + '-TNDN', y1, '8211', '3334', amt, 'Chi phí thuế TNDN hiện hành năm ' + year)] : [] };
};

})(typeof globalThis !== 'undefined' ? globalThis : window);
