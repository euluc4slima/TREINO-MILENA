'use strict';
/* INÍCIO — painel com o resumo da situação atual */
const pctOf = (v, min) => min ? Math.round(100 * v / min) : 0;
function macroRow(label, v, min, max, unit) {
  return `<div class="mrow"><div class="mrow-h"><span>${label}</span><span><b>${fmt(v, 0)}</b> / ${fmt(min, 0)}–${fmt(max, 0)} ${unit} · ${pctOf(v, min)}%</span></div>${bar(pctOf(v, min))}</div>`;
}
V.home = () => {
  const p = S.kv.profile, g = S.kv.goals, cy = cycleInfo(), t = today(), hr = new Date().getHours();
  const greet = hr < 12 ? 'Bom dia' : hr < 18 ? 'Boa tarde' : 'Boa noite';
  const act = activeSession(), w = workoutById(S.kv.schedule[dow(t)]), doneToday = S.sessions.find(s => s.status === 'done' && s.date === t), nx = nextWorkout();
  const mon = mondayOf(t), week = [0, 1, 2, 3, 4, 5, 6].map(i => addDays(mon, i));
  const planned = week.filter(d => workoutById(S.kv.schedule[dow(d)])).length, doneW = week.filter(d => dayStatus(d) === 'done').length;
  const tot = dayTotals(t), cw = currentWeight(), lb = lastBody('weight'), old = lastBody('weight', addDays(t, -28));
  const last = doneSessions().slice(-1)[0], ls = last && sessionStats(last);
  const meas = ['waist', 'hip', 'glutes', 'thigh', 'arm'].map(f => { const a = firstBody(f), b = lastBody(f); return a && b && a.date !== b.date ? `${BODY_F[f][0]} ${sign(U.l(b[f] - a[f]))} ${U.ll()}` : null; }).filter(Boolean);

  let wcard;
  if (act) wcard = `<section class="card hero"><span class="tag">Em andamento</span><h2>${esc(act.name)}</h2><p>${esc(act.focus || '')}</p><p class="big" data-clock="session">00:00</p><button class="btn big inv" data-a="resume">${ic('play', 20)} CONTINUAR TREINO</button></section>`;
  else if (w && !doneToday) wcard = `<section class="card hero"><span class="tag">Treino de hoje · ${DOW[dow(t)]}</span><h2>${esc(w.name)}</h2><p>${esc(w.focus)}</p><div class="hero-m"><span>${ic('list', 16)} ${w.items.length} exercícios</span><span>${ic('clock', 16)} ~${estMin(w)} min</span></div><button class="btn big inv" data-a="startWorkout" data-id="${w.id}">${ic('play', 20)} INICIAR TREINO</button></section>`;
  else wcard = `<section class="card"><span class="tag">${doneToday ? 'Treino de hoje concluído' : 'Hoje · descanso'}</span><h2>${doneToday ? esc(doneToday.name) + ' ✓' : 'Dia de recuperação'}</h2>${nx ? `<p class="mut">Próximo treino: <b>${esc(nx.w.name)}</b> — ${nx.date === t ? 'hoje' : DOW[dow(nx.date)] + ', ' + fshort(nx.date)}</p><p class="mut sm">${esc(nx.w.focus)} · ${nx.w.items.length} exercícios · ~${estMin(nx.w)} min</p>` : '<p class="mut">Nenhum treino programado na semana.</p>'}<button class="btn ghost" data-a="tab" data-v="train">Ver treinos</button></section>`;

  return `<header class="top home"><div class="top-t"><p>${DOW[dow(t)]}, ${fdate(t)}</p><h1>${greet}${p.name ? ', ' + esc(p.name) : ''}</h1></div>${ONLINE ? '' : '<span class="pill active">Offline</span>'}<div class="logo">${ic('chart', 22)}</div></header>
  <section class="card"><div class="rowb"><div><span class="tag">Ciclo ${cy.n} · 12 semanas</span><h3>${cy.over ? 'Ciclo concluído' : cy.before ? 'Ciclo ainda não iniciado' : `Semana ${cy.week} de 12`}</h3></div><button class="lnk" data-a="go" data-v="program">Programa ${ic('next', 14)}</button></div>
    ${bar(cy.pct)}<p class="mut sm">Fase ${cy.phase.n} — ${cy.phase.name} · ${cy.done} ${cy.done === 1 ? 'treino concluído' : 'treinos concluídos'} no ciclo</p></section>
  ${wcard}
  <section class="card"><div class="rowb"><h3>Semana</h3><span class="mut sm"><b>${doneW}</b> de ${planned} treinos concluídos</span></div>
    <div class="week">${week.map(d => `<button class="wd ${dayStatus(d)} ${d === t ? 'now' : ''}" data-a="dayInfo" data-d="${d}"><span>${DOW3[dow(d)][0]}</span><i>${dayStatus(d) === 'done' ? ic('check', 14) : ''}</i></button>`).join('')}</div></section>
  <section class="card"><div class="rowb"><h3>Alimentação de hoje</h3><button class="lnk" data-a="tab" data-v="food">Registrar ${ic('next', 14)}</button></div>
    <div class="prot"><div><span class="mut sm">Proteína consumida</span><p class="big">${fmt(tot.p, 0)}<small> / ${g.pMin}–${g.pMax} g</small></p></div><div class="ring" style="--p:${Math.min(100, pctOf(tot.p, g.pMin))}"><b>${pctOf(tot.p, g.pMin)}%</b></div></div>
    ${g.showKcal ? macroRow('Calorias', tot.kcal, g.kcalMin, g.kcalMax, 'kcal') : ''}${macroRow('Carboidratos', tot.c, g.cMin, g.cMax, 'g')}${macroRow('Gorduras', tot.f, g.fMin, g.fMax, 'g')}
    <p class="mut sm">Somente alimentos marcados como consumidos. Metas estimadas, sujeitas à validação profissional.</p></section>
  <section class="card"><div class="rowb"><h3>Evolução</h3><button class="lnk" data-a="tab" data-v="evo">Detalhes ${ic('next', 14)}</button></div>
    <div class="grid3"><div class="stat"><span>Peso atual</span><b>${fw(cw)}</b></div><div class="stat"><span>Peso inicial</span><b>${fw(p.startWeight)}</b></div><div class="stat"><span>Marco</span><b>${fw(p.milestone)}</b></div></div>
    <p class="mut sm">${lb ? `Variação desde o início: <b>${sign(U.w(cw - p.startWeight))} ${U.wl()}</b>` : 'Ainda sem registro de peso — o valor atual é o peso inicial.'}${old && lb && old.date !== lb.date ? ` · vs. mês anterior: <b>${sign(U.w(cw - old.weight))} ${U.wl()}</b>` : ''}</p>
    <p class="mut sm">${meas.length ? 'Medidas desde a 1ª avaliação: ' + meas.join(' · ') : 'Medidas: registre ao menos duas avaliações para ver a evolução.'}</p>
    <p class="mut sm">O marco é uma referência de acompanhamento, não um peso ideal ou obrigação.</p></section>
  <section class="card"><h3>Últimos resultados</h3>${last ? `<button class="li" data-a="go" data-v="sessionDetail" data-id="${last.id}"><div><b>${esc(last.name)}</b><span class="mut sm">${fdate(last.date)} · ${fdur(ls.dur)} · ${ls.setsDone} séries · ${fmt(U.w(ls.vol), 0)} ${U.wl()} de volume</span></div>${ic('next', 18)}</button>${ls.best ? `<p class="mut sm">Melhor série: ${esc(ls.best.name)} — ${fw(ls.best.s.w || 0)} × ${ls.best.s.r}</p>` : ''}` : '<p class="mut">Nenhum treino concluído ainda. Seus resultados aparecerão aqui.</p>'}</section>
  <p class="foot">Ferramenta de organização e acompanhamento. Não substitui avaliação médica, nutricional ou orientação de profissional de Educação Física.</p>`;
};
A.dayInfo = d => daySheet(d.d);
