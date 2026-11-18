// Xuất dữ liệu mẫu + số tham chiếu từ app để đối chiếu với Excel
const KT = require('../test/run.js'); const fs = require('fs');
const s = KT.buildDemo(); KT.setState(s); const L = KT.compute(); const S = KT.S;
const out = { company: S.company, legal: S.legal, accounts: S.accounts, partners: S.partners, items: S.items, orders: S.orders, employees: S.employees, assets: S.assets, prepaids: S.prepaids, opening: S.opening, payroll: S.payroll };
// dòng PS thủ công: bỏ các dòng tự sinh lương/KH/PB (Excel tự sinh); dòng có amt tự định giá thì để trống st nếu l.auto
const byId = new Map(L.lines.map(l => [l.id, l]));
const skipTag = t => /^auto-(bl|kh|pb):/.test(t || '');
out.journal = S.journal.filter(j => !skipTag(j.tag)).map(j => { const l = byId.get(j.id) || {}; const o = Object.assign({}, j);
  if (l.auto || l.derived) o._amt = l.amt; return o; });
out.skipped = S.journal.filter(j => skipTag(j.tag)).length;
const to = '2026-10-31', from = '2026-01-01';
const b1 = KT.rep.b01(to), b2 = KT.rep.b02(from, to), cd = KT.rep.cdps(from, to);
out.ref = { b01rows: b1.rows.map(r=>({t:r.t,ms:r.ms,c:r._cls})), b02rows: b2.rows.map(r=>({t:r.t,ms:r.ms,c:r._cls})), b01prev: KT.rep.b01(to,'2025-12-31').prev, cit: (()=>{const c=KT.tax.cit(2026);return {v:c.v,rate:c.rate,q:c.q.map(x=>({lnt:x.lnt,adjUp:x.adjUp,taxable:x.taxable,cum:x.cum,due:x.due}))}})(), b01: b1.cur, b02: b2.cur, cdpsKeys: Object.keys(cd), tax: {} };
const vs = KT.tax.vatSeries(to); out.ref.gtgt = vs.map(x => ({ key: x.per.key, v: x.r ? x.r.v : x.v }));
out.ref.pay = {}; for (let m = 1; m <= 10; m++) { const ym = '2026-' + String(m).padStart(2, '0'); const mo = KT.hr.month(ym); out.ref.pay[ym] = { n: mo.rows.length, T: mo.T, rows: mo.rows.map(r => ({ code: r.e.code, tong: r.c.tong, bhNLD: r.c.bhNLD, bhNSD: r.c.bhNSD, kpcd: r.c.kpcd, tncn: r.c.tncn, thucLinh: r.c.thucLinh, baseBH: r.c.baseBH })) }; }
fs.writeFileSync(__dirname + '/demo.json', JSON.stringify(out));
console.log('journal', out.journal.length, 'skipped', out.skipped, 'employees', out.employees.length, 'issues', L.issues.length);
console.log(Object.keys(out.ref.b01).length, JSON.stringify(out.ref.gtgt.slice(0, 1)).slice(0, 300));
//.slice(0, 900)); console.log(JSON.stringify(out.payroll['2026-03']).slice(0, 500)); console.log(JSON.stringify(out.opening.slice(0, 4)));
