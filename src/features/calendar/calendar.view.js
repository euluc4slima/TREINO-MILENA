'use strict';
/* Calendário */
const ST_LABEL = { done: 'Treino concluído', active: 'Treino em andamento', planned: 'Treino programado', rest: 'Descanso', missed: 'Treino não realizado', none: 'Sem programação' };
V.calendar = p => {
  const ym = p.ym || today().slice(0, 7), [y, m] = ym.split('-').map(Number), n = new Date(y, m, 0).getDate(), off = (new Date(y, m - 1, 1).getDay() + 6) % 7, t = today();
  const cells = Array.from({ length: off }, () => '<span></span>').concat(Array.from({ length: n }, (_, i) => { const d = `${ym}-${pad(i + 1)}`, st = dayStatus(d); return `<button class="cd ${st} ${d === t ? 'now' : ''}" data-a="dayInfo" data-d="${d}" aria-label="${fdate(d)}: ${ST_LABEL[st]}"><b>${i + 1}</b>${hasFoodLog(d) ? '<i class="fl"></i>' : ''}</button>`; }));
  return head('Calendário', { back: true }) + `<section class="card"><div class="rowb"><button class="ib soft" data-a="calNav" data-d="-1" aria-label="Mês anterior">${ic('back')}</button><h3>${MONTHS[m - 1]} de ${y}</h3><button class="ib soft" data-a="calNav" data-d="1" aria-label="Próximo mês">${ic('next')}</button></div>
    <div class="cal">${['S', 'T', 'Q', 'Q', 'S', 'S', 'D'].map(x => `<span class="ch">${x}</span>`).join('')}${cells.join('')}</div>
    <div class="legend"><span><i class="cd done"></i>Concluído</span><span><i class="cd planned"></i>Programado</span><span><i class="cd missed"></i>Não realizado</span><span><i class="cd rest"></i>Descanso</span><span><i class="fl"></i>Registro alimentar</span></div></section>
    <p class="mut sm center">Toque em um dia para ver os detalhes.</p>`;
};
A.calNav = d => { const ym = cur().p.ym || today().slice(0, 7), [y, m] = ym.split('-').map(Number), nd = new Date(y, m - 1 + (+d.d), 1); cur().p.ym = `${nd.getFullYear()}-${pad(nd.getMonth() + 1)}`; render(); };
function daySheet(d) {
  const st = dayStatus(d), ss = S.sessions.filter(s => s.date === d && s.status === 'done'), w = workoutById(S.kv.schedule[dow(d)]), b = S.body.filter(x => x.date === d), dz = S.diary[d], tot = dayTotals(d);
  openSheet(`<h2>${DOW[dow(d)]}, ${fdate(d)}</h2><p><span class="pill ${st}">${ST_LABEL[st]}</span>${w && st !== 'done' ? ` ${esc(w.name)}` : ''}</p>
    ${ss.map(se => { const x = sessionStats(se); return `<button class="li" data-a="goClose" data-v="sessionDetail" data-id="${se.id}"><div><b>${esc(se.name)}</b><span class="mut sm">${fdur(x.dur)} · ${x.setsDone}/${x.setsTotal} séries</span></div>${ic('next', 18)}</button>`; }).join('')}
    <h4>Alimentação</h4><p class="mut">${hasFoodLog(d) ? `Consumido: ${fmt(tot.kcal, 0)} kcal · ${fmt(tot.p, 0)} g de proteína · ${fmt(tot.c, 0)} g carb. · ${fmt(tot.f, 0)} g gord.` : 'Sem alimentos registrados como consumidos.'}</p>
    ${b.length ? `<h4>Avaliação corporal</h4><p class="mut">${b.map(x => ['weight', 'waist', 'hip', 'glutes', 'thigh', 'arm', 'fat'].filter(f => x[f] != null).map(f => `${BODY_F[f][0]}: ${bodyFmt(f, x[f])}`).join(' · ')).join('<br>')}</p>` : ''}
    ${dz ? `<h4>Diário</h4><p class="mut">${SCALE.filter(([f]) => dz[f]).map(([f, l]) => `${l}: ${dz[f]}/5`).join(' · ')}${dz.note ? '<br>' + esc(dz.note) : ''}</p>` : ''}
    <div class="stack"><button class="btn ghost" data-a="foodDay" data-d="${d}">Abrir alimentação do dia</button><button class="btn ghost" data-a="closeSheet">Fechar</button></div>`);
}
A.goClose = d => { closeSheet(); A.go(d); };
A.foodDay = d => { closeSheet(); foodDate = d.d; tab('food'); };
