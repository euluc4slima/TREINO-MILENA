import { test } from 'node:test';
import assert from 'node:assert/strict';
import { loadApp } from './helpers/app.mjs';

const app = await loadApp();
const J = code => JSON.parse(app(`JSON.stringify(${code})`));

test('configuração inicial: 4 treinos, 21 exercícios, 5 refeições e metas do plano', () => {
  assert.deepEqual(J('[S.workouts.length, S.exercises.length, S.kv.mealPlan.length]'), [4, 21, 5]);
  assert.deepEqual(J('S.workouts.map(w => w.items.reduce((a, i) => a + i.sets, 0))'), [15, 15, 15, 15]);
  assert.deepEqual(J('[S.kv.goals.pMin, S.kv.goals.pMax, S.kv.goals.kcalMin, S.kv.goals.kcalMax]'), [80, 90, 1800, 1900]);
  assert.deepEqual(J('S.kv.schedule'), { 0: '', 1: 'w-infA', 2: 'w-supA', 3: '', 4: 'w-infB', 5: '', 6: 'w-supB' });
});
test('todo exercício do plano existe na biblioteca e tem vídeo associado por nome', () => {
  assert.equal(J('S.workouts.every(w => w.items.every(i => !!exById(i.exId)))'), true);
  assert.equal(J('S.exercises.every(e => /^[a-z0-9-]+$/.test(videoSlug(e)))'), true);
  assert.equal(J("videoSlug(exById('smith'))"), 'agachamento-smith');
});
test('duração do treino desconta pausas e usa horários reais', () => {
  const d = J(`sessionDur({ startedAt: 1000, endedAt: 3601000, pauses: [{ s: 100000, e: 400000 }], pausedAt: null })`);
  assert.equal(d, 3600000 - 300000);
  assert.equal(J(`sessionDur({ startedAt: 0, endedAt: null, pausedAt: 60000, pauses: [] }, 999999)`), 60000, 'pausado: o tempo para de contar');
  assert.equal(J(`sessionDur({ startedAt: 0, endedAt: null, pausedAt: null, pauses: [] }, 90000)`), 90000, 'em andamento: calculado pelo relógio');
});
test('descanso: tempo restante vem do horário de término, não de um contador', () => {
  app(`S.kv.rest = { state: 'run', dur: 90, endAt: Date.now() + 42000 }`);
  const l = J('Rest.left()'); assert.ok(l > 41000 && l <= 42000);
  app(`S.kv.rest = { state: 'pause', dur: 90, remaining: 30000 }`); assert.equal(J('Rest.left()'), 30000);
  app(`S.kv.rest = { state: 'idle', dur: 90 }`);
});
test('séries não concluídas não contam em volume nem estatísticas', () => {
  const st = J(`sessionStats({ startedAt: 0, endedAt: 1, pauses: [], entries: [
    { name: 'A', sets: [{ w: 10, r: 12, done: true }, { w: 10, r: 11, done: true }, { w: 50, r: 20, done: false }] },
    { name: 'B', sets: [{ w: null, r: null, done: false }] }] })`);
  assert.equal(st.vol, 230); assert.equal(st.setsDone, 2); assert.equal(st.setsTotal, 4); assert.equal(st.exDone, 1);
  assert.deepEqual(st.pending, [{ name: 'A', n: 1 }, { name: 'B', n: 1 }]);
});
test('progressão: +2 repetições com a mesma carga; aumento de carga; nunca altera carga sozinha', () => {
  const e = (w, r) => `{ planned: { sets: 1, repMax: 12 }, sets: [{ w: ${w}, r: ${r}, done: true }] }`;
  assert.equal(J(`progressMsg(${e(10, 12)}, ${e(10, 10)})`).t, 'Evolução de desempenho: +2 repetições.');
  assert.match(J(`progressMsg(${e(12, 10)}, ${e(10, 12)})`).t, /\+2 kg de carga/);
  assert.equal(J(`progressMsg(${e(10, 12)}, null)`), null);
});
test('sugestão de aumento só quando todas as séries planejadas atingem o topo da faixa', () => {
  const mk = sets => `topRange({ planned: { sets: 3, repMax: 12 }, sets: ${JSON.stringify(sets)} })`;
  assert.equal(J(mk([{ r: 12, done: true }, { r: 12, done: true }, { r: 12, done: true }])), true);
  assert.equal(J(mk([{ r: 12, done: true }, { r: 11, done: true }, { r: 12, done: true }])), false);
  assert.equal(J(mk([{ r: 12, done: true }, { r: 12, done: true }, { r: 12, done: false }])), false);
});
test('alimentos planejados não contam como consumidos', () => {
  const t = J(`sumNut([{ items: [{ foodId: 'frango', qty: 100, consumed: true }, { foodId: 'arroz', qty: 150, consumed: false }] }], true)`);
  assert.equal(t.n, 1); assert.equal(t.p, 32); assert.equal(t.kcal, 159);
  const all = J(`sumNut([{ items: [{ foodId: 'frango', qty: 100, consumed: true }, { foodId: 'arroz', qty: 150, consumed: false }] }], false)`);
  assert.equal(Math.round(all.kcal), 351);
  assert.equal(J('dayTotals(today()).kcal'), 0, 'dia sem registro: nada consumido');
});
test('consumo registrado guarda os valores do momento (histórico não muda se o alimento for editado)', () => {
  assert.equal(J(`itemNut({ foodId: 'frango', qty: 100, consumed: true, n: { kcal: 1, p: 2, c: 3, f: 4 } }).p`), 2);
});
test('ciclo de 12 semanas: semana e fase corretas', () => {
  app(`S.kv.cycles = [{ id: 'c', start: addDays(today(), -30) }]`);
  const c = J('cycleInfo()'); assert.equal(c.week, 5); assert.equal(c.phase.n, 2); assert.equal(c.over, false);
  app(`S.kv.cycles = [{ id: 'c', start: addDays(today(), -90) }]`); assert.equal(J('cycleInfo().over'), true);
  app(`S.kv.cycles = [{ id: 'c', start: mondayOf(today()) }]`); assert.equal(J('cycleInfo().week'), 1);
});
test('link de referência é uma pesquisa do YouTube, nunca um vídeo específico', () => {
  const u = J(`ytUrl('Agachamento no Smith')`);
  assert.ok(u.startsWith('https://www.youtube.com/results?search_query=')); assert.ok(!u.includes('watch?v='));
});
test('demonstração: estados offline / apenas online / sem demonstração', () => {
  app(`MEDIA = {}; MEDIA_CACHED.clear(); ONLINE = true`); assert.equal(J(`demoState(exById('smith'))`), 'online');
  app(`ONLINE = false`); assert.equal(J(`demoState(exById('smith'))`), 'none');
  app(`MEDIA = { 'agachamento-smith': 'videos/exercises/agachamento-smith.mp4' }`); assert.equal(J(`demoState(exById('smith'))`), 'none', 'vídeo existe no servidor mas não foi guardado e não há conexão');
  app(`MEDIA_CACHED.add('videos/exercises/agachamento-smith.mp4')`); assert.equal(J(`demoState(exById('smith'))`), 'offline');
  app(`MEDIA = {}; MEDIA_CACHED.clear(); ONLINE = true`);
});
test('CSV usa ; como separador, vírgula decimal e protege aspas', () => {
  assert.equal(J(`toCSV([['a', 'b'], [1.5, 'x;"y"']])`), '﻿a;b\r\n1,5;"x;""y"""');
});
test('unidades: conversão kg ↔ lb sem perder o valor original', () => {
  app(`S.kv.settings.unitW = 'lb'`); assert.ok(Math.abs(J('U.wIn(U.w(47.5))') - 47.5) < 1e-9); app(`S.kv.settings.unitW = 'kg'`);
});
