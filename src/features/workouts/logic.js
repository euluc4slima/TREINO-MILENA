'use strict';
/* Treinos: sessões, séries, progressão e recordes — sempre a partir de dados reais registrados */
const exById = id => S.exercises.find(e => e.id === id);
const workoutById = id => S.workouts.find(w => w.id === id);
const sessionById = id => S.sessions.find(s => s.id === id);
const activeSession = () => S.sessions.find(s => s.status === 'active');
const doneSessions = () => S.sessions.filter(s => s.status === 'done').sort((a, b) => a.startedAt - b.startedAt);
const repLabel = p => ((!p.repMax || p.repMin === p.repMax) ? `${p.repMin}` : `${p.repMin}–${p.repMax}`) + (p.repNote ? ` ${p.repNote}` : '');
const ytUrl = name => 'https://www.youtube.com/results?search_query=' + encodeURIComponent(`execução correta ${name} técnica como fazer`).replace(/%20/g, '+');
const estMin = w => Math.max(10, Math.round((8 * 60 + w.items.reduce((a, i) => a + i.sets * (45 + (i.rest || 60)), 0)) / 300) * 5);

/* ----- sessões ----- */
function newSession(w) {
  return {
    id: uid(), workoutId: w.id, name: w.name, focus: w.focus, date: today(), startedAt: Date.now(), endedAt: null,
    pauses: [], pausedAt: null, status: 'active', idx: 0, cycleId: curCycle().id, note: '',
    entries: w.items.filter(i => exById(i.exId)).map(i => {
      const e = exById(i.exId);
      return { exId: i.exId, name: e.name, group: e.group, planned: { sets: i.sets, repMin: i.repMin, repMax: i.repMax, repNote: i.repNote || '', rest: i.rest || e.rest || 60 }, sets: Array.from({ length: i.sets }, () => ({ w: null, r: null, done: false })), note: '' };
    })
  };
}
function sessionDur(se, now = Date.now()) {
  const end = se.endedAt || se.pausedAt || now;
  return Math.max(0, end - se.startedAt - se.pauses.reduce((a, p) => a + (p.e - p.s), 0));
}
const doneSets = e => e.sets.filter(s => s.done);
const setVol = s => (s.w || 0) * (s.r || 0);
const bestSet = e => doneSets(e).reduce((b, s) => (!b || (s.w || 0) > (b.w || 0) || ((s.w || 0) === (b.w || 0) && s.r > b.r)) ? s : b, null);
function sessionStats(se) {
  let exDone = 0, setsDone = 0, setsTotal = 0, vol = 0, best = null; const pending = [];
  for (const e of se.entries) {
    const d = doneSets(e); setsDone += d.length; setsTotal += e.sets.length; if (d.length) exDone++;
    if (d.length < e.sets.length) pending.push({ name: e.name, n: e.sets.length - d.length });
    for (const s of d) { vol += setVol(s); if (!best || setVol(s) > setVol(best.s)) best = { name: e.name, s }; }
  }
  return { exDone, exTotal: se.entries.length, setsDone, setsTotal, vol, best, pending, dur: sessionDur(se) };
}
function prevEntry(exId, beforeTs) {
  const list = doneSessions();
  for (let i = list.length - 1; i >= 0; i--) {
    if (list[i].startedAt >= beforeTs) continue;
    const e = list[i].entries.find(x => x.exId === exId && doneSets(x).length);
    if (e) return { se: list[i], e };
  }
  return null;
}
function progressMsg(e, prev) {
  const a = bestSet(e), b = prev && bestSet(prev); if (!a || !b) return null;
  if ((a.w || 0) === (b.w || 0)) {
    const d = a.r - b.r;
    return d > 0 ? { up: true, t: `Evolução de desempenho: +${d} ${d > 1 ? 'repetições' : 'repetição'}.` } : d < 0 ? { t: `${-d} ${d < -1 ? 'repetições' : 'repetição'} a menos que no treino anterior.` } : { t: 'Mesmo desempenho do treino anterior.' };
  }
  const dw = (a.w || 0) - (b.w || 0);
  return dw > 0 ? { up: true, t: `Evolução de desempenho: +${fmt(U.w(dw))} ${U.wl()} de carga.` } : { t: `Carga ${fmt(U.w(-dw))} ${U.wl()} menor que no treino anterior.` };
}
const topRange = e => { const d = doneSets(e); return !!e.planned.repMax && d.length > 0 && d.length >= e.planned.sets && d.every(s => s.r >= e.planned.repMax); };
function exHistory(exId) {
  const out = [];
  for (const se of doneSessions()) {
    const e = se.entries.find(x => x.exId === exId); if (!e) continue; const d = doneSets(e); if (!d.length) continue;
    out.push({ t: se.startedAt, date: se.date, sid: se.id, maxW: Math.max(...d.map(s => s.w || 0)), bestR: Math.max(...d.map(s => s.r || 0)), vol: d.reduce((a, s) => a + setVol(s), 0), sets: d });
  }
  return out;
}
function prs(exId, beforeTs = Infinity) {
  const h = exHistory(exId).filter(x => x.t < beforeTs); if (!h.length) return null;
  const r = { maxW: null, maxR: null, maxVol: null };
  for (const x of h) {
    for (const s of x.sets) {
      if (!r.maxW || (s.w || 0) > r.maxW.v) r.maxW = { v: s.w || 0, r: s.r, date: x.date };
      if (!r.maxR || s.r > r.maxR.v) r.maxR = { v: s.r, w: s.w || 0, date: x.date };
    }
    if (!r.maxVol || x.vol > r.maxVol.v) r.maxVol = { v: x.vol, date: x.date };
  }
  return r;
}
/* Edição de sessão: preserva a versão original antes da primeira alteração de um treino já concluído. */
function mutSession(sid, fn) {
  const se = sessionById(sid); if (!se) return null;
  if (se.status === 'done' && !se.original) se.original = clone({ entries: se.entries, note: se.note });
  fn(se);
  if (se.status === 'done') se.editedAt = Date.now();
  save('sessions', se); return se;
}
