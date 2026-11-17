'use strict';
/* ----- corpo ----- */
const bodySorted = () => [...S.body].sort((a, b) => a.date.localeCompare(b.date));
function lastBody(f, before) { const l = bodySorted().filter(b => b[f] != null && (!before || b.date <= before)); return l.length ? l[l.length - 1] : null; }
function firstBody(f) { return bodySorted().find(b => b[f] != null) || null; }
const currentWeight = () => { const b = lastBody('weight'); return b ? b.weight : S.kv.profile.startWeight; };
const bmi = () => { const h = (S.kv.profile.height || 0) / 100, w = currentWeight(); return h && w ? w / (h * h) : null; };

/* ----- resumo semanal ----- */
function weekStats(mon) {
  const end = addDays(mon, 6), ss = doneSessions().filter(s => s.date >= mon && s.date <= end);
  const st = ss.map(sessionStats), groups = {};
  ss.forEach(s => s.entries.forEach(e => { const n = doneSets(e).length; if (n) groups[e.group] = (groups[e.group] || 0) + n; }));
  const prot = []; for (let i = 0; i < 7; i++) { const d = addDays(mon, i); if (hasFoodLog(d)) prot.push(dayTotals(d).p); }
  const ws = S.body.filter(b => b.weight != null && b.date >= mon && b.date <= end).map(b => b.weight);
  const avg = a => a.length ? a.reduce((x, y) => x + y, 0) / a.length : null;
  return { n: ss.length, sets: st.reduce((a, x) => a + x.setsDone, 0), vol: st.reduce((a, x) => a + x.vol, 0), dur: avg(st.map(x => x.dur)), groups, prot: avg(prot), protDays: prot.length, weight: avg(ws) };
}
