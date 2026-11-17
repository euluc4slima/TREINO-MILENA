import { test } from 'node:test';
import assert from 'node:assert/strict';
import { loadApp, fakeIndexedDB } from './helpers/app.mjs';

const J = (app, code) => JSON.parse(app(`JSON.stringify(${code})`));
const run = (app, code) => app(`(async () => { ${code} })()`);
const session = `{ id: 's1', name: 'Inferiores A', date: today(), startedAt: Date.now() - 3600000, endedAt: Date.now(), pauses: [], pausedAt: null, status: 'done', entries: [{ exId: 'smith', name: 'Agachamento no Smith', group: 'Quadríceps', planned: { sets: 1, repMin: 10, repMax: 12, rest: 90 }, sets: [{ w: 10, r: 12, done: true }], note: '' }], note: '' }`;

test('dados persistem: fechar e reabrir o app recupera tudo do banco', async () => {
  const a = await loadApp();
  await run(a, `await save('sessions', ${session}); await save('body', { id: 'b1', date: today(), weight: 47.6 }); const d = ensureDay(today()); setConsumed(d.meals[0].items[0], true); await save('days', d); S.kv.profile.name = 'Ana'; await kvSet('profile', S.kv.profile);`);
  const b = await loadApp({ disk: a.disk });           // nova "abertura" sobre o mesmo armazenamento
  assert.equal(J(b, 'S.kv.profile.name'), 'Ana');
  assert.deepEqual(J(b, '[doneSessions().length, currentWeight(), hasFoodLog(today())]'), [1, 47.6, true]);
  assert.equal(J(b, 'S.workouts.length'), 4, 'a configuração inicial não é duplicada na reabertura');
  assert.equal(J(b, 'S.exercises.length'), 21);
});
test('atualizar, excluir e limpar registros', async () => {
  const a = await loadApp();
  await run(a, `await save('body', { id: 'b1', date: '2026-01-01', weight: 47 }); await save('body', { id: 'b1', date: '2026-01-01', weight: 48 }); await save('body', { id: 'b2', date: '2026-01-08', weight: 48.2 }); await remove('body', 'b2');`);
  const b = await loadApp({ disk: a.disk });
  assert.deepEqual(J(b, 'S.body'), [{ id: 'b1', date: '2026-01-01', weight: 48 }]);
});
test('migração v1 → v2 preserva os dados, cria as cópias internas e associa vídeos', async () => {
  const idb = fakeIndexedDB();
  await new Promise(res => {                           // banco como a versão 1.0 do app o deixou
    const rq = idb.open('projeto-evolucao', 1);
    rq.onupgradeneeded = () => { for (const s of ['kv', 'exercises', 'workouts', 'sessions', 'foods', 'days', 'body', 'diary', 'photos']) rq.result.createObjectStore(s, { keyPath: s === 'kv' ? 'k' : (s === 'days' || s === 'diary') ? 'date' : 'id' }); };
    rq.onsuccess = () => { const tx = rq.result.transaction(); tx.objectStore('kv').put({ k: 'seeded', v: 1 }); tx.objectStore('kv').put({ k: 'profile', v: { name: 'Ana', startWeight: 47 } }); tx.objectStore('kv').put({ k: 'cycles', v: [{ id: 'c1', start: '2026-11-16' }] });
      tx.objectStore('exercises').put({ id: 'smith', name: 'Agachamento no Smith', group: 'Quadríceps', sec: [], rest: 90 }); tx.objectStore('exercises').put({ id: 'meu', name: 'Meu exercício', group: 'Glúteos', sec: [], rest: 60, custom: true });
      tx.objectStore('sessions').put({ id: 's1', status: 'done', date: '2026-11-16', startedAt: 1, endedAt: 2, pauses: [], entries: [] }); tx.oncomplete = res; };
  });
  const app = await loadApp({ disk: idb.disk });
  assert.equal(app.disk.get('projeto-evolucao').version, 2);
  assert.equal(J(app, 'S.kv.profile.name'), 'Ana'); assert.equal(J(app, 'S.sessions.length'), 1);
  assert.equal(J(app, `exById('smith').video`), 'agachamento-smith'); assert.equal(J(app, `exById('meu').custom`), true);
  assert.deepEqual(J(app, 'S.backups'), []);
  assert.equal(J(app, 'S.kv.cycles[0].id'), 'c1', 'o ciclo existente não é recriado');
});
test('backup: exportar, validar e restaurar devolve exatamente os mesmos dados', async () => {
  const a = await loadApp();
  await run(a, `await save('sessions', ${session}); await save('photos', { id: 'p1', date: today(), pose: 'Frente', data: 'data:image/jpeg;base64,AAAA' }); S.kv.goals.pMin = 85; await kvSet('goals', S.kv.goals);`);
  const json = a('JSON.stringify(snapshot(true))'), data = JSON.parse(json);
  assert.equal(data.app, 'projeto-evolucao'); assert.equal(data.photos.length, 1); assert.equal(data.backups, undefined);
  const b = await loadApp();                           // outro aparelho, banco novo
  b(`globalThis.__bk = ${json}`);
  assert.equal(J(b, 'validateBackup(__bk).ok'), true);
  await run(b, 'await restore(__bk);');
  assert.deepEqual(J(b, '[doneSessions().length, S.photos.length, S.kv.goals.pMin]'), [1, 1, 85]);
  const c = await loadApp({ disk: b.disk });
  assert.deepEqual(J(c, '[doneSessions().length, S.photos.length, S.kv.goals.pMin]'), [1, 1, 85], 'restauração gravada no banco');
});
test('backup sem fotos mantém as fotos que já estão no aparelho', async () => {
  const a = await loadApp();
  await run(a, `await save('photos', { id: 'p1', date: today(), pose: 'Frente', data: 'data:image/jpeg;base64,AAAA' });`);
  a(`globalThis.__bk = snapshot(false)`); assert.equal(J(a, '__bk.photos === undefined'), true);
  await run(a, `await save('sessions', ${session}); await restore(__bk);`);
  assert.deepEqual(J(a, '[S.photos.length, S.sessions.length]'), [1, 0]);
});
test('validação recusa arquivos inválidos sem tocar nos dados', async () => {
  const a = await loadApp();
  const v = code => J(a, `validateBackup(${code})`);
  assert.equal(v('null').ok, false); assert.equal(v('[]').ok, false);
  assert.match(v(`{ app: 'outro-app' }`).errors[0], /não é um backup/);
  a(`globalThis.__ok = snapshot(true)`);
  assert.equal(v('__ok').ok, true);
  assert.match(v(`{ ...__ok, schema: 99 }`).errors[0], /versão mais nova/);
  assert.equal(v(`{ ...__ok, sessions: 'x' }`).ok, false);
  assert.equal(v(`{ ...__ok, sessions: [{ id: 1 }] }`).ok, false);
  assert.equal(v(`{ ...__ok, photos: [{ id: 'p', data: 'http://site/foto.jpg' }] }`).ok, false);
  assert.equal(v(`{ ...__ok, days: [{ date: 'ontem' }] }`).ok, false);
  await assert.rejects(run(a, `await restore({ app: 'outro-app' });`));
  assert.equal(J(a, 'S.workouts.length'), 4, 'dados intactos após tentativa inválida');
});
test('cópias de segurança internas: criar, limitar a 5 e restaurar', async () => {
  const a = await loadApp();
  await run(a, `await save('sessions', ${session}); await makeLocalCopy('Cópia manual'); await remove('sessions', 's1');`);
  assert.equal(J(a, 'S.sessions.length'), 0);
  await run(a, `await restore(S.backups[0].data);`);
  assert.equal(J(a, 'S.sessions.length'), 1); assert.equal(J(a, 'S.backups.length'), 1, 'restaurar não apaga as cópias');
  await run(a, `for (let i = 0; i < 7; i++) { await makeLocalCopy('c' + i); await new Promise(r => setTimeout(r, 2)); }`);
  assert.equal(J(a, 'S.backups.length'), 5);
  const b = await loadApp({ disk: a.disk }); assert.equal(J(b, 'S.backups.length'), 5);
});
test('edição de treino concluído preserva o registro original', async () => {
  const a = await loadApp();
  await run(a, `await save('sessions', ${session}); mutSession('s1', se => { se.entries[0].sets[0].r = 11; });`);
  assert.deepEqual(J(a, `[sessionById('s1').entries[0].sets[0].r, sessionById('s1').original.entries[0].sets[0].r, !!sessionById('s1').editedAt]`), [11, 12, true]);
});
test('falta de espaço é reconhecida como erro de armazenamento', async () => {
  const a = await loadApp();
  assert.equal(J(a, `DB.isQuota({ name: 'QuotaExceededError' })`), true); assert.equal(J(a, `DB.isQuota(new Error('outra coisa'))`), false);
  a.disk.get('projeto-evolucao').failPut = true;
  await run(a, `await save('body', { id: 'x', date: today(), weight: 50 });`);
  assert.equal(J(a, 'DB.isQuota(DB.lastError)'), true, 'o erro é capturado e sinalizado, sem derrubar o app');
});
