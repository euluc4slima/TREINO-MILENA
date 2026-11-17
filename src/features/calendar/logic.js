'use strict';
/* ----- ciclo de 12 semanas ----- */
const curCycle = () => S.kv.cycles[S.kv.cycles.length - 1];
function cycleInfo() {
  const c = curCycle(), day = diffDays(c.start, today());
  const week = Math.min(12, Math.max(1, Math.floor(day / 7) + 1));
  const phase = PHASES.find(p => week >= p.weeks[0] && week <= p.weeks[1]);
  const done = S.sessions.filter(s => s.status === 'done' && s.date >= c.start && s.date <= addDays(c.start, 83)).length;
  return { c, day, week, phase, over: day >= 84, before: day < 0, pct: Math.max(0, Math.min(100, (day + 1) / 84 * 100)), done, n: S.kv.cycles.length };
}
function dayStatus(date) {
  if (S.sessions.some(s => s.status === 'done' && s.date === date)) return 'done';
  const a = activeSession(); if (a && a.date === date) return 'active';
  const wid = S.kv.schedule[dow(date)];
  if (!wid || !workoutById(wid)) return 'rest';
  if (date >= today()) return 'planned';
  return date >= S.kv.cycles[0].start ? 'missed' : 'none';
}
function nextWorkout() {
  const t = today(), doneToday = S.sessions.some(s => s.status === 'done' && s.date === t);
  for (let i = doneToday ? 1 : 0; i < 8; i++) { const d = addDays(t, i), w = workoutById(S.kv.schedule[dow(d)]); if (w) return { date: d, w }; }
  return null;
}
