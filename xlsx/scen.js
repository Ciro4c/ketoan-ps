// Kịch bản lương để đối chiếu Excel với app (H.calcEmp)
const KT = require('../test/run.js'); const fs = require('fs'); const H = KT.hr;
KT.setState(KT.buildDemo());
const mk = (o) => Object.assign({ code: 'X', name: 'X', luongCB: 0, phuCap: 0, anTrua: 0, luongDongBH: 0, tkChiPhi: '642', npt: [], thueKieu: 'luytien', khoan: [], loaiHD: '' }, o);
const S = [
 { n: 'lương cao, NPT 2, thưởng, xăng, 2026-08', ym: '2026-08', e: mk({ luongCB: 60e6, phuCap: 5e6, anTrua: 1.2e6, npt: [{}, {}], khoan: [{ loai: 'xang', so: 2e6, bh: 0, thue: 'ct' }, { loai: 'nha', so: 3e6, bh: 0, thue: 'ct' }] }), rec: { thuong: 10e6, ngayCong: 26 } },
 { n: 'vãng lai 6 triệu sau 07/2026', ym: '2026-08', e: mk({ luongCB: 6e6, thueKieu: 'vanglai', loaiHD: 'thoivu' }), rec: {} },
 { n: 'vãng lai 2,5 triệu trước 07/2026', ym: '2026-03', e: mk({ luongCB: 2.5e6, thueKieu: 'vanglai', loaiHD: 'thoivu' }), rec: {} },
 { n: 'thử việc không BH', ym: '2026-05', e: mk({ luongCB: 12e6, anTrua: 730000, loaiHD: 'thuviec' }), rec: {} },
 { n: 'dưới sàn, qua đào tạo', ym: '2026-05', e: mk({ luongCB: 4e6, quaDaoTao: true }), rec: {} },
 { n: 'OT miễn một phần, nghỉ nửa tháng', ym: '2026-05', e: mk({ luongCB: 20e6, anTrua: 730000 }), rec: { ot: 3e6, otMienThue: 1e6, ngayCong: 13 } },
 { n: 'trên trần BH, nhiều khoản, trước 07/2026', ym: '2026-04', e: mk({ luongCB: 80e6, phuCap: 2e6, anTrua: 730000, npt: [{}], khoan: [{ loai: 'tp', so: 600000, bh: 0, thue: 'tran', tran: 416667 }, { loai: 'ctp', so: 1e6, bh: 0, thue: 'mien' }, { loai: 'tn', so: 3e6, bh: 1, thue: 'ct' }] }), rec: { thuong: 20e6, bhTuNguyen: 2e6 } },
 { n: 'không khấu trừ', ym: '2026-05', e: mk({ luongCB: 50e6, thueKieu: 'khongkhautru' }), rec: {} },
 { n: 'ghi đè lương đóng BH, tạm ứng', ym: '2026-09', e: mk({ luongCB: 15e6, luongDongBH: 9e6, anTrua: 1.5e6 }), rec: { ung: 2e6, khauTruKhac: 500000, thuNhapKhac: 1e6, mienKhac: 700000 } },
];
S.forEach(s => { const c = H.calcEmp(s.e, s.ym, s.rec, 26); s.exp = { tong: c.tong, bhNLD: c.bhNLD, bhNSD: c.bhNSD, kpcd: c.kpcd, tncn: c.tncn, thucLinh: c.thucLinh, baseBH: c.baseBH, mien: c.mienThue, tntt: c.tntt }; });
fs.writeFileSync(__dirname + '/scen.json', JSON.stringify(S)); S.forEach(s => console.log(s.n, JSON.stringify(s.exp)));
