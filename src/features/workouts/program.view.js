'use strict';
/* Programa de 12 semanas */
V.program = () => {
  const cy = cycleInfo(), start = cy.c.start;
  return head('Programa de 12 semanas', { back: true, sub: `Ciclo ${cy.n} · início em ${fdate(start)}` }) + `
    <section class="card"><div class="rowb"><h3>${cy.over ? 'Ciclo concluído' : cy.before ? 'Começa em breve' : `Semana ${cy.week} de 12`}</h3><span class="mut sm">${Math.round(cy.pct)}%</span></div>${bar(cy.pct)}<p class="mut sm">${cy.done} ${cy.done === 1 ? 'treino concluído' : 'treinos concluídos'} neste ciclo · término em ${fdate(addDays(start, 83))}</p></section>
    ${PHASES.map(ph => `<section class="card ${cy.phase.n === ph.n && !cy.over ? 'cur' : ''}"><span class="tag">Fase ${ph.n} · semanas ${ph.weeks[0]} a ${ph.weeks[1]}${cy.phase.n === ph.n && !cy.over ? ' · atual' : ''}</span><h3>${ph.name}</h3><ul>${ph.items.map(x => `<li>${x}</li>`).join('')}</ul>
      <div class="wks">${Array.from({ length: 4 }, (_, k) => { const wn = ph.weeks[0] + k, mon = addDays(start, (wn - 1) * 7), days = [0, 1, 2, 3, 4, 5, 6].map(i => addDays(mon, i)), dn = days.filter(d => dayStatus(d) === 'done').length, pl = days.filter(d => workoutById(S.kv.schedule[dow(d)])).length; return `<div class="wkc ${wn === cy.week && !cy.over ? 'now' : ''}"><span>Sem. ${wn}</span><b>${dn}/${pl}</b><small>${fshort(mon)}</small></div>`; }).join('')}</div></section>`).join('')}
    <section class="card"><h3>Datas do ciclo</h3>${field('Data de início', `type="date" data-c="cycleStart"`, start)}<p class="mut sm">Regras gerais: descanse cerca de 90–120 s nos exercícios principais e 60–90 s nos isoladores. Não é preciso chegar à falha em todas as séries. A carga não precisa aumentar toda semana.</p>
      <button class="btn ghost" data-a="newCycle">${ic('refresh', 18)} Iniciar novo ciclo de 12 semanas</button><p class="mut sm">Um novo ciclo não apaga treinos, alimentação, medidas nem fotos anteriores.</p></section>
    ${S.kv.cycles.length > 1 ? `<section class="card"><h3>Ciclos anteriores</h3>${S.kv.cycles.slice(0, -1).map((c, i) => `<p class="mut">Ciclo ${i + 1}: ${fdate(c.start)} a ${fdate(addDays(c.start, 83))}</p>`).join('')}</section>` : ''}`;
};
C.cycleStart = (d, v) => { if (!v) return; curCycle().start = v; kvSet('cycles', S.kv.cycles); render(); };
A.newCycle = () => confirmDlg('Iniciar novo ciclo?', 'Um novo ciclo de 12 semanas começa hoje. Todos os registros anteriores são mantidos no histórico.', 'Iniciar novo ciclo', () => { S.kv.cycles.push({ id: uid(), start: today() }); kvSet('cycles', S.kv.cycles); render(); toast('Novo ciclo iniciado.'); });
