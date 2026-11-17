'use strict';
/* Service Worker: registro, atualização segura e verificação manual. Só é ativado na versão gerada por "npm run build". */
let swReg = null;
function setupSW() {
  if (!('serviceWorker' in navigator) || !/^https?:$/.test(location.protocol) || !document.documentElement.dataset.build) return;
  const had = !!navigator.serviceWorker.controller;
  const ask = w => toast('Nova versão disponível. Seus dados são mantidos.', { label: 'Atualizar', fn: () => w.postMessage('skip') });
  navigator.serviceWorker.register('sw.js').then(reg => {
    swReg = reg;
    if (reg.waiting && navigator.serviceWorker.controller) ask(reg.waiting);
    reg.addEventListener('updatefound', () => { const w = reg.installing; if (w) w.addEventListener('statechange', () => { if (w.state === 'installed' && navigator.serviceWorker.controller) ask(w); }); });
  }).catch(e => console.warn('service worker não registrado', e));
  let reloaded = false;
  navigator.serviceWorker.addEventListener('controllerchange', () => { if (!had || reloaded) return; reloaded = true; location.reload(); });
}
const offlineReady = async () => { try { if (!swReg) return false; const keys = await caches.keys(); return !!swReg.active && keys.some(k => k.startsWith('pe-precache-')); } catch (e) { return false; } };
A.checkUpdate = async () => {
  if (!swReg) { toast('Atualização automática disponível apenas na versão publicada.'); return; }
  if (!ONLINE) { toast('Sem conexão para verificar atualização.'); return; }
  try { await swReg.update(); if (!swReg.installing && !swReg.waiting) toast('Você já está na versão mais recente.'); } catch (e) { toast('Não foi possível verificar agora.'); }
};
