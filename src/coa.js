/* ===== Hệ thống tài khoản (TT 99/2025/TT-BTC), mã LCTT, loại chứng từ ===== */
(function (G) {
'use strict';
const KT = G.KT;

// [số hiệu, tên, loại, cờ]  loại: A tài sản, L nợ phải trả, E vốn CSH, R doanh thu, X chi phí, P xác định KQ, C điều chỉnh giảm TS (dư Có)
// cờ: p = theo dõi đối tượng (KH/NCC/NV/chủ sở hữu…), i = theo dõi vật tư/hàng hóa (SL)
const ACC = [
  ['111', 'Tiền mặt', 'A'], ['1111', 'Tiền Việt Nam', 'A'],
  ['112', 'Tiền gửi không kỳ hạn', 'A'], ['1121', 'Tiền Việt Nam', 'A'],
  ['113', 'Tiền đang chuyển', 'A'],
  ['121', 'Chứng khoán kinh doanh', 'A'],
  ['128', 'Đầu tư nắm giữ đến ngày đáo hạn', 'A'], ['1281', 'Tiền gửi có kỳ hạn', 'A'], ['1282', 'Trái phiếu', 'A'], ['1283', 'Cho vay', 'A'], ['1288', 'Các khoản đầu tư khác nắm giữ đến ngày đáo hạn', 'A'],
  ['131', 'Phải thu của khách hàng', 'A', 'p'],
  ['133', 'Thuế GTGT được khấu trừ', 'A'], ['1331', 'Thuế GTGT được khấu trừ của hàng hóa, dịch vụ', 'A'], ['1332', 'Thuế GTGT được khấu trừ của TSCĐ', 'A'],
  ['136', 'Phải thu nội bộ', 'A', 'p'],
  ['138', 'Phải thu khác', 'A', 'p'], ['1381', 'Tài sản thiếu chờ xử lý', 'A'], ['1388', 'Phải thu khác', 'A', 'p'],
  ['141', 'Tạm ứng', 'A', 'p'],
  ['151', 'Hàng mua đang đi đường', 'A'],
  ['152', 'Nguyên liệu, vật liệu', 'A', 'i'],
  ['153', 'Công cụ, dụng cụ', 'A', 'i'], ['1531', 'Công cụ, dụng cụ', 'A', 'i'], ['1532', 'Bao bì luân chuyển', 'A', 'i'],
  ['154', 'Chi phí sản xuất, kinh doanh dở dang', 'A'],
  ['155', 'Sản phẩm', 'A', 'i'], ['1551', 'Thành phẩm nhập kho', 'A', 'i'],
  ['156', 'Hàng hóa', 'A', 'i'], ['1561', 'Giá mua hàng hóa', 'A', 'i'], ['1562', 'Chi phí thu mua hàng hóa', 'A', 'i'],
  ['157', 'Hàng gửi đi bán', 'A', 'i'],
  ['158', 'Nguyên liệu, vật tư tại kho bảo thuế', 'A', 'i'],
  ['211', 'TSCĐ hữu hình', 'A'], ['2111', 'Nhà cửa, vật kiến trúc', 'A'], ['2112', 'Máy móc, thiết bị', 'A'], ['2113', 'Phương tiện vận tải, truyền dẫn', 'A'], ['2114', 'Thiết bị, dụng cụ quản lý', 'A'], ['2118', 'TSCĐ hữu hình khác', 'A'],
  ['212', 'TSCĐ thuê tài chính', 'A'],
  ['213', 'TSCĐ vô hình', 'A'], ['2131', 'Quyền sử dụng đất', 'A'], ['2134', 'Phần mềm máy tính', 'A'], ['2138', 'TSCĐ vô hình khác', 'A'],
  ['214', 'Hao mòn tài sản cố định', 'C'], ['2141', 'Hao mòn TSCĐ hữu hình', 'C'], ['2142', 'Hao mòn TSCĐ thuê tài chính', 'C'], ['2143', 'Hao mòn TSCĐ vô hình', 'C'], ['2147', 'Hao mòn bất động sản đầu tư', 'C'],
  ['215', 'Tài sản sinh học', 'A'],
  ['217', 'Bất động sản đầu tư', 'A'],
  ['221', 'Đầu tư vào công ty con', 'A'], ['222', 'Đầu tư vào công ty liên doanh, liên kết', 'A'], ['228', 'Đầu tư khác', 'A'],
  ['229', 'Dự phòng tổn thất tài sản', 'C'], ['2291', 'Dự phòng giảm giá chứng khoán kinh doanh', 'C'], ['2292', 'Dự phòng tổn thất đầu tư vào đơn vị khác', 'C'], ['2293', 'Dự phòng phải thu khó đòi', 'C'], ['2294', 'Dự phòng giảm giá hàng tồn kho', 'C'],
  ['241', 'Xây dựng cơ bản dở dang', 'A'], ['2411', 'Mua sắm TSCĐ', 'A'], ['2412', 'Xây dựng cơ bản', 'A'], ['2413', 'Sửa chữa lớn TSCĐ', 'A'],
  ['242', 'Chi phí chờ phân bổ', 'A'],
  ['243', 'Tài sản thuế TNDN hoãn lại', 'A'],
  ['244', 'Ký quỹ, ký cược', 'A', 'p'],
  ['331', 'Phải trả người bán', 'L', 'p'],
  ['332', 'Phải trả cổ tức, lợi nhuận', 'L', 'p'],
  ['333', 'Thuế và các khoản phải nộp Nhà nước', 'L'],
  ['3331', 'Thuế giá trị gia tăng phải nộp', 'L'], ['33311', 'Thuế GTGT đầu ra', 'L'], ['33312', 'Thuế GTGT hàng nhập khẩu', 'L'],
  ['3332', 'Thuế tiêu thụ đặc biệt', 'L'], ['3333', 'Thuế xuất, nhập khẩu', 'L'], ['3334', 'Thuế thu nhập doanh nghiệp', 'L'], ['3335', 'Thuế thu nhập cá nhân', 'L'],
  ['3336', 'Thuế tài nguyên', 'L'], ['3337', 'Thuế nhà đất, tiền thuê đất', 'L'], ['3338', 'Các loại thuế khác (môn bài…)', 'L'], ['33381', 'Thuế bảo vệ môi trường', 'L'], ['33382', 'Các loại thuế khác', 'L'], ['3339', 'Phí, lệ phí và các khoản phải nộp khác', 'L'],
  ['334', 'Phải trả người lao động', 'L', 'p'], ['3341', 'Phải trả công nhân viên', 'L', 'p'], ['3348', 'Phải trả người lao động khác', 'L', 'p'],
  ['335', 'Chi phí phải trả', 'L'],
  ['336', 'Phải trả nội bộ', 'L', 'p'],
  ['337', 'Thanh toán theo tiến độ hợp đồng xây dựng', 'L'],
  ['338', 'Phải trả, phải nộp khác', 'L', 'p'], ['3381', 'Tài sản thừa chờ giải quyết', 'L'], ['3382', 'Kinh phí công đoàn', 'L'], ['3383', 'Bảo hiểm xã hội', 'L'], ['3384', 'Bảo hiểm y tế', 'L'], ['3386', 'Bảo hiểm thất nghiệp', 'L'], ['3387', 'Doanh thu chưa thực hiện', 'L'], ['3388', 'Phải trả, phải nộp khác', 'L', 'p'],
  ['341', 'Vay và nợ thuê tài chính', 'L', 'p'], ['3411', 'Các khoản đi vay', 'L', 'p'], ['34111', 'Vay ngắn hạn (TK chi tiết của DN)', 'L', 'p'], ['34112', 'Vay dài hạn (TK chi tiết của DN)', 'L', 'p'], ['3412', 'Nợ thuê tài chính', 'L', 'p'],
  ['343', 'Trái phiếu phát hành', 'L'],
  ['344', 'Nhận ký quỹ, ký cược', 'L', 'p'],
  ['347', 'Thuế TNDN hoãn lại phải trả', 'L'],
  ['352', 'Dự phòng phải trả', 'L'],
  ['353', 'Quỹ khen thưởng, phúc lợi', 'L'], ['3531', 'Quỹ khen thưởng', 'L'], ['3532', 'Quỹ phúc lợi', 'L'],
  ['356', 'Quỹ phát triển khoa học và công nghệ', 'L'],
  ['357', 'Quỹ bình ổn giá', 'L'],
  ['411', 'Vốn đầu tư của chủ sở hữu', 'E', 'p'], ['4111', 'Vốn góp của chủ sở hữu', 'E', 'p'], ['4112', 'Thặng dư vốn cổ phần', 'E'], ['4118', 'Vốn khác', 'E'],
  ['412', 'Chênh lệch đánh giá lại tài sản', 'E'], ['413', 'Chênh lệch tỷ giá hối đoái', 'E'], ['414', 'Quỹ đầu tư phát triển', 'E'], ['418', 'Các quỹ khác thuộc vốn chủ sở hữu', 'E'],
  ['419', 'Cổ phiếu mua lại', 'C'],
  ['421', 'Lợi nhuận sau thuế chưa phân phối', 'E'], ['4211', 'LNST chưa phân phối năm trước', 'E'], ['4212', 'LNST chưa phân phối năm nay', 'E'],
  ['511', 'Doanh thu bán hàng và cung cấp dịch vụ', 'R'], ['5111', 'Doanh thu bán hàng hóa', 'R'], ['5112', 'Doanh thu bán thành phẩm', 'R'], ['5113', 'Doanh thu cung cấp dịch vụ', 'R'], ['5118', 'Doanh thu khác', 'R'],
  ['515', 'Doanh thu hoạt động tài chính', 'R'],
  ['521', 'Các khoản giảm trừ doanh thu', 'X'], ['5211', 'Chiết khấu thương mại', 'X'], ['5212', 'Hàng bán bị trả lại', 'X'], ['5213', 'Giảm giá hàng bán', 'X'],
  ['621', 'Chi phí nguyên liệu, vật liệu trực tiếp', 'X'],
  ['622', 'Chi phí nhân công trực tiếp', 'X'],
  ['623', 'Chi phí sử dụng máy thi công', 'X'],
  ['627', 'Chi phí sản xuất chung', 'X'], ['6271', 'Chi phí nhân viên phân xưởng', 'X'], ['6272', 'Chi phí vật liệu', 'X'], ['6273', 'Chi phí dụng cụ sản xuất', 'X'], ['6274', 'Chi phí khấu hao TSCĐ', 'X'], ['6277', 'Chi phí dịch vụ mua ngoài', 'X'], ['6278', 'Chi phí bằng tiền khác', 'X'],
  ['632', 'Giá vốn hàng bán', 'X'],
  ['635', 'Chi phí tài chính', 'X'], ['6351', 'Chi phí lãi vay', 'X'],
  ['641', 'Chi phí bán hàng', 'X'], ['6411', 'Chi phí nhân viên', 'X'], ['6412', 'Chi phí vật liệu, bao bì', 'X'], ['6413', 'Chi phí dụng cụ, đồ dùng', 'X'], ['6414', 'Chi phí khấu hao TSCĐ', 'X'], ['6417', 'Chi phí dịch vụ mua ngoài', 'X'], ['6418', 'Chi phí bằng tiền khác', 'X'],
  ['642', 'Chi phí quản lý doanh nghiệp', 'X'], ['6421', 'Chi phí nhân viên quản lý', 'X'], ['6422', 'Chi phí vật liệu quản lý', 'X'], ['6423', 'Chi phí đồ dùng văn phòng', 'X'], ['6424', 'Chi phí khấu hao TSCĐ', 'X'], ['6425', 'Thuế, phí và lệ phí', 'X'], ['6426', 'Chi phí dự phòng', 'X'], ['6427', 'Chi phí dịch vụ mua ngoài', 'X'], ['6428', 'Chi phí bằng tiền khác', 'X'],
  ['711', 'Thu nhập khác', 'R'],
  ['811', 'Chi phí khác', 'X'],
  ['821', 'Chi phí thuế thu nhập doanh nghiệp', 'X'], ['8211', 'Chi phí thuế TNDN hiện hành', 'X'], ['82111', 'Chi phí thuế TNDN hiện hành (thuế suất chung)', 'X'], ['82112', 'Chi phí thuế TNDN bổ sung (thuế tối thiểu toàn cầu)', 'X'], ['8212', 'Chi phí thuế TNDN hoãn lại', 'X'],
  ['911', 'Xác định kết quả kinh doanh', 'P']
];
KT.defaultAccounts = () => ACC.map(a => ({ code: a[0], name: a[1], type: a[2], p: /p/.test(a[3] || ''), i: /i/.test(a[3] || '') }));

/* tra cứu tài khoản (cache theo state) */
KT.acc = {
  map() { const S = KT.S; if (S._amap && S._amapN === S.accounts.length) return S._amap; const m = {}; S.accounts.forEach(a => m[a.code] = a); Object.defineProperty(S, '_amap', { value: m, writable: true, enumerable: false, configurable: true }); Object.defineProperty(S, '_amapN', { value: S.accounts.length, writable: true, enumerable: false, configurable: true }); return m; },
  get(c) { return this.map()[c]; },
  name(c) { const a = this.get(c); return a ? a.name : ''; },
  has(c) { return !!this.get(c); },
  /** tài khoản gốc 3 chữ số */
  root: c => String(c).slice(0, 3),
  /** thuộc nhóm (tiền tố) */
  is: (c, ...pre) => pre.some(p => String(c).startsWith(p)),
  /** cờ theo dõi: lấy từ tài khoản gần nhất có cờ (cha) */
  flag(c, f) { c = String(c); for (let n = c.length; n >= 3; n--) { const a = this.get(c.slice(0, n)); if (a && a[f]) return true; } return false; },
  type(c) { const a = this.get(c) || this.get(String(c).slice(0, 3)); return a ? a.type : ''; },
  /** tài khoản có TK con? */
  hasChildren(c) { return KT.S.accounts.some(a => a.code !== c && a.code.startsWith(c)); }
};

/* ---------- mã lưu chuyển tiền tệ (phương pháp trực tiếp, B03-DN) ---------- */
KT.LCTT = [
  { code: 'THT-T', name: 'Thu từ bán hàng, cung cấp dịch vụ và doanh thu khác', ms: 1, grp: 'KD' },
  { code: 'TT-C', name: 'Chi trả cho người cung cấp hàng hóa và dịch vụ', ms: 2, grp: 'KD' },
  { code: 'TL-C', name: 'Chi trả cho người lao động', ms: 3, grp: 'KD' },
  { code: 'TV-C', name: 'Chi phí đi vay đã trả', ms: 4, grp: 'KD' },
  { code: 'TTH-C', name: 'Thuế thu nhập doanh nghiệp đã nộp', ms: 5, grp: 'KD' },
  { code: 'BHK-T', name: 'Thu khác từ hoạt động kinh doanh', ms: 6, grp: 'KD' },
  { code: 'TTK-C', name: 'Chi khác cho hoạt động kinh doanh', ms: 7, grp: 'KD' },
  { code: 'TTS-C', name: 'Chi mua sắm, xây dựng TSCĐ và tài sản dài hạn khác', ms: 21, grp: 'DT' },
  { code: 'BTS-T', name: 'Thu thanh lý, nhượng bán TSCĐ và tài sản dài hạn khác', ms: 22, grp: 'DT' },
  { code: 'M23-C', name: 'Chi cho vay, mua công cụ nợ của đơn vị khác', ms: 23, grp: 'DT' },
  { code: 'M24-T', name: 'Thu hồi cho vay, bán lại công cụ nợ của đơn vị khác', ms: 24, grp: 'DT' },
  { code: 'M25-C', name: 'Chi đầu tư góp vốn vào đơn vị khác', ms: 25, grp: 'DT' },
  { code: 'M26-T', name: 'Thu hồi đầu tư góp vốn vào đơn vị khác', ms: 26, grp: 'DT' },
  { code: 'M27-T', name: 'Thu lãi cho vay, cổ tức và lợi nhuận được chia', ms: 27, grp: 'DT' },
  { code: 'GV-T', name: 'Thu từ phát hành cổ phiếu, nhận vốn góp của chủ sở hữu', ms: 31, grp: 'TC' },
  { code: 'M32-C', name: 'Trả lại vốn góp, mua lại cổ phiếu đã phát hành', ms: 32, grp: 'TC' },
  { code: 'M33-T', name: 'Tiền thu từ đi vay', ms: 33, grp: 'TC' },
  { code: 'M34-C', name: 'Tiền trả nợ gốc vay', ms: 34, grp: 'TC' },
  { code: 'M35-C', name: 'Tiền trả nợ gốc thuê tài chính', ms: 35, grp: 'TC' },
  { code: 'M36-C', name: 'Cổ tức, lợi nhuận đã trả cho chủ sở hữu', ms: 36, grp: 'TC' }
];
/** gợi ý mã LCTT theo TK đối ứng của dòng tiền. dir: +1 thu (Nợ 111/112), -1 chi (Có 111/112) */
KT.lcttAuto = (counter, dir) => {
  const c = String(counter), s = (...p) => p.some(x => c.startsWith(x));
  if (dir > 0) {
    if (s('131', '511', '5', '3331', '521')) return 'THT-T';
    if (s('411')) return 'GV-T';
    if (s('341', '34')) return 'M33-T';
    if (s('515')) return 'M27-T';
    if (s('128', '121')) return 'M24-T';
    if (s('221', '222', '228')) return 'M26-T';
    if (s('211', '213', '217', '241') || s('711')) return c.startsWith('711') ? 'BTS-T' : 'BTS-T';
    return 'BHK-T';
  }
  if (s('331', '152', '153', '155', '156', '151', '157', '158', '1331', '133', '154', '621', '627', '641', '642', '242')) return 'TT-C';
  if (s('334', '622', '3382', '3383', '3384', '3386', '353')) return 'TL-C';
  if (s('635', '6351')) return 'TV-C';
  if (s('3334', '8211', '821')) return 'TTH-C';
  if (s('211', '212', '213', '217', '241')) return 'TTS-C';
  if (s('341')) return 'M34-C';
  if (s('128', '121')) return 'M23-C';
  if (s('221', '222', '228')) return 'M25-C';
  if (s('411')) return 'M32-C';
  if (s('332', '421')) return 'M36-C';
  return 'TTK-C';
};

/* ---------- loại chứng từ ---------- */
KT.VT = [
  { p: 'PT', name: 'Phiếu thu', form: '01-TT' }, { p: 'PC', name: 'Phiếu chi', form: '02-TT' },
  { p: 'BC', name: 'Giấy báo Có (ngân hàng)' }, { p: 'BN', name: 'Giấy báo Nợ (ngân hàng)' },
  { p: 'HD', name: 'Hóa đơn bán ra' }, { p: 'MH', name: 'Hóa đơn mua vào' },
  { p: 'PN', name: 'Phiếu nhập kho', form: '01-VT' }, { p: 'PX', name: 'Phiếu xuất kho', form: '02-VT' },
  { p: 'CN', name: 'Chứng từ công nợ' }, { p: 'GV', name: 'Góp vốn / vốn chủ sở hữu' },
  { p: 'BL', name: 'Bảng lương, BHXH, thuế TNCN' }, { p: 'KH', name: 'Khấu hao TSCĐ' }, { p: 'PB', name: 'Phân bổ chi phí chờ phân bổ' },
  { p: 'SX', name: 'Kết chuyển chi phí sản xuất' }, { p: 'KG', name: 'Kết chuyển giá vốn / giá thành' },
  { p: 'KC', name: 'Kết chuyển cuối kỳ' }, { p: 'KT', name: 'Phiếu kế toán' }
];
KT.vtype = ct => { const m = String(ct || '').match(/^[A-Za-z]+/); const p = m ? m[0].toUpperCase() : ''; return KT.VT.find(v => v.p === p) || null; };
KT.vkey = ct => String(ct || '').split('/')[0].trim();

/* ---------- mã thuế GTGT trên dòng ---------- */
KT.THUE = [
  { c: '', n: '(không)' }, { c: '10', n: '10%', r: .10 }, { c: '8', n: '8% (giảm 2%)', r: .08 }, { c: '5', n: '5%', r: .05 },
  { c: '0', n: '0% (xuất khẩu…)', r: 0 }, { c: 'KCT', n: 'Không chịu thuế', r: 0 }, { c: 'KKK', n: 'Không phải kê khai, tính nộp', r: 0 }
];
KT.rateOf = c => { const t = KT.THUE.find(x => x.c === String(c)); return t && t.r != null ? t.r : null; };

})(typeof globalThis !== 'undefined' ? globalThis : window);
