'use strict';
/* ----- lembretes (disparam com o app aberto; em segundo plano o iOS exige servidor de push) ----- */
function remindersDue() {
  const R = S.kv.reminders, t = today(), out = [], at = hm => { const [h, m] = hm.split(':').map(Number); const d = new Date(); d.setHours(h, m, 0, 0); return d.getTime(); };
  if (R.treino.on && workoutById(S.kv.schedule[dow(t)])) out.push({ k: 'treino', ts: at(R.treino.time), title: 'Hora do treino', body: workoutById(S.kv.schedule[dow(t)]).name });
  if (R.refeicoes.on) dayView(t).meals.forEach((m, i) => out.push({ k: 'ref' + i + m.time, ts: at(m.time), title: m.name, body: 'Horário planejado da refeição.' }));
  if (R.agua.on) for (let m = 8 * 60; m <= 21 * 60; m += Math.max(30, R.agua.every || 120)) out.push({ k: 'agua' + m, ts: at(`${Math.floor(m / 60)}:${m % 60}`), title: 'Água', body: 'Que tal um copo de água?' });
  if (R.peso.on && [1, 4].includes(dow(t))) out.push({ k: 'peso', ts: at(R.peso.time), title: 'Registro de peso', body: 'Registre o peso desta manhã.' });
  if (R.avaliacao.on) { const c = cycleInfo(); if ([27, 55, 83].includes(c.day)) out.push({ k: 'aval', ts: at('09:00'), title: 'Avaliação corporal', body: `Fim da semana ${c.week}: registre medidas e fotos.` }); }
  return out;
}
function checkReminders() {
  const f = (S.kv.remFired && S.kv.remFired.date === today()) ? S.kv.remFired : { date: today(), keys: [] }, now = Date.now(); let ch = false;
  for (const r of remindersDue()) {
    if (f.keys.includes(r.k) || now < r.ts) continue;
    f.keys.push(r.k); ch = true;
    if (now - r.ts < 45 * 60000) { toast(`${r.title}: ${r.body}`); notify(r.title, r.body); }
  }
  if (ch) kvSet('remFired', f);
}
/* Alternativa confiável em segundo plano: exportar os lembretes para o app Calendário do iPhone (.ics). */
function exportICS() {
  const R = S.kv.reminders, t = today().replace(/-/g, ''), BY = ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'], ev = [];
  const add = (title, hm, rule) => ev.push(`BEGIN:VEVENT\r\nUID:${uid()}@projeto-evolucao\r\nDTSTAMP:${t}T000000Z\r\nDTSTART:${t}T${hm.replace(':', '')}00\r\nDURATION:PT15M\r\nRRULE:${rule}\r\nSUMMARY:${title}\r\nBEGIN:VALARM\r\nACTION:DISPLAY\r\nDESCRIPTION:${title}\r\nTRIGGER:PT0M\r\nEND:VALARM\r\nEND:VEVENT`);
  if (R.treino.on) [0, 1, 2, 3, 4, 5, 6].forEach(d => { const w = workoutById(S.kv.schedule[d]); if (w) add(`Treino: ${w.name}`, R.treino.time, `FREQ=WEEKLY;BYDAY=${BY[d]}`); });
  if (R.refeicoes.on) S.kv.mealPlan.forEach(m => add(m.name, m.time, 'FREQ=DAILY'));
  if (R.peso.on) add('Registrar peso', R.peso.time, 'FREQ=WEEKLY;BYDAY=MO,TH');
  if (R.agua.on) for (let m = 8 * 60; m <= 21 * 60; m += Math.max(30, R.agua.every || 120)) add('Beber água', `${pad(Math.floor(m / 60))}:${pad(m % 60)}`, 'FREQ=DAILY');
  if (!ev.length) { toast('Ative ao menos uma categoria de lembrete antes de exportar.'); return; }
  download('lembretes-projeto-evolucao.ics', `BEGIN:VCALENDAR\r\nVERSION:2.0\r\nPRODID:-//Projeto Evolucao//PT\r\n${ev.join('\r\n')}\r\nEND:VCALENDAR\r\n`, 'text/calendar');
}
