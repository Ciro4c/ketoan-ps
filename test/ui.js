/* Kiểm tra giao diện bằng trình duyệt không đầu:  python3 build.py && node test/ui.js
   1) mọi nút data-a / data-c / data-i trong mã nguồn có hàm xử lý tương ứng
   2) mọi màn hình mở được, không lỗi, không tràn ngang ở khổ điện thoại
   3) mọi hồ sơ ở Nghĩa vụ với cơ quan nhà nước và chứng từ lương xem trước được */
const { chromium } = require('playwright'); const fs = require('fs'), path = require('path');
const src = fs.readdirSync(path.join(__dirname, '../src')).filter(f => f.endsWith('.js')).map(f => fs.readFileSync(path.join(__dirname, '../src', f), 'utf8')).join('\n');
const names = re => [...new Set([...src.matchAll(re)].map(m => m[1]))];
(async () => {
  const b = await chromium.launch(); const errs = []; let n = 0; const ok = (c, m) => { n++; if (!c) errs.push(m); };
  const p = await b.newPage({ viewport: { width: 1300, height: 900 } });
  p.on('pageerror', e => errs.push('pageerror: ' + e.message)); p.on('console', m => m.type() === 'error' && !/font|ERR_|favicon/i.test(m.text()) && errs.push('console: ' + m.text()));
  await p.goto('file://' + path.join(__dirname, '../dist/KeToanPS.html')); await p.waitForTimeout(300);
  await p.evaluate(() => { KT.setState(KT.buildDemo()); KT.ui.initPer(); });
  /* 1 */
  const miss = await p.evaluate(x => ({ a: x.a.filter(k => !KT.ui.act[k]), c: x.c.filter(k => !KT.ui.chg[k]) }), { a: names(/data-a="([a-z0-9]+)"/g), c: names(/data-[ci]="([a-z0-9]+)"/g) });
  ok(!miss.a.length, 'nút không có hàm xử lý (UI.act): ' + miss.a); ok(!miss.c.length, 'ô nhập không có hàm xử lý (UI.chg): ' + miss.c.filter(k => !['subo', 'lg'].includes(k)));
  /* 2 */
  const routes = await p.evaluate(() => Object.keys(KT.ui.routes));
  for (const w of [1300, 400]) { await p.setViewportSize({ width: w, height: 900 });
    for (const r of routes) { await p.evaluate(r => KT.ui.go(r), r); await p.waitForTimeout(120); ok(await p.evaluate(() => document.querySelectorAll('.page').length >= 1 && document.querySelector('.page').innerText.length > 20), 'màn hình trống: ' + r);
      if (w === 400) ok(!(await p.evaluate(() => document.documentElement.scrollWidth > innerWidth + 2)), 'tràn ngang ở 400px: ' + r); } }
  await p.setViewportSize({ width: 1300, height: 900 });
  /* 3 */
  for (const g of ['Thuế', 'Bảo hiểm', 'Lao động', 'Sổ sách']) { await p.evaluate(g => { KT.ui.sub.nv = { g, tk: '111' }; KT.ui.go('nghiavu'); }, g); const c = await p.evaluate(() => document.querySelectorAll('[data-a=nvview]').length);
    for (let i = 0; i < c; i++) { await p.evaluate(i => document.querySelectorAll('[data-a=nvview]')[i].click(), i); await p.waitForTimeout(100); ok(await p.evaluate(() => (document.querySelector('#modal') || { innerText: '' }).innerText.length > 150), 'xem trước rỗng: ' + g + ' #' + i); await p.evaluate(() => KT.ui.closeModal()); } }
  await p.evaluate(() => KT.ui.go('chungtuluong'));
  for (const k of ['tl', 'th', 'ot', 'bk', 'pb', 'cc', 'pc']) { await p.evaluate(k => KT.ui.act.clview({ dataset: { k } }), k); await p.waitForTimeout(80); ok(await p.evaluate(() => document.querySelector('#modal').innerText.length > 100), 'chứng từ lương rỗng: ' + k); await p.evaluate(() => KT.ui.closeModal()); }
  /* Trung tâm in: mọi mục dựng được, không báo lỗi, có nội dung */
  await p.evaluate(() => KT.ui.go('in'));
  const pr = await p.evaluate(() => KT.ui.printAll().map(x => { let h = ''; try { h = x.fn(); } catch (e) { h = 'ERR ' + e.message; } return [x.id, h.length, /ERR |Không lập được/.test(h)]; }));
  for (const [id, len, bad] of pr) ok((len > 150 || id[0] === 'c') && !bad, 'Trung tâm in mục lỗi/rỗng: ' + id + ' (' + len + ')');
  await p.evaluate(() => { KT.ui.act.pcall({ dataset: { k: '1' } }); KT.ui.act.pcgo(); }); await p.waitForTimeout(150);
  ok(await p.evaluate(() => !!document.querySelector('#modal, .modal')), 'Xem trước hàng loạt không mở được');
  for (const nav of ['gtgt', 'tncn', 'tncn:2026', 'tndn', 'monbai', 'bhxh', 'bctc']) { await p.evaluate(n => KT.ui.navPrint(n), nav); await p.waitForTimeout(100); ok(await p.evaluate(() => /Xem trước/.test(document.body.innerText) && document.querySelector('#modal, .modal')), 'In theo mẫu không mở: ' + nav); await p.evaluate(() => KT.ui.act.close && KT.ui.act.close()); }
  await p.evaluate(() => { KT.ui.dmGo('dk'); }); await p.waitForTimeout(100);
  ok(await p.evaluate(() => /Cần nhập những gì/.test(document.body.innerText)), 'Số dư đầu kỳ thiếu khung gợi ý');
  await p.evaluate(() => KT.ui.go('lich')); ok(await p.evaluate(() => document.querySelectorAll('[data-a=nvprint]').length > 3), 'Lịch nghĩa vụ thiếu nút In theo mẫu');
  await b.close(); console.log((n - errs.length) + '/' + n + ' đạt'); if (errs.length) { console.log(errs.join('\n')); process.exit(1); }
})();
