/* ===== Dữ liệu mẫu (công ty giả định, năm 2026) ===== */
(function (G) {
'use strict';
const KT = G.KT, D = KT.d;
KT.buildDemo = function () {
  const keep = KT.S; KT.noSave = true;
  const S = KT.S = KT.newState(); S.meta.demo = true;
  Object.assign(S.company, { name: 'CÔNG TY TNHH CÔNG NGHỆ VÀ THƯƠNG MẠI ABC', address: '12 Nguyễn Văn Cừ, Ninh Kiều, Cần Thơ', mst: '1800123456', nganh: 'Phần mềm, thương mại thiết bị CNTT', dienThoai: '0292 3xxx xxx', coQuanThue: 'Thuế TP. Cần Thơ', nganHang: 'Vietcombank CN Cần Thơ', tknh: '0071000123456', giamDoc: 'Nguyễn Văn An', ktt: 'Trần Thị Bình', nguoiLap: 'Trần Thị Bình', thuQuy: 'Lê Văn Chi', fyStart: '2026-01-01', vonDieuLe: 1000000000, vung: 2, ngayDangKy: '2025-12-15', kyGTGT: 'thang', kyTNCN: 'thang' });
  S.partners = [
    { code: 'CSH01', name: 'Nguyễn Văn An (chủ sở hữu)', type: 'CSH', mst: '' },
    { code: 'KH001', name: 'Công ty CP Thương mại Hậu Giang', type: 'KH', mst: '1800555111', address: 'Hậu Giang' }, { code: 'KH002', name: 'Trường THPT Châu Văn Liêm', type: 'KH', mst: '1800666222', address: 'Cần Thơ' }, { code: 'KH003', name: 'Công ty TNHH Vận tải Mê Kông', type: 'KH', mst: '1800777333', address: 'Cần Thơ' },
    { code: 'NCC01', name: 'Công ty TNHH Thiết bị Tin học Nam Việt', type: 'NCC', mst: '0300111222', address: 'TP.HCM' }, { code: 'NCC02', name: 'Công ty CP Linh kiện Điện tử Đại Phát', type: 'NCC', mst: '0300333444', address: 'TP.HCM' }, { code: 'NCC03', name: 'Công ty CP Bất động sản Tây Đô (thuê văn phòng)', type: 'NCC', mst: '1800888444', address: 'Cần Thơ' }, { code: 'NCC04', name: 'Viễn thông Cần Thơ', type: 'NCC', mst: '1800999555', address: 'Cần Thơ' }, { code: 'NCC05', name: 'Công ty TNHH Nội thất Phú Gia', type: 'NCC', mst: '1801000666', address: 'Cần Thơ' },
    { code: 'NH01', name: 'Vietcombank – cho vay', type: 'NCC', mst: '0100112437' }
  ];
  S.items = [
    { code: 'HH01', name: 'Laptop Dell Inspiron 15', unit: 'cái', tk: '156' }, { code: 'HH02', name: 'Thiết bị mạng Wifi 6', unit: 'cái', tk: '156' },
    { code: 'NVL01', name: 'USB 32GB', unit: 'cái', tk: '152' }, { code: 'NVL02', name: 'Linh kiện lắp ráp', unit: 'bộ', tk: '152' },
    { code: 'TP01', name: 'Phần mềm quản lý PMS (đóng gói)', unit: 'bộ', tk: '155' }
  ];
  S.orders = [{ code: 'DH01', name: 'Lô SX phần mềm PMS đợt 1', loai: 'SX' }, { code: 'DH02', name: 'Lô SX phần mềm PMS đợt 2', loai: 'SX' }, { code: 'DH03', name: 'Lô SX phần mềm PMS đợt 3', loai: 'SX' }, { code: 'DH10', name: 'Bán hàng hóa CNTT', loai: 'BH' }, { code: 'DV01', name: 'Dịch vụ triển khai, bảo trì', loai: 'DV' }];
  S.employees = [
    { code: 'NV01', name: 'Nguyễn Văn An', chucDanh: 'Giám đốc', cccd: '092080000001', mst: '8000000011', soBHXH: '9200000001', vao: '2025-12-15', luongCB: 15000000, phuCap: 0, anTrua: 730000, luongDongBH: 15000000, tkChiPhi: '642', npt: [{ ten: 'Nguyễn Thị Mai', quanHe: 'Vợ', tu: '2026-01-01', mst: '8000000012' }, { ten: 'Nguyễn Gia Bảo', quanHe: 'Con', tu: '2026-01-01', mst: '8000000013' }], thueKieu: 'luytien' },
    { code: 'NV02', name: 'Trần Thị Bình', chucDanh: 'Kế toán trưởng', cccd: '092085000002', mst: '8000000021', soBHXH: '9200000002', vao: '2025-12-15', luongCB: 9000000, phuCap: 1000000, anTrua: 730000, luongDongBH: 10000000, tkChiPhi: '642', npt: [], thueKieu: 'luytien' },
    { code: 'NV03', name: 'Phạm Quốc Dũng', chucDanh: 'Lập trình viên', cccd: '092090000003', mst: '8000000031', soBHXH: '9200000003', vao: '2026-02-01', luongCB: 14000000, phuCap: 0, anTrua: 730000, luongDongBH: 14000000, tkChiPhi: '622', dh: 'DH01', npt: [{ ten: 'Phạm Quốc Huy', quanHe: 'Con', tu: '2026-02-01', mst: '8000000033' }], thueKieu: 'luytien' }
  ];
  const hh = S.items.find(x => x.code === 'HH01'); if (hh) Object.assign(hh, { loai: 'HH', giaMua: 16000000, giaBan: 19500000, thue: '10', tkDT: '5111', tonMin: 3 });
  S.payScale = [
    { code: 'QL', name: 'Quản lý điều hành', min: 13000000, h: [1, 1.08, 1.15, 1.27, 1.38, 1.54, 1.69, 1.92] },
    { code: 'KT', name: 'Kế toán, hành chính', min: 8000000, h: [1, 1.13, 1.25, 1.38, 1.5, 1.63, 1.75, 1.88] },
    { code: 'CM', name: 'Chuyên môn kỹ thuật', min: 10000000, h: [1, 1.2, 1.4, 1.6, 1.8, 2, 2.2, 2.4] }
  ];
  Object.assign(S.employees[0], { ngach: 'QL', bac: 3 }); Object.assign(S.employees[1], { ngach: 'KT', bac: 2 }); Object.assign(S.employees[2], { ngach: 'CM', bac: 3 });
  S.assets = [{ code: 'TS001', name: 'Máy chủ Dell PowerEdge', nhom: '211', nguyenGia: 48000000, thang: 36, batDau: '2026-01-05', tkChiPhi: '627', dh: 'DH01' }];
  S.prepaids = [{ code: 'CP001', name: 'Bàn ghế, nội thất văn phòng', gia: 24000000, thang: 24, tu: '2026-02-01', tkChiPhi: '642' }];

  const J = S.journal;
  const add = (tpl, f, ct) => { const ls = KT.tplBuild(tpl, f, ct); ls.forEach(l => { l.id = KT.newId(); J.push(l); }); return ls; };
  let hdN = 100; const hd = () => String(++hdN).padStart(7, '0');
  const mh = (ng, dt, kind, f) => add(kind, Object.assign({ ng, dt, hd: hd(), kh: '1C26TAA', nhd: ng, thue: '10', tt: '331' }, f));
  const M = i => '2026-' + String(i).padStart(2, '0');
  const dd = (m, d) => M(m) + '-' + String(d).padStart(2, '0');

  add('gop_von', { ng: '2026-01-02', dt: 'CSH01', tien: 1000000000, tk: '112', dg: 'Chủ sở hữu góp vốn điều lệ' });
  add('rut_nop', { ng: '2026-01-03', tien: 50000000, huong: 'rut', dg: 'Rút tiền gửi về quỹ' });
  mh('2026-01-05', 'NCC01', 'mua_tscd', { tk: '2112', tien: 48000000, dg: 'Mua máy chủ Dell PowerEdge' });
  S.journal.filter(l => l.ct.startsWith('MH') && l.no === '2112').forEach(l => l.ts = 'TS001');
  mh('2026-01-06', 'NCC01', 'mua_hang', { kho: '156', vt: 'HH01', sl: 12, gia: 15000000, dg: 'Mua laptop Dell nhập kho' });
  mh('2026-01-06', 'NCC01', 'mua_hang', { kho: '156', vt: 'HH02', sl: 20, gia: 1800000, dg: 'Mua thiết bị mạng Wifi 6' });
  mh('2026-01-07', 'NCC02', 'mua_hang', { kho: '152', vt: 'NVL01', sl: 100, gia: 80000, tt: '112', dg: 'Mua USB làm vật liệu đóng gói' });
  mh('2026-01-07', 'NCC02', 'mua_hang', { kho: '152', vt: 'NVL02', sl: 50, gia: 200000, dg: 'Mua linh kiện lắp ráp' });
  const add2 = (tpl, f, ct) => { const ls = KT.tplBuild(tpl, f, ct); ls.forEach(l => { l.id = KT.newId(); S.journal.push(l); }); return ls; };
  const mh2 = (ng, dt, kind, f) => add2(kind, Object.assign({ ng, dt, hd: hd(), kh: '1C26TAA', nhd: ng, thue: '10', tt: '331' }, f));
  add2('mua_cp', { ng: '2026-02-01', dt: 'NCC05', tk: '242', tien: 24000000, hd: hd(), kh: '1C26TAA', nhd: '2026-02-01', thue: '10', tt: '331', dg: 'Mua bàn ghế, nội thất văn phòng (chờ phân bổ 24 tháng)' });
  add2('mua_cp', { ng: '2026-01-28', dt: '', tk: '6425', tien: 2000000, thue: '', tt: '331', dg: 'Lệ phí môn bài năm 2026' });
  S.journal[S.journal.length - 1].no = '6425'; S.journal[S.journal.length - 1].co = '3338'; S.journal[S.journal.length - 1].dt = ''; S.journal[S.journal.length - 1].tn = '';
  add2('nop_thue', { ng: '2026-01-30', tk: '3338', tien: 2000000, tt: '112', dg: 'Nộp lệ phí môn bài 2026' });

  const rentAndCosts = m => {
    mh2(dd(m, 8), 'NCC03', 'mua_cp', { tk: '642', tien: 10000000, tt: '112', dg: 'Thuê văn phòng tháng ' + m });
    mh2(dd(m, 12), 'NCC04', 'mua_cp', { tk: '642', tien: 800000, dg: 'Cước Internet, điện thoại tháng ' + m });
    add2('chi_phi', { ng: dd(m, 15), tk: '642', tien: 1500000, tt: '111', dg: 'Chi phí văn phòng phẩm, tiếp khách tháng ' + m });
    add2('lai_nh', { ng: dd(m, 28), tien: 1200000, dg: 'Lãi tiền gửi ngân hàng tháng ' + m });
  };
  const order = { 1: 'DH01', 2: 'DH01', 3: 'DH01', 4: 'DH01', 5: 'DH02', 6: 'DH02', 7: 'DH02', 8: 'DH03', 9: 'DH03', 10: 'DH03' };
  const completeAt = { 4: 'DH01', 7: 'DH02', 10: 'DH03' };
  const hdBan = (ng, dt, f) => add2('ban_hang', Object.assign({ ng, dt, hd: hd().replace(/^0/, '1'), kh: '1C26TBB', nhd: ng, thue: '10', tt: '131', gv: '1', dh: 'DH10' }, f));
  const vatPaid = {};
  for (let m = 1; m <= 10; m++) {
    if (m >= 2) rentAndCosts(m); else { mh2(dd(1, 8), 'NCC03', 'mua_cp', { tk: '642', tien: 10000000, tt: '112', dg: 'Thuê văn phòng tháng 1' }); add2('lai_nh', { ng: dd(1, 28), tien: 1200000, dg: 'Lãi tiền gửi ngân hàng tháng 1' }); }
    if (m === 3) add2('vay', { ng: dd(3, 1), dt: 'NH01', loai: 'nhan_ng', tien: 200000000, dg: 'Nhận vay vốn lưu động 6 tháng' });
    if (m >= 4 && m <= 9) add2('vay', { ng: dd(m, 25), loai: 'lai', tien: 1500000, dg: 'Trả lãi vay tháng ' + m });
    if (m === 9) add2('vay', { ng: dd(9, 28), dt: 'NH01', loai: 'goc_ng', tien: 200000000, dg: 'Trả gốc vay vốn lưu động' });
    // mua bổ sung hàng
    if (m >= 2) { mh2(dd(m, 6), 'NCC01', 'mua_hang', { kho: '156', vt: 'HH01', sl: 6, gia: 15200000, dg: 'Mua laptop Dell nhập kho tháng ' + m }); mh2(dd(m, 6), 'NCC01', 'mua_hang', { kho: '156', vt: 'HH02', sl: 10, gia: 1850000, dg: 'Mua thiết bị mạng nhập kho tháng ' + m }); }
    if (m >= 2) mh2(dd(m, 7), 'NCC02', 'mua_hang', { kho: '152', vt: 'NVL02', sl: 10, gia: 205000, tt: '112', dg: 'Mua bổ sung linh kiện' });
    // bán hàng
    hdBan(dd(m, 10), 'KH001', { dtk: '5111', vt: 'HH01', sl: m === 1 ? 4 : 6, tien: (m === 1 ? 4 : 6) * 19500000, dg: 'Bán laptop Dell cho KH001' });
    hdBan(dd(m, 18), 'KH002', { dtk: '5111', vt: 'HH02', sl: 10, tien: 10 * 2600000, dg: 'Bán thiết bị mạng Wifi 6 cho KH002' });
    hdBan(dd(m, 22), 'KH003', { dtk: '5113', vt: '', sl: 0, tien: 45000000 + m * 1000000, thue: m >= 3 ? '8' : '10', gv: '0', dh: 'DV01', dg: 'Dịch vụ triển khai, bảo trì hệ thống' });
    if (m >= 5) hdBan(dd(m, 24), 'KH001', { dtk: '5112', vt: 'TP01', sl: 1, tien: 12500000, dg: 'Bán phần mềm PMS cho KH001', dh: 'DH10' });
    // thu tiền tháng trước
    if (m >= 2) { const prev = S.journal.filter(l => l.no === '131' && l.ng.slice(0, 7) === M(m - 1)); const by = {}; prev.forEach(l => by[l.dt] = (by[l.dt] || 0) + l.st); Object.keys(by).forEach(k => add2('thu_kh', { ng: dd(m, 20), dt: k, tien: by[k], tk: '112', dg: 'Thu tiền bán hàng tháng ' + (m - 1) + ' – ' + k })); }
    // sản xuất
    if (m >= 2) {
      S.employees[2].dh = order[m]; S.assets[0].dh = order[m];
      add2('xuat_sx', { ng: dd(m, 11), vt: 'NVL01', sl: 6, dh: order[m], dg: 'Xuất USB đóng gói PMS' }); add2('xuat_sx', { ng: dd(m, 11), vt: 'NVL02', sl: 4, dh: order[m], dg: 'Xuất linh kiện PMS' });
    } else { S.employees[2].dh = 'DH01'; }
    // trả NCC (tháng trước, chuyển khoản)
    if (m >= 2) { const pm = M(m - 1); const by = {}; S.journal.filter(l => l.co === '331' && l.ng.slice(0, 7) === pm).forEach(l => by[l.dt] = (by[l.dt] || 0) + l.st); Object.keys(by).forEach(k => by[k] > 0 && add2('chi_ncc', { ng: dd(m, 16), dt: k, tien: by[k], tk: '112', dg: 'Thanh toán tiền hàng/dịch vụ tháng ' + (m - 1) })); }
    if (m === 1) { const by = {}; S.journal.filter(l => l.co === '331').forEach(l => by[l.dt] = (by[l.dt] || 0) + l.st); Object.keys(by).forEach(k => add2('chi_ncc', { ng: dd(1, 30), dt: k, tien: by[k], tk: '112', dg: 'Thanh toán tiền hàng/dịch vụ tháng 1' })); }
    const ym = M(m), tag = KT.auto;
    const apply = r => { if (r.lines.length) tag.apply(r.tag, r.lines); };
    apply(tag.payroll(ym)); apply(tag.depreciation(ym)); apply(tag.prepaid(ym));
    // nhập thành phẩm cuối kỳ
    if (completeAt[m]) { apply(tag.production(ym)); add2('nhap_tp', { ng: dd(m, 29 - (m === 2 ? 1 : 0)), vt: 'TP01', sl: 5, dh: completeAt[m], dg: 'Nhập kho thành phẩm PMS ' + completeAt[m] }); } else apply(tag.production(ym));
    // nộp lương, BH, thuế tháng trước
    if (m >= 2) {
      const pmn = M(m - 1);
      add2('tra_luong', { ng: dd(m, 5), ym: pmn, tt: '112', dg: 'Trả lương tháng ' + (m - 1) });
      add2('nop_bh', { ng: dd(m, 10), ym: pmn, tt: '112', kp: '1', dg: 'Nộp BHXH, BHYT, BHTN, KPCĐ tháng ' + (m - 1) });
      const t = KT.hr.month(pmn).T.tncn; if (t > 0) add2('nop_thue', { ng: dd(m, 19), tk: '3335', tien: t, tt: '112', dg: 'Nộp thuế TNCN tháng ' + (m - 1) });
    }
    // GTGT: khấu trừ, nộp kỳ trước
    const sr = KT.tax.vatSeries(D.eom(ym)); const cur = sr.find(x => x.per.key === ym);
    // khấu trừ trước (bút toán tự sinh), rồi nộp phần còn lại của tháng trước vào ngày 20
    apply(tag.vatOffset(ym));
    if (m >= 2) { const prevR = KT.tax.vatSeries(D.eom(ym)).find(x => x.per.key === M(m - 1)); const L = KT.compute(); const remain = -L.bal('3331', D.addDays(dd(m, 20), -1)); if (prevR && prevR.v[40] > 0 && remain > 0) add2('nop_thue', { ng: dd(m, 20), tk: '3331', tien: Math.min(prevR.v[40], remain), tt: '112', dg: 'Nộp thuế GTGT ' + prevR.per.label }); }
    // TNDN quý: hạch toán chi phí thuế và nộp
    if (m % 3 === 0 && m <= 9) {
      const q = m / 3; const c = KT.tax.cit(2026); const prevCum = q > 1 ? c.q[q - 2].cum : 0; const amt = c.q[q - 1].cum - prevCum;
      if (amt > 0) { add2('chi_phi', { ng: dd(m, 30 === 30 && m === 9 ? 30 : 30 > 28 && m === 3 ? 31 : 30), tk: '8211', tien: amt, tt: '112', dg: 'Chi phí thuế TNDN tạm tính quý ' + q }); const x = S.journal[S.journal.length - 1]; x.co = '3334'; x.lc = ''; }
    }
    if (m % 3 === 1 && m >= 4) { const q = Math.floor((m - 1) / 3); const c = KT.tax.cit(2026); const due = Math.max(0, c.q[q - 1].cum - (q > 1 ? c.q[q - 2].cum : 0)); if (due > 0) add2('nop_thue', { ng: dd(m, 28), tk: '3334', tien: due, tt: '112', dg: 'Tạm nộp thuế TNDN quý ' + q }); }
    if (m <= 9) apply(tag.closing(D.bom(ym), D.eom(ym), 'tháng ' + m));
  }
  // cảnh báo mẫu: chi tiền mặt ≥ 5 triệu (minh họa kiểm soát)
  add2('chi_phi', { ng: '2026-10-26', tk: '642', tien: 6200000, tt: '111', dg: 'Chi tiếp khách bằng tiền mặt (ví dụ cảnh báo ≥ 5 triệu)' });
  S.journal.forEach(l => { delete l.mod; });
  for (let m = 1; m <= 9; m++) { const ym = M(m); ['gtgt:' + ym, 'tncn:' + ym].forEach(k => S.filings['done:' + k] = 1); if (m % 3 === 0) S.filings['done:tndnq:2026-Q' + m / 3] = 1; }
  S.filings['done:monbai:2026'] = 1;
  KT.noSave = false; const built = KT.S; KT.S = keep; return built;
};
})(typeof globalThis !== 'undefined' ? globalThis : window);
