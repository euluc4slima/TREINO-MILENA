'use strict';
/* Demonstração dos exercícios: vídeo local (offline) quando existir, pesquisa no YouTube quando houver conexão,
   ou ilustração e instruções escritas. Nenhum vídeo é inventado: só aparecem arquivos realmente presentes em public/videos/exercises/. */
const MEDIA_CACHE = 'pe-media-v1';
let MEDIA = {};                       // { "agachamento-smith": "videos/exercises/agachamento-smith.mp4" }
const MEDIA_CACHED = new Set();       // arquivos já guardados para uso offline
let ONLINE = typeof navigator !== 'undefined' ? navigator.onLine !== false : true;
const slugify = s => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/\.mp4$/, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const videoSlug = e => e ? (e.video || DEFAULT_VIDEO[e.id] || '') : '';
const videoFile = e => MEDIA[videoSlug(e)] || null;
/* offline = vídeo local guardado · local = vídeo local ainda não guardado · online = só pesquisa no YouTube · none = sem demonstração */
function demoState(e) {
  const f = videoFile(e);
  if (f && MEDIA_CACHED.has(f)) return 'offline';
  if (f && ONLINE) return 'local';
  return ONLINE ? 'online' : 'none';
}
const DEMO_LABEL = { offline: ['Disponível offline', 'done'], local: ['Vídeo local · salvando para uso offline', 'planned'], online: ['Disponível apenas online', 'planned'], none: ['Sem demonstração cadastrada', ''] };
function demoBtn(exId, name, inSheet) {
  const e = exById(exId), st = demoState(e), [label, cls] = DEMO_LABEL[st];
  const btn = (st === 'offline' || st === 'local') ? `<button class="btn video" data-a="videoPlay" data-id="${esc(exId)}">${ic('video', 20)} ASSISTIR À EXECUÇÃO</button>`
    : st === 'online' ? `<a class="btn video" href="${ytUrl(name)}" target="_blank" rel="noopener">${ic('video', 20)} ASSISTIR À EXECUÇÃO</a>`
      : (inSheet || !e) ? '' : `<button class="btn video" data-a="exSheet" data-id="${esc(exId)}">${ic('info', 20)} VER INSTRUÇÕES DE EXECUÇÃO</button>`;
  return `<div class="demo">${btn}<span class="pill ${cls}">${label}${st === 'none' ? ' · use a ilustração e as instruções' : ''}</span></div>`;
}
A.videoPlay = d => {
  const e = exById(d.id), f = videoFile(e); if (!f) { toast('Vídeo local não encontrado.'); return; }
  openSheet(`<h2>${esc(e.name)}</h2><video class="demov" src="${esc(f)}" controls playsinline preload="metadata"></video><p class="mut sm">${MEDIA_CACHED.has(f) ? 'Vídeo guardado neste aparelho: funciona sem internet.' : 'Vídeo ainda não guardado para uso offline.'}</p>
    <div class="stack">${ONLINE ? `<a class="btn ghost" href="${ytUrl(e.name)}" target="_blank" rel="noopener">Pesquisar outras referências no YouTube</a>` : ''}<button class="btn ghost" data-a="exSheet" data-id="${esc(e.id)}">Ver instruções escritas</button><button class="btn" data-a="closeSheet">Fechar</button></div>`);
};
const quietRender = () => { const a = document.activeElement; if (!(a && /INPUT|TEXTAREA|SELECT/.test(a.tagName)) && !$('#sheet').classList.contains('on')) render(); };
/* Lê a lista de vídeos locais gerada no build e guarda cada um no aparelho para uso offline. */
async function loadMedia() {
  try { const r = await fetch('media.json'); if (r.ok) MEDIA = await r.json(); } catch (e) { MEDIA = MEDIA || {}; }
  if (!('caches' in window)) return;
  const files = Object.values(MEDIA); let changed = false;
  try {
    const cache = await caches.open(MEDIA_CACHE);
    for (const f of files) if (await cache.match(f)) { MEDIA_CACHED.add(f); changed = true; }
    if (changed) quietRender();
    if (!ONLINE || !document.documentElement.dataset.build) return;
    for (const f of files) {
      if (MEDIA_CACHED.has(f)) continue;
      try { await cache.add(f); MEDIA_CACHED.add(f); quietRender(); } catch (e) { if (DB.isQuota(e)) { toast('Sem espaço para guardar todos os vídeos offline.'); break; } }
    }
    for (const k of await cache.keys()) if (!files.some(f => k.url.endsWith('/' + f))) cache.delete(k);   // remove vídeos que saíram do app
  } catch (e) { console.warn('mídia offline indisponível', e); }
}
window.addEventListener('online', () => { ONLINE = true; quietRender(); loadMedia(); });
window.addEventListener('offline', () => { ONLINE = false; toast('Sem conexão: o app continua funcionando offline.'); quietRender(); });
