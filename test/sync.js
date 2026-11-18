/* Kiểm tra đồng bộ db bằng db giả: lưu, tải lại, vai trò chỉ xem, hai người cùng nhập */
const { chromium } = require('playwright'); const path = require('path');
const fake = `
(() => {
  const store = window.__store = window.__store || JSON.parse(localStorage.getItem('fk') || '{}'); const subs = [];
  const snapOf = (coll) => { const docs = Object.keys(store).filter(k => k.startsWith(coll + '/')).map(k => ({ id: k.slice(coll.length + 1), exists: true, data: () => store[k], metadata: {} })); return docs; };
  const notify = (coll, ch) => subs.filter(s => s.c === coll).forEach(s => s.f({ docChanges: () => ch, metadata: { fromCache: false, hasPendingWrites: false }, docs: snapOf(coll) }));
  const db = { doc: p => ({ set: async d => { const c = p.split('/')[0]; if (window.__deny) { throw { code: 'invalid_argument' }; } const ex = p in store; store[p] = JSON.parse(JSON.stringify(d)); localStorage.setItem('fk', JSON.stringify(store)); window.__writes = (window.__writes || 0) + 1; notify(c, [{ type: ex ? 'modified' : 'added', doc: { id: p.slice(c.length + 1), data: () => store[p], metadata: {} } }]); }, delete: async () => { const c = p.split('/')[0]; delete store[p]; localStorage.setItem('fk', JSON.stringify(store)); notify(c, [{ type: 'removed', doc: { id: p.slice(c.length + 1), data: () => ({}), metadata: {} } }]); } }),
    collection: c => ({ onSnapshot: f => { subs.push({ c, f }); setTimeout(() => f({ docChanges: () => snapOf(c).map(d => ({ type: 'added', doc: d })), metadata: { fromCache: false }, docs: snapOf(c) }), 10); return () => { }; } }) };
  window.__ext = (p, d) => { const c = p.split('/')[0]; const ex = p in store; store[p] = d; localStorage.setItem('fk', JSON.stringify(store)); notify(c, [{ type: ex ? 'modified' : 'added', doc: { id: p.slice(c.length + 1), data: () => store[p], metadata: {} } }]); };
  window.claude = { use: async n => n === 'db' ? db : n === 'user' ? { canEdit: async () => window.__admin !== false, can: async () => window.__can !== false, id: async () => 'u1' } : null };
})();`;
(async () => {
  const b = await chromium.launch(); const errs = []; let n = 0; const ok = (c, m) => { n++; if (!c) errs.push(m); };
  const ctx = await b.newContext(); const p = await ctx.newPage();
  p.on('pageerror', e => errs.push('pageerror: ' + e.message));
  await p.addInitScript(fake); const url = 'file://' + path.join(__dirname, '../dist/KeToanPS.html');
  await p.goto(url); await p.waitForTimeout(700);
  ok(await p.evaluate(() => KT.dbMode && KT.role === 'quantri'), 'không vào chế độ db');
  ok(await p.evaluate(() => !!document.querySelector('#modal')), 'không hiện màn chào khi db trống');
  await p.evaluate(() => { KT.ui.closeModal(); KT.setState(KT.buildDemo()); KT.scheduleSave(); }); await p.waitForTimeout(2500);
  const nd = await p.evaluate(() => Object.keys(window.__store).length); ok(nd > 12, 'ghi quá ít tài liệu: ' + nd);
  const jl = await p.evaluate(() => KT.S.journal.length), B = await p.evaluate(() => JSON.stringify(KT.rep.b01 ? 1 : 1));
  const maxSize = await p.evaluate(() => Math.max(...Object.values(window.__store).map(d => d.j.length)));
  ok(maxSize < 250000, 'tài liệu quá lớn: ' + maxSize);
  await p.reload(); await p.waitForTimeout(900);
  ok(await p.evaluate(() => KT.S.journal.length) === jl, 'tải lại mất dòng sổ');
  ok(await p.evaluate(() => KT.S.payScale.length === 3 && KT.S.employees.length === 3), 'tải lại mất danh mục');
  // nhập nhanh bán hàng
  await p.evaluate(() => { KT.S.items[0].giaBan = 10000000; KT.S.items[0].tkDT = '5111'; const n = KT.ui.nn; n.loai = 'BAN'; n.ng = '2026-10-05'; n.dt = KT.S.partners.find(x => x.type === 'KH').code; n.lines = [{ vt: KT.S.items[0].code, sl: '2', gia: '', thue: '' }, { vt: '', sl: '', gia: '', thue: '' }]; KT.ui.go('nn'); });
  const prev = await p.evaluate(() => document.querySelector('#page').innerText); ok(/bút toán sẽ ghi sổ/i.test(prev) && /33311/.test(prev) && /632/.test(prev), 'xem trước nhập nhanh thiếu bút toán');
  const before = await p.evaluate(() => KT.S.journal.length); await p.evaluate(() => KT.ui.act.nnsave()); await p.waitForTimeout(1800);
  const add = await p.evaluate(() => KT.S.journal.length) - before; ok(add === 3, 'nhập nhanh sinh ' + add + ' dòng, cần 3');
  ok(await p.evaluate(() => KT.compute().issues.filter(i => i.sev === 'err').length) === 0, 'nhập nhanh gây lỗi sổ');
  // người khác sửa
  const oneJr = await p.evaluate(() => Object.keys(window.__store).find(k => k.startsWith('jr/2026-10')));
  await p.evaluate(k => { const d = JSON.parse(window.__store[k].j); d.l.push({ id: 'EXT1', ng: '2026-10-20', ct: 'PC26-9999', dg: 'Người khác nhập', no: '642', co: '111', st: 123000 }); window.__ext(k, { j: JSON.stringify(d) }); }, oneJr);
  await p.waitForTimeout(1200); ok(await p.evaluate(() => KT.S.journal.some(l => l.id === 'EXT1')), 'không nhận dữ liệu người khác nhập');
  // Ctrl+K
  await p.keyboard.press('Control+k'); await p.waitForTimeout(150); ok(await p.evaluate(() => !!document.querySelector('#cmdk')), 'Ctrl+K không mở');
  await p.keyboard.type('PC26-9999'); await p.waitForTimeout(150); ok(/Người khác nhập/.test(await p.evaluate(() => document.querySelector('#cmdk-list').innerText)), 'Ctrl+K không tìm thấy chứng từ');
  await p.keyboard.press('Enter'); await p.waitForTimeout(200); ok(await p.evaluate(() => KT.ui.at) === 'ps', 'Enter không mở sổ PS');
  // chỉ xem
  const p2 = await ctx.newPage(); p2.on('pageerror', e => errs.push('p2: ' + e.message));
  await p2.addInitScript('window.__can=false;window.__admin=false;'); await p2.addInitScript(fake); await p2.goto(url); await p2.waitForTimeout(900);
  ok(await p2.evaluate(() => KT.role === 'xem' && KT.readOnly), 'vai trò xem sai: ' + await p2.evaluate(() => KT.role));
  const w0 = await p2.evaluate(() => window.__writes || 0); await p2.evaluate(() => { KT.S.journal.pop(); KT.touch(true); }); await p2.waitForTimeout(1500);
  ok(await p2.evaluate(() => (window.__writes || 0)) === w0, 'người chỉ xem vẫn ghi được');
  ok(await p2.evaluate(() => KT.S.journal.some(l => l.id === 'EXT1')), 'người chỉ xem: thay đổi không được hoàn nguyên');
  // kế toán không sửa được cfg
  const p3 = await ctx.newPage(); p3.on('pageerror', e => errs.push('p3: ' + e.message));
  await p3.addInitScript('window.__admin=false;'); await p3.addInitScript(fake); await p3.goto(url); await p3.waitForTimeout(900);
  ok(await p3.evaluate(() => KT.role === 'ketoan'), 'vai trò kế toán sai');
  const nm = await p3.evaluate(() => KT.S.company.name); await p3.evaluate(() => { KT.S.company.name = 'SỬA TRÁI QUYỀN'; KT.touch(true); }); await p3.waitForTimeout(1800);
  ok(await p3.evaluate(() => KT.S.company.name) === nm, 'kế toán sửa được tên công ty (đáng lẽ chỉ Quản trị)');
  await b.close(); console.log((n - errs.length) + '/' + n + ' đạt'); if (errs.length) { console.log(errs.join('\n')); process.exit(1); }
})();
