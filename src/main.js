'use strict';
/* Inicialização do aplicativo */
(async function init() {
  try {
    await DB.open(); await loadAll(); await seedIfNeeded(); applyTheme();
    render(); checkReminders();
    if (DB.mem) toast('Armazenamento local indisponível neste navegador: os dados não serão salvos.');
    Store.init().then(refreshBackupInfo);
    loadMedia();
  } catch (e) {
    console.error(e);
    $('#view').innerHTML = `<div class="card"><h2>Não foi possível iniciar</h2><p>Feche e abra o app novamente. Seus dados não foram apagados.</p><p class="mut sm">${esc(e.message)}</p></div>`;
  }
  $('#splash').classList.add('off');
  setTimeout(() => { const sp = $('#splash'); if (sp) sp.remove(); }, 600);
  setupSW();
  if (navigator.serviceWorker) navigator.serviceWorker.ready.then(() => setTimeout(refreshBackupInfo, 1500)).catch(() => { });
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => { if (S.kv.settings) applyTheme(); });
})();
/* Cronômetros recalculam a partir do horário real a cada atualização e ao voltar do segundo plano */
setInterval(tick, 250);
setInterval(() => { if (S.kv.seeded) checkReminders(); }, 30000);
document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible' && S.kv.seeded) { tick(); checkReminders(); keepAwake(cur().v === 'session'); } });
