/* Service Worker do Projeto Evolução (modelo). "npm run build" gera dist/sw.js preenchendo a versão e a lista de arquivos.
   Estratégia: precache de todo o app + Cache First. Nenhuma rota depende de rede depois da instalação. */
const VERSION = '__VERSION__';
const PRECACHE = 'pe-precache-' + VERSION, RUNTIME = 'pe-runtime', MEDIA = 'pe-media-v1';
const FILES = [/*__PRECACHE__*/];

self.addEventListener('install', e => e.waitUntil(
  caches.open(PRECACHE).then(c => c.addAll(FILES.map(u => new Request(u, { cache: 'reload' }))))
));
self.addEventListener('activate', e => e.waitUntil(
  caches.keys()
    .then(keys => Promise.all(keys.filter(k => (k.startsWith('pe-precache-') && k !== PRECACHE) || k.startsWith('projeto-evolucao-')).map(k => caches.delete(k))))
    .then(() => self.clients.claim())
));
self.addEventListener('message', e => { if (e.data === 'skip') self.skipWaiting(); });

/* Vídeo local: o Safari pede trechos do arquivo (Range). Respondemos a partir da cópia completa guardada. */
async function ranged(req) {
  const full = await caches.match(req.url, { ignoreSearch: true });
  if (!full) return fetch(req);
  const buf = await full.arrayBuffer(), m = /bytes=(\d*)-(\d*)/.exec(req.headers.get('range') || '');
  let start = 0, end = buf.byteLength - 1;
  if (m) { if (m[1] === '') start = Math.max(0, buf.byteLength - Number(m[2])); else { start = Number(m[1]); if (m[2] !== '') end = Math.min(end, Number(m[2])); } }
  if (start > end || start >= buf.byteLength) return new Response(null, { status: 416, headers: { 'Content-Range': `bytes */${buf.byteLength}` } });
  return new Response(buf.slice(start, end + 1), { status: 206, headers: { 'Content-Type': full.headers.get('Content-Type') || 'video/mp4', 'Content-Range': `bytes ${start}-${end}/${buf.byteLength}`, 'Content-Length': String(end - start + 1), 'Accept-Ranges': 'bytes' } });
}
self.addEventListener('fetch', e => {
  const req = e.request, url = new URL(req.url);
  if (req.method !== 'GET' || url.origin !== location.origin) return;         // nada externo passa pelo app
  if (req.headers.has('range')) { e.respondWith(ranged(req)); return; }
  if (req.mode === 'navigate') {
    e.respondWith(caches.match('index.html').then(hit => hit || fetch(req)).catch(() => caches.match('offline.html')));
    return;
  }
  e.respondWith(caches.match(req, { ignoreSearch: true }).then(hit => hit || fetch(req).then(res => {
    if (res.ok && res.type === 'basic' && !url.pathname.endsWith('.mp4')) { const copy = res.clone(); caches.open(RUNTIME).then(c => c.put(req, copy)); }
    return res;
  }).catch(() => Response.error())));
});
self.addEventListener('notificationclick', e => {
  e.notification.close();
  e.waitUntil(self.clients.matchAll({ type: 'window' }).then(cs => cs.length ? cs[0].focus() : self.clients.openWindow('./')));
});
