'use strict';
/* TELA DE TREINO — execução, registro de séries, descanso e finalização */
function entryCard(se, i) {
  const e = se.entries[i], prev = prevEntry(e.exId, se.startedAt), pm = progressMsg(e, prev && prev.e), ds = `data-sid="${se.id}" data-e="${i}"`;
  const pd = prev ? doneSets(prev.e) : [], sug = j => pd[j] || pd[pd.length - 1] || null;
  const rows = e.sets.map((s, j) => {
    const g = sug(j), a = `${ds} data-s="${j}"`;
    return `<div class="sr ${s.done ? 'done' : ''}"><button class="sn" data-a="setMenu" ${a} aria-label="Opções da série ${j + 1}">${j + 1}</button>
      <div class="stp"><button data-a="step" data-d="-1" aria-label="Diminuir carga">−</button><input type="number" inputmode="decimal" step="any" min="0" placeholder="${g && g.w != null ? r2(U.w(g.w)) : '—'}" value="${s.w == null ? '' : r2(U.w(s.w))}" data-c="setv" ${a} data-f="w" aria-label="Carga da série ${j + 1}"><button data-a="step" data-d="1" aria-label="Aumentar carga">+</button></div>
      <div class="stp"><button data-a="step" data-d="-1" aria-label="Diminuir repetições">−</button><input type="number" inputmode="numeric" min="0" placeholder="${g ? g.r : '—'}" value="${s.r == null ? '' : s.r}" data-c="setv" ${a} data-f="r" aria-label="Repetições da série ${j + 1}"><button data-a="step" data-d="1" aria-label="Aumentar repetições">+</button></div>
      <button class="ck ${s.done ? 'on' : ''}" data-a="setDone" ${a} aria-label="${s.done ? 'Série concluída' : 'Concluir série'}" aria-pressed="${s.done}">${ic('check', 24)}</button></div>`;
  }).join('');
  return `<section class="card ex"><div class="rowb"><div><h2>${esc(e.name)}</h2><p class="mut sm">${esc(e.group)} · ${e.planned.sets} × ${repLabel(e.planned)} · descanso ${e.planned.rest}s</p></div><button class="ib soft" data-a="exSheet" data-id="${e.exId}" aria-label="Como executar">${ic('info')}</button></div>
    ${demoBtn(e.exId, e.name)}
    ${prev ? `<p class="hint">${ic('history', 14)} Último treino (${fshort(prev.se.date)}): ${pd.map(s => `${fmt(U.w(s.w || 0))}×${s.r}`).join(' · ')} — sugestão em cinza, toque em + para usar.</p>` : '<p class="hint">Primeiro registro deste exercício. Comece leve e priorize a técnica.</p>'}
    <div class="sr srh"><span></span><span>Carga (${U.wl()})</span><span>Repetições</span><span>Feita</span></div>${rows}
    <div class="rowb"><button class="btn sm ghost" data-a="addSet" ${ds}>${ic('plus', 16)} Adicionar série</button><span class="mut sm">${doneSets(e).length}/${e.sets.length} concluídas</span></div>
    ${pm ? `<p class="note ${pm.up ? 'up' : ''}">${esc(pm.t)}</p>` : ''}
    ${topRange(e) ? `<p class="note warn">Você atingiu o topo da faixa (${e.planned.repMax} repetições) em todas as séries. Avalie com o profissional de Educação Física um possível pequeno aumento de carga, mantendo a técnica. A carga não é alterada automaticamente.</p>` : ''}
    <textarea rows="2" placeholder="Observações deste exercício" data-c="entryNote" ${ds}>${esc(e.note || '')}</textarea></section>`;
}
V.session = () => {
  const se = activeSession();
  if (!se) return head('Treino', { back: true }) + `<div class="card"><p>Nenhum treino em andamento.</p><button class="btn" data-a="tab" data-v="train">Ver treinos</button></div>`;
  const simple = S.kv.settings.simple, st = sessionStats(se), paused = !!se.pausedAt, i = Math.min(se.idx || 0, se.entries.length - 1), nx = se.entries[i + 1];
  return `<header class="top stop"><button class="ib" data-a="back" aria-label="Minimizar treino">${ic('down')}</button>
      <div class="top-t"><h1>${esc(se.name)}</h1><p>${st.setsDone}/${st.setsTotal} séries · ${paused ? 'pausado' : 'em andamento'}</p></div>
      <div class="sclock"><b data-clock="session">00:00</b><button class="ib soft" data-a="sessPause" aria-label="${paused ? 'Continuar treino' : 'Pausar treino'}">${ic(paused ? 'play' : 'pause', 20)}</button></div></header>
    <div class="seg"><button class="${simple ? 'on' : ''}" data-a="sessMode" data-v="1">Tela de treino</button><button class="${simple ? '' : 'on'}" data-a="sessMode" data-v="">Lista completa</button></div>
    ${simple ? `<div class="exnav"><button class="ib soft" data-a="exNav" data-d="-1" ${i === 0 ? 'disabled' : ''} aria-label="Exercício anterior">${ic('back')}</button><div><b>Exercício ${i + 1} de ${se.entries.length}</b><div class="dots">${se.entries.map((e, j) => `<i class="${j === i ? 'cur' : ''} ${doneSets(e).length >= e.sets.length ? 'ok' : ''}"></i>`).join('')}</div></div><button class="ib soft" data-a="exNav" data-d="1" ${nx ? '' : 'disabled'} aria-label="Próximo exercício">${ic('next')}</button></div>
      ${entryCard(se, i)}
      ${nx ? `<button class="card nextex" data-a="exNav" data-d="1"><div><span class="mut sm">Próximo exercício</span><b>${esc(nx.name)}</b><span class="mut sm">${nx.planned.sets} × ${repLabel(nx.planned)}</span></div>${ic('next')}</button>` : '<p class="mut sm center">Este é o último exercício do treino.</p>'}`
      : se.entries.map((e, j) => entryCard(se, j)).join('')}
    <button class="btn big outline" data-a="finishAsk">${ic('flag', 20)} FINALIZAR TREINO</button>
    <button class="lnk center" data-a="discardAsk">Descartar este treino</button>
    <div class="restp" id="restPanel">${restHTML()}</div>`;
};

A.startWorkout = d => {
  unlockAudio();
  if (activeSession()) { toast('Já existe um treino em andamento.'); A.resume(); return; }   // nunca duplica sessões
  const w = workoutById(d.id); if (!w || !w.items.length) { toast('Adicione exercícios a este treino antes de iniciar.'); return; }
  const se = newSession(w); save('sessions', se);
  kvSet('rest', { state: 'idle', dur: se.entries[0].planned.rest });
  stack = [stack[0]]; go('session');
};
A.resume = () => { unlockAudio(); if (cur().v !== 'session') go('session'); };
A.sessMode = d => { S.kv.settings.simple = !!d.v; kvSet('settings', S.kv.settings); render(); };
A.exNav = d => { const se = activeSession(); se.idx = Math.max(0, Math.min(se.entries.length - 1, (se.idx || 0) + (+d.d))); save('sessions', se); const r = Rest.get(); if (r.state === 'idle') kvSet('rest', { state: 'idle', dur: se.entries[se.idx].planned.rest }); render(); window.scrollTo(0, 0); };
A.sessPause = () => { const se = activeSession(), now = Date.now(); if (se.pausedAt) { se.pauses.push({ s: se.pausedAt, e: now }); se.pausedAt = null; } else se.pausedAt = now; save('sessions', se); render(); };
A.step = (d, el) => {
  const input = el.parentNode.querySelector('input'), ph = num(input.placeholder); let v = num(input.value);
  if (v == null) v = ph != null ? ph : (+d.d > 0 ? 1 : 0); else v = Math.max(0, v + (+d.d));
  input.value = r2(v); C.setv(input.dataset, input.value);
};
C.setv = (d, v) => {
  const n = num(v); let re = false;
  mutSession(d.sid, se => { const s = se.entries[d.e].sets[d.s]; s[d.f] = d.f === 'w' ? U.wIn(n == null ? null : Math.max(0, n)) : (n == null ? null : Math.max(0, Math.round(n))); if (d.f === 'r' && !s.r && s.done) { s.done = false; re = true; } });
  if (re) render();
};
A.setDone = d => {
  const cur0 = sessionById(d.sid).entries[d.e].sets[d.s];
  if (!cur0.done && !(cur0.r > 0)) { toast('Informe as repetições realizadas para concluir a série.'); return; }
  const se = mutSession(d.sid, se => { const s = se.entries[d.e].sets[d.s]; s.done = !s.done; if (s.done) s.at = Date.now(); else delete s.at; });
  if (se.status === 'active' && se.entries[d.e].sets[d.s].done) { const r = Rest.get(); if (r.state === 'idle' || r.state === 'done') kvSet('rest', { state: 'idle', dur: se.entries[d.e].planned.rest }); }
  render();
  const rp = $('#restPanel'); if (rp && se.entries[d.e].sets[d.s].done) { rp.classList.add('pulse'); setTimeout(() => rp.classList.remove('pulse'), 1200); }
};
A.addSet = d => { mutSession(d.sid, se => se.entries[d.e].sets.push({ w: null, r: null, done: false })); render(); };
A.setMenu = d => openSheet(`<h2>Série ${+d.s + 1}</h2><p class="mut">Excluir remove esta série do registro deste treino.</p><div class="stack"><button class="btn danger" data-a="delSet" data-sid="${d.sid}" data-e="${d.e}" data-s="${d.s}">${ic('trash', 18)} Excluir série</button><button class="btn ghost" data-a="closeSheet">Cancelar</button></div>`);
A.delSet = d => { closeSheet(); mutSession(d.sid, se => se.entries[d.e].sets.splice(+d.s, 1)); render(); };
C.entryNote = (d, v) => mutSession(d.sid, se => { se.entries[d.e].note = v; });
A.exSheet = d => {
  const e = exById(d.id); if (!e) { toast('Exercício não está mais na biblioteca.'); return; }
  openSheet(`<h2>${esc(e.name)}</h2><p class="mut sm">${esc(e.group)}${e.sec.length ? ' · secundários: ' + esc(e.sec.join(', ')) : ''} · ${esc(e.equip || '')}</p>${bodyFig(e.group, e.sec)}<h4>Execução</h4><p>${esc(e.how || '—')}</p><h4>Postura</h4><p>${esc(e.tips || '—')}</p><div class="stack">${demoBtn(e.id, e.name, true)}<button class="btn ghost" data-a="closeSheet">Fechar</button></div>`);
};
A.finishAsk = () => {
  const st = sessionStats(activeSession()), pend = st.setsTotal - st.setsDone;
  openSheet(`<h2>Finalizar treino?</h2><p>${st.setsDone} de ${st.setsTotal} séries concluídas em ${fdur(st.dur)}.</p>${pend ? `<p class="note warn">${pend} ${pend > 1 ? 'séries ficarão registradas como pendentes' : 'série ficará registrada como pendente'} (não contam como realizadas):<br>${st.pending.map(p => `${esc(p.name)} — ${p.n}`).join('<br>')}</p>` : ''}<div class="stack"><button class="btn big" data-a="finish">${ic('flag', 20)} Finalizar treino</button><button class="btn ghost" data-a="closeSheet">Continuar treinando</button></div>`);
};
A.finish = () => {
  closeSheet(); const se = activeSession(); if (!se) return; const now = Date.now();
  if (se.pausedAt) { se.pauses.push({ s: se.pausedAt, e: now }); se.pausedAt = null; }
  se.endedAt = now; se.status = 'done'; save('sessions', se);
  kvSet('rest', { state: 'idle', dur: S.kv.settings.rest });
  stack = [{ v: 'home', p: {} }, { v: 'summary', p: { id: se.id } }]; render(); window.scrollTo(0, 0);
};
A.discardAsk = () => confirmDlg('Descartar treino?', 'O treino em andamento e as séries registradas nele serão apagados. Esta ação não pode ser desfeita.', 'Descartar treino', () => {
  const se = activeSession(); if (se) remove('sessions', se.id); kvSet('rest', { state: 'idle', dur: S.kv.settings.rest }); tab('train');
}, true);

/* Resumo após finalizar */
const SCALE = [['feel', 'Como se sentiu'], ['energy', 'Nível de energia'], ['sleep', 'Qualidade do sono'], ['difficulty', 'Dificuldade dos exercícios']];
function diaryScales(date) {
  const dz = S.diary[date] || {};
  return SCALE.map(([f, l]) => `<div class="scale"><span>${l}</span><div class="chips">${[1, 2, 3, 4, 5].map(n => `<button class="chip ${dz[f] === n ? 'on' : ''}" data-a="diarySet" data-date="${date}" data-f="${f}" data-v="${n}" aria-label="${l}: ${n} de 5">${n}</button>`).join('')}</div></div>`).join('');
}
A.diarySet = d => { const o = S.diary[d.date] || { date: d.date }; o[d.f] = o[d.f] === +d.v ? null : +d.v; save('diary', o); if ($('#sheet').classList.contains('on')) A.diaryEdit({ date: d.date }); else render(); };
C.diaryText = (d, v) => { const o = S.diary[d.date] || { date: d.date }; o[d.f] = v; save('diary', o); };
C.sessNote = (d, v) => mutSession(d.sid, se => { se.note = v; });
V.summary = p => {
  const se = sessionById(p.id); if (!se) return head('Resumo', { back: true });
  const st = sessionStats(se), lines = [], records = [];
  for (const e of se.entries) {
    if (!doneSets(e).length) continue;
    const prev = prevEntry(e.exId, se.startedAt), pm = progressMsg(e, prev && prev.e), old = prs(e.exId, se.startedAt), b = bestSet(e);
    if (pm) lines.push(`<div class="li s"><div><b>${esc(e.name)}</b><span class="sm ${pm.up ? 'upc' : 'mut'}">${esc(pm.t)}</span>${topRange(e) ? '<span class="sm warnc">Topo da faixa em todas as séries: avalie com o profissional um possível aumento de carga.</span>' : ''}</div></div>`);
    if (old && (b.w || 0) > old.maxW.v) records.push(`${esc(e.name)}: maior carga — ${fw(b.w)}`);
    else if (old && Math.max(...doneSets(e).map(s => s.r)) > old.maxR.v) records.push(`${esc(e.name)}: mais repetições — ${Math.max(...doneSets(e).map(s => s.r))}`);
  }
  return `<section class="card hero done"><div class="badge">${ic('trophy', 30)}</div><h2>PARABÉNS! TREINO CONCLUÍDO</h2><p>${esc(se.name)} · ${fdate(se.date)} · ${ftime(se.startedAt)}–${ftime(se.endedAt)}</p></section>
    <section class="grid2"><div class="card stat"><span>Tempo total</span><b>${fdur(st.dur)}</b></div><div class="card stat"><span>Exercícios realizados</span><b>${st.exDone} de ${st.exTotal}</b></div><div class="card stat"><span>Séries concluídas</span><b>${st.setsDone} de ${st.setsTotal}</b></div><div class="card stat"><span>Volume total</span><b>${st.vol > 0 ? fmt(U.w(st.vol), 0) + ' ' + U.wl() : '—'}</b></div></section>
    <section class="card"><h3>Melhor desempenho</h3><p>${st.best && setVol(st.best.s) > 0 ? `${esc(st.best.name)} — ${fw(st.best.s.w)} × ${st.best.s.r} repetições` : st.best ? `${esc(st.best.name)} — ${st.best.s.r} repetições` : 'Sem séries concluídas nesta sessão.'}</p>${records.length ? `<p class="note up">${ic('trophy', 14)} Novo recorde pessoal:<br>${records.join('<br>')}</p>` : ''}</section>
    ${lines.length ? `<section class="card"><h3>Comparação com o treino anterior</h3>${lines.join('')}</section>` : ''}
    ${st.pending.length ? `<section class="card"><h3>Pendências registradas</h3><p class="mut">${st.pending.map(x => `${esc(x.name)}: ${x.n} ${x.n > 1 ? 'séries não realizadas' : 'série não realizada'}`).join('<br>')}</p></section>` : ''}
    <section class="card"><h3>Observações da sessão</h3><textarea rows="3" placeholder="Como foi o treino?" data-c="sessNote" data-sid="${se.id}">${esc(se.note || '')}</textarea>${diaryScales(se.date)}<p class="mut sm">Escala de 1 (baixo) a 5 (alto). Opcional.</p></section>
    <button class="btn big" data-a="tab" data-v="home">Concluir</button>`;
};
