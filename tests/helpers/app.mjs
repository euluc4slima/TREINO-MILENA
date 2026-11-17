// Carrega o código do aplicativo no Node com um IndexedDB em memória, para testar banco e cálculos sem navegador.
import vm from 'node:vm';
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { webcrypto } from 'node:crypto';

const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const copy = v => v === undefined ? undefined : JSON.parse(JSON.stringify(v));

/* IndexedDB mínimo e assíncrono: versões, onupgradeneeded, stores com keyPath, getAll/get/put/delete/clear */
export function fakeIndexedDB(disk = new Map()) {
  const request = (tx, fn) => { const rq = {}; tx.pending++; setTimeout(() => { try { rq.result = fn(); if (rq.onsuccess) rq.onsuccess({ target: rq }); } catch (err) { tx.error = err; tx.done = true; if (tx.onerror) tx.onerror(); } finally { tx.pending--; tx.settle(); } }); return rq; };
  const makeTx = (dbRec) => {
    const tx = { pending: 0, done: false, settle() { if (!tx.pending && !tx.done) setTimeout(() => { if (!tx.pending && !tx.done) { tx.done = true; if (tx.oncomplete) tx.oncomplete(); } }); },
      objectStore(name) {
        const st = dbRec.stores.get(name); if (!st) throw new Error('store inexistente: ' + name);
        return { getAll: () => request(tx, () => [...st.rows.values()].map(copy)), get: k => request(tx, () => copy(st.rows.get(k))),
          put: v => request(tx, () => { if (dbRec.failPut) throw Object.assign(new Error('quota'), { name: 'QuotaExceededError' }); st.rows.set(v[st.keyPath], copy(v)); }),
          delete: k => request(tx, () => { st.rows.delete(k); }), clear: () => request(tx, () => { st.rows.clear(); }) };
      } };
    setTimeout(() => tx.settle());
    return tx;
  };
  return { disk, open(name, version) {
    const rq = {};
    setTimeout(() => {
      let rec = disk.get(name); if (!rec) { rec = { version: 0, stores: new Map() }; disk.set(name, rec); }
      const db = { close() { }, createObjectStore(n, o) { rec.stores.set(n, { keyPath: o.keyPath, rows: new Map() }); }, transaction: () => makeTx(rec), objectStoreNames: { contains: n => rec.stores.has(n) } };
      rq.result = db;
      const finish = () => { if (rq.onsuccess) rq.onsuccess({ target: rq }); };
      if (version > rec.version) { const old = rec.version; rec.version = version; const tx = makeTx(rec); rq.transaction = tx; tx.oncomplete = finish; rq.onupgradeneeded({ oldVersion: old, target: rq }); }
      else finish();
    });
    return rq;
  } };
}

/* Cria uma instância isolada do app. Retorna um avaliador: app('expressão') devolve o valor dentro do app. */
export async function loadApp({ disk, boot = true } = {}) {
  const idb = fakeIndexedDB(disk);
  const el = () => ({ classList: { add() { }, remove() { }, toggle() { }, contains: () => false }, dataset: {}, style: {}, innerHTML: '' });
  const sandbox = { console, setTimeout, clearTimeout, setInterval: () => 0, clearInterval() { }, Date, Math, JSON, Promise, URL, Blob, indexedDB: idb, crypto: webcrypto,
    navigator: { onLine: true }, location: { protocol: 'http:' },
    document: { addEventListener() { }, querySelector: () => null, querySelectorAll: () => [], documentElement: el(), body: el(), activeElement: null, visibilityState: 'visible', createElement: el } };
  sandbox.window = sandbox; sandbox.addEventListener = () => { }; sandbox.matchMedia = () => ({ matches: false, addEventListener() { } });
  const ctx = vm.createContext(sandbox);
  const html = readFileSync(join(root, 'index.html'), 'utf8');
  for (const m of html.matchAll(/<script src="(src\/[^"]+)"><\/script>/g)) {
    if (m[1] === 'src/main.js') continue;   // sem interface nos testes
    vm.runInContext(readFileSync(join(root, m[1]), 'utf8'), ctx, { filename: m[1] });
  }
  const app = code => vm.runInContext(code, ctx);
  if (boot) await app('(async () => { await DB.open(); await loadAll(); await seedIfNeeded(); })()');
  app.disk = idb.disk;
  return app;
}
