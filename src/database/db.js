'use strict';
/* Acesso ao IndexedDB e espelho dos dados em memória (S). Toda alteração é gravada imediatamente. */
const DB = {
  db: null, mem: false, lastError: null,
  open() {
    return new Promise(res => {
      try {
        const rq = indexedDB.open(DB_NAME, DB_VERSION);
        rq.onupgradeneeded = e => runMigrations(rq.result, rq.transaction, e.oldVersion);
        rq.onsuccess = () => { DB.db = rq.result; DB.db.onversionchange = () => DB.db.close(); res(true); };
        rq.onerror = () => { DB.mem = true; DB.lastError = rq.error; res(false); };
      } catch (e) { DB.mem = true; DB.lastError = e; res(false); }
    });
  },
  tx(store, mode, fn) {
    if (DB.mem) return Promise.resolve([]);
    return new Promise((res, rej) => {
      let tx; try { tx = DB.db.transaction(store, mode); } catch (e) { rej(e); return; }
      const out = fn(tx.objectStore(store));
      tx.oncomplete = () => res(out && out.result); tx.onerror = () => rej(tx.error); tx.onabort = () => rej(tx.error);
    });
  },
  all: s => DB.tx(s, 'readonly', o => o.getAll()),
  put: (s, v) => DB.tx(s, 'readwrite', o => o.put(v)).catch(DB.fail),
  del: (s, k) => DB.tx(s, 'readwrite', o => o.delete(k)).catch(DB.fail),
  clear: s => DB.tx(s, 'readwrite', o => o.clear()).catch(DB.fail),
  isQuota: e => !!e && (e.name === 'QuotaExceededError' || /quota|space|espa/i.test(e.message || '')),
  fail(e) {
    console.error(e); DB.lastError = e;
    toast(DB.isQuota(e) ? 'Sem espaço no aparelho para salvar. Exporte um backup e libere espaço (fotos ocupam mais).' : 'Erro ao salvar os dados. Tente de novo; se continuar, exporte um backup em Perfil.');
  }
};

const S = { kv: {}, exercises: [], workouts: [], sessions: [], foods: [], days: {}, body: [], diary: {}, photos: [], backups: [] };
const isMap = s => s === 'days' || s === 'diary';
function kvSet(k, v) { S.kv[k] = v; return DB.put('kv', { k, v }); }
function save(store, obj) {
  if (isMap(store)) S[store][obj.date] = obj;
  else { const a = S[store], i = a.findIndex(x => x.id === obj.id); if (i >= 0) a[i] = obj; else a.push(obj); }
  return DB.put(store, obj);
}
function remove(store, key) {
  if (isMap(store)) delete S[store][key]; else S[store] = S[store].filter(x => x.id !== key);
  return DB.del(store, key);
}
async function loadAll() {
  for (const s of STORES) {
    const rows = (await DB.all(s)) || [];
    if (s === 'kv') { S.kv = {}; rows.forEach(r => S.kv[r.k] = r.v); }
    else if (isMap(s)) { S[s] = {}; rows.forEach(r => S[s][r.date] = r); }
    else S[s] = rows;
  }
}
