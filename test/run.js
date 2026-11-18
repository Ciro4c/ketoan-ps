/* Bộ kiểm tra tự động, không cần trình duyệt:  node test/run.js
   Mỗi dòng check(...) là một khẳng định có tên; kết thúc in số đạt, số lỗi và thoát mã 1 nếu có lỗi. */
const fs = require('fs'), vm = require('vm');
const FILES = ['core', 'coa', 'engine', 'books', 'books2', 'books3', 'forms', 'tax', 'hr', 'forms2', 'templates', 'demo'];   // thứ tự giống build.py (phần không có giao diện)
vm.runInThisContext(FILES.map(f => fs.readFileSync(__dirname + '/../src/' + f + '.js', 'utf8')).join('\n'));
const KT = globalThis.KT; module.exports = KT;
if (require.main !== module) return;

let pass = 0, fail = 0;
const check = (name, ok, extra) => { if (ok) pass++; else { fail++; console.log('FAIL', name, extra === undefined ? '' : extra); } };
const near = (a, b, tol = 1) => Math.abs(a - b) <= tol;
const load = (mod) => { const s = KT.buildDemo(); Object.assign(s.company, mod || {}); KT.setState(s); return KT.compute(); };

/* 1. Sổ PS demo: các báo cáo phải cân */
{
  const L = load(); const e = L.issues.filter(i => i.sev === 'err');
  check('demo không có lỗi E', e.length === 0, e.map(i => i.code + ' ' + i.msg).join('; '));
  const b = KT.rep.b01('2026-10-31'); check('B01 cân (tài sản = nguồn vốn)', b.diff === 0, b.diff);
  const c = KT.rep.b02('2026-01-01', '2026-10-31'); check('B02 LNTT demo', near(c.cur[50], 400001192), c.cur[50]); check('B02 LNST demo', near(c.cur[60], 346288452), c.cur[60]);
  const t = KT.rep.b03('2026-01-01', '2026-10-31'); check('B03 cuối kỳ khớp tiền trên B01', t.diff === 0, t.diff);
  check('CDPS cân', KT.rep.cdps('2026-01-01', '2026-10-31').ok === true);
}
/* 2. Bốn phương pháp tính giá xuất kho */
for (const m of ['bqgq', 'bqdd']) { load({ phuongPhapGia: m }); check('B01 cân, phương pháp ' + m, KT.rep.b01('2026-10-31').diff === 0); }
{ const L = load({ phuongPhapGia: 'fifo' }); check('FIFO: bút toán kết chuyển cố định bị cảnh báo W22', L.issues.some(i => i.code === 'W22')); check('FIFO: CDPS vẫn cân', KT.rep.cdps('2026-01-01', '2026-10-31').ok === true); }
{ const L = load({ phuongPhapGia: 'dd' }); check('Đích danh: dòng xuất thiếu đơn giá báo E03', L.issues.some(i => i.code === 'E03')); }

/* 3. Lương, bảo hiểm, thuế TNCN (kết quả tính tay) */
const H = KT.hr; load();
{
  const e = { code: 'X', name: 'T', luongCB: 15e6, phuCap: 0, anTrua: 8e5, thueKieu: 'luytien', npt: [], khoan: [{ ten: 'cv', so: 2e6, bh: true, thue: 'ct' }, { ten: 'xăng', so: 1e6, bh: false, thue: 'ct' }] };
  const c = H.calcEmp(e, '2026-10', { thuong: 5e6, ot: 3e6 }, 26);
  check('lương: tổng thu nhập', c.tong === 26.8e6, c.tong); check('lương đóng BH = lương + khoản BH, không gồm thưởng, xăng xe', c.baseBH === 17e6, c.baseBH);
  check('BH người lao động 10,5%', c.bhNLD === 1785000, c.bhNLD); check('miễn thuế = ăn trưa 800k + làm thêm giờ 3tr', c.mienThue === 3.8e6, c.mienThue);
  check('thu nhập chịu thuế', c.tnct === 23e6, c.tnct); check('thu nhập tính thuế', c.tntt === 5715000, c.tntt); check('thuế TNCN bậc 5%', c.tncn === 285750, c.tncn); check('thực lĩnh', c.thucLinh === 24729250, c.thucLinh);
  const hi = H.calcEmp(Object.assign({}, e, { luongCB: 100e6, khoan: [], quaDaoTao: true }), '2026-10', {}, 26);
  check('trần BHXH, BHYT = 20 lần mức tham chiếu (từ 01/07/2026)', hi.baseBH === 50.6e6, hi.baseBH); check('trần BHTN = 20 lần lương tối thiểu vùng', hi.baseTN === 94.6e6, hi.baseTN);
  const lo = H.calcEmp(Object.assign({}, e, { luongCB: 3e6, khoan: [], quaDaoTao: true }), '2026-10', {}, 26);
  check('sàn BH = lương tối thiểu vùng + 7% khi đã qua đào tạo', near(lo.baseBH, 4730000 * 1.07, 1), lo.baseBH);
  const old = H.calcEmp(e, '2026-03', {}, 26); check('trần BH trước 01/07/2026 là 46,8 triệu', old.capBH === 46.8e6, old.capBH);
  const tv = H.calcEmp(Object.assign({}, e, { loaiHD: 'thuviec' }), '2026-10', {}, 26); check('thử việc không đóng BH', tv.baseBH === 0 && tv.bhNLD === 0);
  const vl = H.calcEmp(Object.assign({}, e, { thueKieu: 'vanglai' }), '2026-10', { thuong: 6e6 }, 26); check('vãng lai: khấu trừ 10% khi từ ngưỡng', vl.tncn === Math.round(vl.tnct * 0.1), vl.tncn);
  const B = H.breakdown('2026-10'); check('bảng phân loại có cột xăng xe và nhà ở', ['k:xang', 'k:nha'].every(k => B.cols.some(c => c.k === k)));
  check('xăng xe, nhà ở: không BH, chịu thuế', H.pcCat().filter(x => ['xang', 'nha'].includes(x.loai)).every(x => !x.bh && x.thue === 'ct'));
}
/* 4. Mẫu nghiệp vụ: mọi tài khoản dùng phải có trong hệ thống tài khoản */
{
  const acc = new Set(KT.S.accounts.map(a => a.code)); const it = KT.S.items[0].code, pt = KT.S.partners[0].code;
  const base = { ng: '2026-10-20', dt: pt, vt: it, sl: 2, dg: 't', thue: '10', hd: '1', kh: 'A', nhd: '2026-10-20', tien: 1e6, cif: 1e7, ng_gia: 1e7, hm: 4e6, gb: 5e6, gia: 1e5, gv: 1e5 };
  let bad = [];
  for (const t of KT.TPL) { const f = Object.assign({}, base); (t.fields || []).forEach(x => { if (x.def !== undefined) f[x.k] = x.def; if (x.type === 'month') f[x.k] = '2026-10'; });
    try { KT.tplBuild(t.id, f).forEach(l => { if (!acc.has(l.no) || !acc.has(l.co)) bad.push(t.id + ' ' + l.no + '/' + l.co); }); } catch (e) { bad.push(t.id + ' lỗi ' + e.message); } }
  check('mọi mẫu nghiệp vụ dùng tài khoản hợp lệ', bad.length === 0, bad.join('; '));
}
/* 5. Sổ sách theo mẫu */
{
  load(); const a = '2026-01-01', b = '2026-10-31';
  const nk = KT.rep.nhatKy(a, b), tot = nk.rows[nk.rows.length - 1]; check('Nhật ký chung: tổng Nợ = tổng Có', tot.no === tot.co && tot.no > 0);
  const sc = KT.rep.soCai('111', a, b); check('Sổ Cái: dư đầu + phát sinh = dư cuối', near(sc.op + sc.sn - sc.sc, sc.close));
  const h1 = KT.forms.render(nk), h2 = KT.forms.render(sc); check('mẫu S03a dựng được', h1 && h1.includes('S03a-DN') && h1.includes('Đã ghi Sổ Cái')); check('mẫu S03b dựng được', h2 && h2.includes('S03b-DN') && h2.includes('Trang số'));
  check('S03a và Sổ Cái dùng cùng số STT dòng', KT.forms.nkIndex(a).total === 2 * KT.compute().lines.filter(l => l.date >= '2026-01-01' && l.date <= '2026-12-31').length);
  for (const [k, f] of [['nkTien thu', () => KT.rep.nkTien('thu', a, b)], ['nkMua', () => KT.rep.nkMua(a, b)], ['nkBan', () => KT.rep.nkBan(a, b)], ['nkSoCai', () => KT.rep.nkSoCai(a, b)], ['ctgsDk', () => KT.rep.ctgsDk(a, b)], ['ctgs', () => KT.rep.ctgs(a, b)], ['tscd', () => KT.rep.tscd(a, b)], ['chiPhi', () => KT.rep.chiPhi(a, b)], ['banHang', () => KT.rep.banHang(a, b)]]) { let ok = true; try { f(); } catch (e) { ok = false; } check('sổ ' + k + ' chạy được', ok); }
}
/* 6. Đọc số tiền bằng chữ */
for (const [n, s] of [[20000000, 'Hai mươi triệu đồng'], [1250500, 'Một triệu hai trăm năm mươi nghìn năm trăm đồng'], [15000, 'Mười lăm nghìn đồng'], [2000105, 'Hai triệu một trăm lẻ năm đồng']]) check('đọc số ' + n, KT.docTien(n) === s, KT.docTien(n));

/* 7. Mẫu tờ khai và sổ theo bố cục pháp lý (forms2) */
{ load(); const L = KT.compute(), ser = KT.tax.vatSeries(L.last), r = ser[ser.length - 1], y = +L.last.slice(0, 4);
  const g = KT.forms2.gtgt(r); check('01/GTGT có chỉ tiêu [43] và [22]', /\[43\]/.test(g) && /\[22\]/.test(g)); check('01-1 và 01-2 dựng được', KT.forms2.bkBan(r).includes('01-1/GTGT') && KT.forms2.bkMua(r).includes('01-2/GTGT'));
  check('03/TNDN dựng được', KT.forms2.tndn(y).includes('03/TNDN')); check('05/KK-TNCN dựng được', KT.forms2.tncn({ from: y + '-01-01', to: y + '-12-31', label: 'Năm ' + y }).includes('05/KK-TNCN'));
  check('khung sổ chung dựng được cho TSCĐ', KT.forms2.book(KT.rep.tscd(y + '-01-01', y + '-12-31')).includes('Người ghi sổ')); }
{ const y = +KT.compute().last.slice(0, 4); check('01/MBAI dựng được', KT.forms2.monbai(y).includes('01/MBAI')); check('05/QTT-TNCN dựng được', KT.forms2.qtt(y).includes('05/QTT-TNCN'));
  check('D02-LT dựng được', KT.forms2.d02(KT.compute().last.slice(0, 7)).includes('D02-LT')); }
console.log(pass + ' đạt, ' + fail + ' lỗi'); process.exit(fail ? 1 : 0);
