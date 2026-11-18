/* ===== KHỞI ĐỘNG ===== */
(function (G) {
'use strict';
const KT = G.KT, UI = KT.ui;
KT.on(() => UI.render());
G.addEventListener('hashchange', () => { const id = location.hash.slice(1); if (id && UI.routes[id] && id !== UI.at) UI.go(id); });
G.addEventListener('beforeunload', () => { try { KT.saveNow(); } catch (e) { } });
G.addEventListener('error', e => { console.error(e.error || e.message); });
(async function () {
  let had = false; try { had = await KT.initStore(); } catch (e) { console.error(e); }
  UI.initPer(); const id = location.hash.slice(1); UI.at = UI.routes[id] ? id : 'dash'; KT.onSaved = () => { };
  UI.render();
  if (KT.dbMode && KT.sync && KT.sync.empty) UI.welcome();
})();
})(window);
