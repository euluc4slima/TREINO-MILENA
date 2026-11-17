'use strict';
/* TREINOS — divisão semanal, editor, biblioteca, histórico, calendário e programa */
V.train = () => {
  const act = activeSession(), t = today();
  return head('Treinos', { sub: 'Divisão semanal, biblioteca e histórico' }) +
    (act ? `<button class="card cta" data-a="resume">${ic('play', 20)}<div><b>${esc(act.name)} em andamento</b><span data-clock="session">00:00</span></div>${ic('next', 18)}</button>` : '') +
    `<div class="grid2 nav4"><button class="card navc" data-a="go" data-v="library">${ic('book')}<span>Biblioteca</span></button><button class="card navc" data-a="go" data-v="history">${ic('history')}<span>Histórico</span></button><button class="card navc" data-a="go" data-v="calendar">${ic('calendar')}<span>Calendário</span></button><button class="card navc" data-a="go" data-v="program">${ic('target')}<span>12 semanas</span></button></div>
    <h3 class="sec">Meus treinos</h3>
    ${S.workouts.map(w => `<div class="card wk"><button class="wk-main" data-a="go" data-v="workout" data-id="${w.id}"><b>${esc(w.name)}</b><span class="mut sm">${esc(w.focus || '')} · ${w.items.length} exercícios · ~${estMin(w)} min</span></button><button class="btn sm" data-a="startWorkout" data-id="${w.id}">${ic('play', 16)} Iniciar</button></div>`).join('')}
    <button class="btn ghost" data-a="newWorkout">${ic('plus', 18)} Novo treino</button>
    <h3 class="sec">Divisão semanal</h3>
    <section class="card">${[1, 2, 3, 4, 5, 6, 0].map(d => `<label class="rowl"><span class="${dow(t) === d ? 'now' : ''}">${DOW[d]}${d > 0 && d < 6 ? '-feira' : ''}</span>${sel([['', 'Descanso'], ...S.workouts.map(w => [w.id, `${w.name} — ${w.focus || ''}`])], S.kv.schedule[d] || '', `data-c="sched" data-d="${d}"`)}</label>`).join('')}<p class="mut sm">Altere os dias à vontade. O calendário e o painel acompanham a nova divisão.</p></section>`;
};
C.sched = (d, v) => { S.kv.schedule[d.d] = v; kvSet('schedule', S.kv.schedule); toast('Divisão semanal atualizada.'); };
A.newWorkout = () => { const w = { id: uid(), name: 'Novo treino', focus: '', items: [] }; save('workouts', w); go('workout', { id: w.id }); };

/* Editor de treino */
V.workout = p => {
  const w = workoutById(p.id); if (!w) return head('Treino', { back: true });
  return head('Editar treino', { back: true }) + `
    <section class="card">${field('Nome do treino', `data-c="wf" data-id="${w.id}" data-f="name"`, w.name)}${field('Grupos musculares', `data-c="wf" data-id="${w.id}" data-f="focus"`, w.focus)}
      <button class="btn big" data-a="startWorkout" data-id="${w.id}">${ic('play', 20)} INICIAR TREINO</button></section>
    <h3 class="sec">Exercícios (${w.items.length})</h3>
    ${w.items.map((x, n) => { const e = exById(x.exId) || { name: 'Exercício removido', group: '' }, a = `data-c="wit" data-id="${w.id}" data-n="${n}"`; return `<section class="card it">
      <div class="rowb"><button class="lnk l" data-a="go" data-v="exercise" data-id="${x.exId}"><b>${n + 1}. ${esc(e.name)}</b><span class="mut sm">${esc(e.group)}</span></button>
        <div class="ibs"><button class="ib soft" data-a="witMove" data-id="${w.id}" data-n="${n}" data-d="-1" aria-label="Mover para cima" ${n ? '' : 'disabled'}>${ic('up', 18)}</button><button class="ib soft" data-a="witMove" data-id="${w.id}" data-n="${n}" data-d="1" aria-label="Mover para baixo" ${n < w.items.length - 1 ? '' : 'disabled'}>${ic('down', 18)}</button><button class="ib soft" data-a="witDel" data-id="${w.id}" data-n="${n}" aria-label="Remover exercício">${ic('trash', 18)}</button></div></div>
      <div class="grid4">${field('Séries', `type="number" inputmode="numeric" min="1" ${a} data-f="sets"`, x.sets)}${field('Reps mín.', `type="number" inputmode="numeric" min="1" ${a} data-f="repMin"`, x.repMin)}${field('Reps máx.', `type="number" inputmode="numeric" min="1" ${a} data-f="repMax"`, x.repMax)}${field('Descanso (s)', `type="number" inputmode="numeric" min="0" ${a} data-f="rest"`, x.rest)}</div>
      ${field('Observação (ex.: por perna)', `${a} data-f="repNote"`, x.repNote)}</section>`; }).join('')}
    <button class="btn ghost" data-a="pickEx" data-id="${w.id}">${ic('plus', 18)} Adicionar exercício</button>
    <button class="lnk center dangerc" data-a="delWorkout" data-id="${w.id}">Excluir este treino</button>`;
};
C.wf = (d, v) => { const w = workoutById(d.id); w[d.f] = v; save('workouts', w); };
C.wit = (d, v) => { const w = workoutById(d.id), x = w.items[d.n]; x[d.f] = d.f === 'repNote' ? v : Math.max(d.f === 'rest' ? 0 : 1, Math.round(num(v) || 0)); if (x.repMax < x.repMin) x.repMax = x.repMin; save('workouts', w); render(); };
A.witMove = d => { const w = workoutById(d.id), n = +d.n, m = n + (+d.d); if (m < 0 || m >= w.items.length) return;[w.items[n], w.items[m]] = [w.items[m], w.items[n]]; save('workouts', w); render(); };
A.witDel = d => { const w = workoutById(d.id); w.items.splice(+d.n, 1); save('workouts', w); render(); };
A.delWorkout = d => confirmDlg('Excluir treino?', 'O modelo de treino será removido da divisão semanal. O histórico de sessões já realizadas é mantido.', 'Excluir treino', () => {
  remove('workouts', d.id); for (const k in S.kv.schedule) if (S.kv.schedule[k] === d.id) S.kv.schedule[k] = ''; kvSet('schedule', S.kv.schedule); back();
}, true);
let pickWid = null;
const pickList = q => S.exercises.filter(e => !q || (e.name + e.group).toLowerCase().includes(q.toLowerCase())).sort((a, b) => a.name.localeCompare(b.name)).map(e => `<button class="li" data-a="pickExOk" data-id="${e.id}"><div><b>${esc(e.name)}</b><span class="mut sm">${esc(e.group)}</span></div>${ic('plus', 18)}</button>`).join('') || '<p class="mut">Nenhum exercício encontrado.</p>';
A.pickEx = d => { pickWid = d.id; openSheet(`<h2>Adicionar exercício</h2><input type="search" placeholder="Buscar por nome ou grupo" data-oi="pickQ" aria-label="Buscar exercício"><div id="pickList" class="scroll">${pickList('')}</div><button class="btn ghost" data-a="closeSheet">Fechar</button>`); };
OI.pickQ = (d, v) => { $('#pickList').innerHTML = pickList(v); };
A.pickExOk = d => { const w = workoutById(pickWid), e = exById(d.id); w.items.push({ exId: e.id, sets: 3, repMin: 10, repMax: 12, rest: e.rest || 60, repNote: '' }); save('workouts', w); closeSheet(); render(); toast(`${e.name} adicionado.`); };
