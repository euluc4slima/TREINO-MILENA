'use strict';
/* Histórico */
V.history = () => {
  const l = doneSessions().reverse();
  return head('Histórico de treinos', { back: true, sub: `${l.length} sessões concluídas` }) + (l.length ? l.map(se => { const st = sessionStats(se); return `<button class="li card" data-a="go" data-v="sessionDetail" data-id="${se.id}"><div><b>${esc(se.name)}</b><span class="mut sm">${DOW3[dow(se.date)]}, ${fdate(se.date)} · ${fdur(st.dur)} · ${st.setsDone}/${st.setsTotal} séries${se.editedAt ? ' · editado' : ''}</span></div>${ic('next', 18)}</button>`; }).join('') : '<div class="card"><p class="mut">Nenhum treino concluído ainda.</p></div>');
};
const setsTable = e => `<div class="tb">${e.sets.map((s, j) => `<span class="${s.done ? '' : 'pend'}">${j + 1}ª · ${s.w != null ? fw(s.w) : '—'} × ${s.r != null ? s.r : '—'}${s.done ? '' : ' · pendente'}</span>`).join('')}</div>`;
V.sessionDetail = p => {
  const se = sessionById(p.id); if (!se) return head('Sessão', { back: true }) + '<div class="card"><p>Sessão não encontrada.</p></div>';
  const st = sessionStats(se), edit = !!p.edit;
  return head(se.name, { back: true, sub: `${DOW[dow(se.date)]}, ${fdate(se.date)}`, right: se.status === 'done' ? `<button class="ib" data-a="sdEdit" aria-label="${edit ? 'Concluir edição' : 'Editar sessão'}">${ic(edit ? 'check' : 'edit')}</button>` : '' }) + `
    <section class="grid2"><div class="card stat"><span>Duração</span><b>${fdur(st.dur)}</b><small>${ftime(se.startedAt)}–${se.endedAt ? ftime(se.endedAt) : '…'}</small></div><div class="card stat"><span>Séries</span><b>${st.setsDone}/${st.setsTotal}</b><small>${fmt(U.w(st.vol), 0)} ${U.wl()} de volume</small></div></section>
    ${se.editedAt ? `<p class="note">Sessão editada em ${fdate(dstr(new Date(se.editedAt)))} às ${ftime(se.editedAt)}. <button class="lnk" data-a="sdOriginal" data-id="${se.id}">Ver registro original</button></p>` : ''}
    ${edit ? '<p class="note warn">Modo de edição: as alterações são salvas automaticamente e o registro original fica preservado para consulta.</p>' + se.entries.map((e, i) => entryCard(se, i)).join('') :
      se.entries.map(e => `<section class="card"><div class="rowb"><div><b>${esc(e.name)}</b><span class="mut sm"> · ${e.planned.sets} × ${repLabel(e.planned)}</span></div><button class="ib soft" data-a="go" data-v="exercise" data-id="${e.exId}" aria-label="Ver exercício">${ic('chart', 18)}</button></div>${setsTable(e)}${e.note ? `<p class="mut sm">Obs.: ${esc(e.note)}</p>` : ''}</section>`).join('')}
    <section class="card"><h3>Observações da sessão</h3><textarea rows="3" placeholder="Sem observações" data-c="sessNote" data-sid="${se.id}">${esc(se.note || '')}</textarea></section>
    ${se.status === 'done' ? `<button class="lnk center dangerc" data-a="sdDel" data-id="${se.id}">Excluir esta sessão</button>` : ''}`;
};
A.sdEdit = () => { cur().p.edit = cur().p.edit ? '' : '1'; render(); };
A.sdOriginal = d => { const se = sessionById(d.id); openSheet(`<h2>Registro original</h2><p class="mut sm">Como a sessão foi salva antes da primeira edição.</p><div class="scroll">${se.original.entries.map(e => `<p><b>${esc(e.name)}</b></p>${setsTable(e)}`).join('')}${se.original.note ? `<p class="mut sm">Obs.: ${esc(se.original.note)}</p>` : ''}</div><button class="btn ghost" data-a="closeSheet">Fechar</button>`); };
A.sdDel = d => confirmDlg('Excluir sessão?', 'Esta sessão será removida do histórico, dos gráficos e dos recordes. Esta ação não pode ser desfeita.', 'Excluir sessão', () => { remove('sessions', d.id); back(); }, true);
