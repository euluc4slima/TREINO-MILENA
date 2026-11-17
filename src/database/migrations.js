'use strict';
/* Migrações do banco. Cada item roda uma única vez, em ordem, quando a versão instalada é anterior a "v".
   Migrações só acrescentam ou ajustam estrutura: nunca apagam registros pessoais. */
const MIGRATIONS = [
  { v: 1, note: 'Estrutura inicial', up(db) { for (const s of USER_STORES) db.createObjectStore(s, { keyPath: keyOf(s) }); } },
  {
    v: 2, note: 'Cópias de segurança internas e vídeo local por exercício', up(db, tx) {
      db.createObjectStore('backups', { keyPath: 'id' });
      const st = tx.objectStore('exercises'), rq = st.getAll();
      rq.onsuccess = () => { for (const e of rq.result) if (!e.video && DEFAULT_VIDEO[e.id]) { e.video = DEFAULT_VIDEO[e.id]; st.put(e); } };
    }
  }
];
function runMigrations(db, tx, oldVersion) { for (const m of MIGRATIONS) if (oldVersion < m.v) m.up(db, tx); }
