// Gera a versão de produção em dist/ usando apenas o Node (sem dependências).
// - junta os scripts de src/ em um único arquivo com nome versionado pelo conteúdo
// - copia public/ (ícones, manifest, offline.html, vídeos locais)
// - gera media.json (vídeos encontrados) e sw.js (lista de precache + versão automática)
import { readFileSync, writeFileSync, mkdirSync, rmSync, cpSync, readdirSync, statSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { join, dirname, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..'), dist = join(root, 'dist');
const read = p => readFileSync(join(root, p), 'utf8');
const hash = b => createHash('sha256').update(b).digest('hex').slice(0, 10);
const walk = d => readdirSync(d).flatMap(n => { const p = join(d, n); return statSync(p).isDirectory() ? walk(p) : [p]; });

rmSync(dist, { recursive: true, force: true });
mkdirSync(join(dist, 'assets'), { recursive: true });
cpSync(join(root, 'public'), dist, { recursive: true, filter: s => !/\.(md|gitkeep)$/i.test(s) && !/\.DS_Store$/.test(s) });

let html = read('index.html');
const scripts = [...html.matchAll(/<script src="(src\/[^"]+)"><\/script>\r?\n?/g)];
if (!scripts.length) throw new Error('Nenhum script encontrado em index.html');
const js = "'use strict';\n" + scripts.map(m => `/* ---- ${m[1]} ---- */\n` + read(m[1]).replace(/^'use strict';\r?\n/, '')).join('\n');
const css = read('src/styles/app.css');
const jsName = `assets/app.${hash(js)}.js`, cssName = `assets/app.${hash(css)}.css`;
writeFileSync(join(dist, jsName), js);
writeFileSync(join(dist, cssName), css);
scripts.forEach((m, i) => { html = html.replace(m[0], i === 0 ? `<script src="${jsName}"></script>\n` : ''); });
html = html.replace('href="src/styles/app.css"', `href="${cssName}"`);

// vídeos locais realmente presentes
const vdir = join(dist, 'videos', 'exercises'), media = {};
if (existsSync(vdir)) for (const f of readdirSync(vdir)) if (/\.mp4$/i.test(f)) media[f.replace(/\.mp4$/i, '')] = `videos/exercises/${f}`;
writeFileSync(join(dist, 'media.json'), JSON.stringify(media));

// precache: tudo, exceto vídeos (guardados sob demanda em cache próprio) e arquivos de configuração do servidor
const files = walk(dist).map(p => relative(dist, p).split(sep).join('/')).filter(p => !/\.mp4$/i.test(p) && p !== '_headers' && p !== 'sw.js' && p !== 'index.html').concat('index.html').sort();
const version = hash(files.filter(f => f !== 'index.html').map(f => f + hash(readFileSync(join(dist, f)))).join('|') + hash(html));
html = html.replace('<html lang="pt-BR"', `<html lang="pt-BR" data-build="${version}"`);
writeFileSync(join(dist, 'index.html'), html);
const sw = read('src/sw.js').replace("'__VERSION__'", JSON.stringify(version)).replace('/*__PRECACHE__*/', ['./', ...files].map(f => JSON.stringify(f)).join(', '));
if (sw.includes('__VERSION__') || sw.includes('__PRECACHE__')) throw new Error('Falha ao preencher o service worker');
writeFileSync(join(dist, 'sw.js'), sw);

const total = walk(dist).reduce((a, p) => a + statSync(p).size, 0);
console.log(`Build ${version} concluído em dist/`);
console.log(`  ${files.length} arquivos no precache · ${Object.keys(media).length} vídeo(s) local(is) · ${(total / 1024).toFixed(0)} KB no total`);
