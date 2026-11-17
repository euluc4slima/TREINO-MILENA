'use strict';
/* Biblioteca de exercícios */
let libQ = '', libG = '', libE = '';
const libList = () => {
  const q = libQ.toLowerCase(), l = S.exercises.filter(e => (!q || e.name.toLowerCase().includes(q)) && (!libG || e.group === libG || e.sec.includes(libG)) && (!libE || (e.equip || '') === libE)).sort((a, b) => a.name.localeCompare(b.name));
  return l.map(e => `<button class="li card" data-a="go" data-v="exercise" data-id="${e.id}"><div><b>${esc(e.name)}</b><span class="mut sm">${esc(e.group)} · ${esc(e.equip || 'sem equipamento')}</span></div>${ic('next', 18)}</button>`).join('') || '<p class="mut center">Nenhum exercício encontrado.</p>';
};
V.library = () => head('Biblioteca', { back: true, sub: `${S.exercises.length} exercícios`, right: `<button class="ib" data-a="exForm" aria-label="Novo exercício">${ic('plus')}</button>` }) + `
  <input type="search" placeholder="Buscar exercício" value="${esc(libQ)}" data-oi="libQ" aria-label="Buscar exercício">
  <div class="grid2">${sel([['', 'Todos os grupos'], ...GROUPS.map(g => [g, g])], libG, 'data-c="libG" aria-label="Grupo muscular"')}${sel([['', 'Todo equipamento'], ...[...new Set(S.exercises.map(e => e.equip).filter(Boolean))].sort().map(x => [x, x])], libE, 'data-c="libE" aria-label="Equipamento"')}</div>
  <div id="libList">${libList()}</div>`;
OI.libQ = (d, v) => { libQ = v; $('#libList').innerHTML = libList(); };
C.libG = (d, v) => { libG = v; $('#libList').innerHTML = libList(); };
C.libE = (d, v) => { libE = v; $('#libList').innerHTML = libList(); };
A.exForm = d => {
  const e = d.id ? exById(d.id) : { name: '', group: 'Glúteos', sec: [], equip: '', rest: 60, how: '', tips: '', video: '' };
  openSheet(`<h2>${d.id ? 'Editar exercício' : 'Novo exercício'}</h2><input type="hidden" name="id" value="${esc(d.id || '')}">${field('Nome', 'name="name"', e.name)}
    <label class="f"><span>Grupo muscular principal</span>${sel(GROUPS.map(g => [g, g]), e.group, 'name="group"')}</label>${field('Grupos secundários (separados por vírgula)', 'name="sec"', e.sec.join(', '))}${field('Equipamento', 'name="equip"', e.equip)}${field('Descanso padrão (s)', 'name="rest" type="number" inputmode="numeric"', e.rest)}${field('Arquivo de vídeo local (nome sem .mp4)', 'name="video" autocapitalize="off"', videoSlug(e))}
    <label class="f"><span>Descrição da execução</span><textarea name="how" rows="4">${esc(e.how)}</textarea></label><label class="f"><span>Orientações de postura</span><textarea name="tips" rows="3">${esc(e.tips)}</textarea></label>
    <div class="stack"><button class="btn" data-a="exSave">Salvar</button><button class="btn ghost" data-a="closeSheet">Cancelar</button></div>`);
};
A.exSave = () => {
  const f = formVals(); if (!f.name.trim()) { toast('Informe o nome do exercício.'); return; }
  const e = { ...(f.id ? exById(f.id) : { id: uid(), custom: true }), name: f.name.trim(), group: f.group, sec: f.sec.split(',').map(s => s.trim()).filter(Boolean), equip: f.equip.trim(), rest: Math.round(num(f.rest) || 60), video: slugify(f.video), how: f.how, tips: f.tips };
  save('exercises', e); closeSheet(); render(); toast('Exercício salvo.');
};
A.exDel = d => {
  if (S.workouts.some(w => w.items.some(i => i.exId === d.id))) { toast('Remova o exercício dos treinos antes de excluí-lo.'); return; }
  confirmDlg('Excluir exercício?', 'Ele sai da biblioteca. Registros antigos no histórico são mantidos.', 'Excluir', () => { remove('exercises', d.id); back(); }, true);
};
V.exercise = p => {
  const e = exById(p.id); if (!e) return head('Exercício', { back: true }) + '<div class="card"><p>Exercício não encontrado.</p></div>';
  const h = exHistory(e.id), pr = prs(e.id), used = S.workouts.flatMap(w => w.items.filter(i => i.exId === e.id).map(i => `${w.name}: ${i.sets} × ${repLabel(i)} · descanso ${i.rest}s`));
  return head(e.name, { back: true, right: `<button class="ib" data-a="exForm" data-id="${e.id}" aria-label="Editar exercício">${ic('edit')}</button>` }) + `
    <section class="card"><div class="exfig">${bodyFig(e.group, e.sec)}<div><span class="tag">Principal</span><p><b>${esc(e.group)}</b></p><span class="tag">Secundários</span><p>${esc(e.sec.join(', ') || '—')}</p><span class="tag">Equipamento</span><p>${esc(e.equip || '—')}</p></div></div>
      <p class="mut sm">Ilustração esquemática dos grupos musculares. Para a demonstração do movimento, use o vídeo de referência.</p>
      ${demoBtn(e.id, e.name)}<p class="mut sm">Vídeo local esperado: <code>videos/exercises/${esc(videoSlug(e) || '(não definido)')}.mp4</code></p></section>
    <section class="card"><h3>Execução</h3><p>${esc(e.how || '—')}</p><h3>Postura</h3><p>${esc(e.tips || '—')}</p></section>
    <section class="card"><h3>Prescrição nos treinos</h3><p>${used.length ? used.map(esc).join('<br>') : 'Ainda não está em nenhum treino.'}</p><p class="mut sm">Descanso padrão: ${e.rest}s. Cargas, repetições e observações são registradas na Tela de Treino.</p></section>
    <section class="card"><h3>Recordes pessoais</h3>${pr ? `<div class="grid3"><div class="stat"><span>Maior carga</span><b>${fw(pr.maxW.v)}</b><small>${pr.maxW.r} reps · ${fshort(pr.maxW.date)}</small></div><div class="stat"><span>Mais repetições</span><b>${pr.maxR.v}</b><small>${fw(pr.maxR.w)} · ${fshort(pr.maxR.date)}</small></div><div class="stat"><span>Maior volume</span><b>${fmt(U.w(pr.maxVol.v), 0)}</b><small>${U.wl()} · ${fshort(pr.maxVol.date)}</small></div></div>` : '<p class="mut">Sem registros ainda.</p>'}</section>
    <section class="card"><h3>Histórico de desempenho</h3>${lineChart(h.map(x => ({ x: x.t, y: U.w(x.maxW) })), U.wl())}
      ${h.slice().reverse().slice(0, 12).map(x => `<button class="li s" data-a="go" data-v="sessionDetail" data-id="${x.sid}"><div><b>${fdate(x.date)}</b><span class="mut sm">${x.sets.map(s => `${fmt(U.w(s.w || 0))}×${s.r}`).join(' · ')}</span></div>${ic('next', 16)}</button>`).join('')}</section>
    ${e.custom || true ? `<button class="lnk center dangerc" data-a="exDel" data-id="${e.id}">Excluir exercício</button>` : ''}`;
};
