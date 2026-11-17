// Servidor local sem dependências.
//   npm run dev      → serve o código-fonte (index.html + src/ + public/), sem service worker
//   npm run preview  → serve dist/ (versão de produção, com service worker e offline)
import { createServer } from 'node:http';
import { readFileSync, existsSync, statSync, readdirSync, createReadStream } from 'node:fs';
import { join, dirname, extname, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';
import { networkInterfaces } from 'node:os';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const mode = process.argv[2] === 'dist' ? 'dist' : 'dev';
const port = Number(process.env.PORT) || (mode === 'dist' ? 4173 : 5173);
const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.json': 'application/json', '.webmanifest': 'application/manifest+json', '.png': 'image/png', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml', '.mp4': 'video/mp4', '.ico': 'image/x-icon' };
if (mode === 'dist' && !existsSync(join(root, 'dist', 'index.html'))) { console.error('dist/ não existe. Rode "npm run build" antes.'); process.exit(1); }

function resolve(path) {
  if (path.includes('..')) return null;
  if (mode === 'dist') return join(root, 'dist', path === '/' ? 'index.html' : path);
  if (path === '/' || path === '/index.html') return join(root, 'index.html');
  if (path.startsWith('/src/')) return join(root, path);
  return join(root, 'public', path);
}
createServer((req, res) => {
  const path = normalize(decodeURIComponent(new URL(req.url, 'http://x').pathname)).replace(/\\/g, '/');
  if (mode === 'dev' && path === '/media.json') {
    const d = join(root, 'public', 'videos', 'exercises'), m = {};
    if (existsSync(d)) for (const f of readdirSync(d)) if (/\.mp4$/i.test(f)) m[f.replace(/\.mp4$/i, '')] = `videos/exercises/${f}`;
    res.writeHead(200, { 'Content-Type': MIME['.json'], 'Cache-Control': 'no-store' }); res.end(JSON.stringify(m)); return;
  }
  const file = resolve(path);
  if (!file || !existsSync(file) || !statSync(file).isFile()) { res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' }); res.end('Não encontrado'); return; }
  const size = statSync(file).size, head = { 'Content-Type': MIME[extname(file).toLowerCase()] || 'application/octet-stream', 'Cache-Control': 'no-cache', 'Accept-Ranges': 'bytes' };
  const m = /bytes=(\d*)-(\d*)/.exec(req.headers.range || '');
  if (m) {   // necessário para o Safari reproduzir vídeos
    const start = m[1] === '' ? Math.max(0, size - Number(m[2])) : Number(m[1]), end = m[1] !== '' && m[2] !== '' ? Math.min(size - 1, Number(m[2])) : size - 1;
    res.writeHead(206, { ...head, 'Content-Range': `bytes ${start}-${end}/${size}`, 'Content-Length': end - start + 1 });
    createReadStream(file, { start, end }).pipe(res); return;
  }
  res.writeHead(200, { ...head, 'Content-Length': size }); res.end(readFileSync(file));
}).listen(port, () => {
  console.log(`Projeto Evolução (${mode === 'dist' ? 'produção' : 'desenvolvimento'})`);
  console.log(`  Neste computador: http://localhost:${port}`);
  for (const list of Object.values(networkInterfaces())) for (const n of list || []) if (n.family === 'IPv4' && !n.internal) console.log(`  Na rede local:    http://${n.address}:${port}  (sem HTTPS: serve para ver as telas, não para instalar no iPhone)`);
  console.log('Pressione Ctrl+C para encerrar.');
});
