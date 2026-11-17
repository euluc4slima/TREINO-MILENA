'use strict';
/* EVOLUÇÃO — corpo, exercícios, fotos, resumo semanal e diário */
const BODY_F = { weight: ['Peso', 'w'], waist: ['Cintura', 'l'], hip: ['Quadril', 'l'], glutes: ['Glúteos', 'l'], thigh: ['Coxas', 'l'], arm: ['Braços', 'l'], fat: ['% gordura', '%'] };
const bodyFmt = (f, v) => BODY_F[f][1] === 'w' ? fw(v) : BODY_F[f][1] === 'l' ? fl(v) : `${fmt(v)}%`;
const bodyOut = (f, v) => BODY_F[f][1] === 'w' ? U.w(v) : BODY_F[f][1] === 'l' ? U.l(v) : v;
const bodyIn = (f, v) => BODY_F[f][1] === 'w' ? U.wIn(v) : BODY_F[f][1] === 'l' ? U.lIn(v) : v;
const bodyUnit = f => BODY_F[f][1] === 'w' ? U.wl() : BODY_F[f][1] === 'l' ? U.ll() : '%';
let evoTab = 'corpo', evoMetric = 'weight', evoRange = '84', evoEx = '', evoExM = 'maxW', phA = '', phB = '', phPose = 'Frente';
const RANGES = [['7', '7 dias'], ['30', '30 dias'], ['90', '90 dias'], ['84', '12 semanas'], ['all', 'Tudo']];
const POSES = ['Frente', 'Lateral', 'Costas'];

V.evo = () => head('Evolução', { sub: 'Resultados registrados' }) + `<div class="seg four">${[['corpo', 'Corpo'], ['ex', 'Exercícios'], ['fotos', 'Fotos'], ['resumo', 'Resumo']].map(([v, l]) => `<button class="${evoTab === v ? 'on' : ''}" data-a="evoTab" data-v="${v}">${l}</button>`).join('')}</div>` + ({ corpo: evoCorpo, ex: evoExs, fotos: evoFotos, resumo: evoResumo }[evoTab])();
A.evoTab = d => { evoTab = d.v; render(); };

function evoCorpo() {
  const from = evoRange === 'all' ? '' : addDays(today(), -(+evoRange)), recs = bodySorted().filter(b => b[evoMetric] != null && b.date >= from);
  const pts = recs.map(b => ({ x: dparse(b.date).getTime(), y: bodyOut(evoMetric, b[evoMetric]) })), a = recs[0], z = recs[recs.length - 1], p = S.kv.profile;
  return `<section class="card"><div class="grid3"><div class="stat"><span>Peso atual</span><b>${fw(currentWeight())}</b></div><div class="stat"><span>Desde o início</span><b>${sign(U.w(currentWeight() - p.startWeight))} ${U.wl()}</b></div><div class="stat"><span>IMC (estimado)</span><b>${fmt(bmi())}</b></div></div></section>
    <section class="card">${chips(Object.entries(BODY_F).map(([k, v]) => [k, v[0]]), evoMetric, 'evoMetric')}${lineChart(pts, bodyUnit(evoMetric))}${chips(RANGES, evoRange, 'evoRange')}
      ${a && z && a !== z ? `<p class="mut sm">${fshort(a.date)}: ${bodyFmt(evoMetric, a[evoMetric])} → ${fshort(z.date)}: ${bodyFmt(evoMetric, z[evoMetric])} (<b>${sign(bodyOut(evoMetric, z[evoMetric]) - bodyOut(evoMetric, a[evoMetric]))} ${bodyUnit(evoMetric)}</b>)</p>` : ''}</section>
    <button class="btn big" data-a="bodyForm">${ic('plus', 20)} Registrar peso e medidas</button>
    <h3 class="sec">Avaliações</h3>${bodySorted().reverse().map(b => `<button class="li card" data-a="bodyForm" data-id="${b.id}"><div><b>${fdate(b.date)}</b><span class="mut sm">${Object.keys(BODY_F).filter(f => b[f] != null).map(f => `${BODY_F[f][0]} ${bodyFmt(f, b[f])}`).join(' · ') || 'Sem valores'}</span>${b.note ? `<span class="mut sm">${esc(b.note)}</span>` : ''}</div>${ic('edit', 16)}</button>`).join('') || '<div class="card"><p class="mut">Nenhuma avaliação registrada. Sugestão do plano: peso em 2–3 manhãs por semana e medidas nas semanas 4, 8 e 12.</p></div>'}
    <p class="foot">A evolução também se mede por força, medidas, disposição e bem-estar — não só pelo número na balança.</p>`;
}
A.evoMetric = d => { evoMetric = d.v; render(); };
A.evoRange = d => { evoRange = d.v; render(); };
A.bodyForm = d => {
  const b = d.id ? S.body.find(x => x.id === d.id) : { date: today() }, n = 'type="number" inputmode="decimal" min="0" step="any"';
  openSheet(`<h2>${d.id ? 'Editar avaliação' : 'Nova avaliação'}</h2><input type="hidden" name="id" value="${esc(d.id || '')}">${field('Data', 'name="date" type="date"', b.date)}
    <div class="grid2">${Object.keys(BODY_F).map(f => field(`${BODY_F[f][0]}${f === 'fat' ? ' (estimado)' : ` (${bodyUnit(f)})`}`, `name="${f}" ${n}`, b[f] == null ? '' : r2(bodyOut(f, b[f])))).join('')}</div>${field('Observações', 'name="note"', b.note || '')}
    <p class="mut sm">Preencha só o que mediu. Campos vazios não entram nos gráficos.</p><div class="stack"><button class="btn" data-a="bodySave">Salvar</button>${d.id ? `<button class="btn danger" data-a="bodyDel" data-id="${d.id}">${ic('trash', 18)} Excluir avaliação</button>` : ''}<button class="btn ghost" data-a="closeSheet">Cancelar</button></div>`);
};
A.bodySave = () => {
  const f = formVals(), b = { id: f.id || uid(), date: f.date || today(), note: f.note };
  for (const k of Object.keys(BODY_F)) { const v = num(f[k]); b[k] = v == null ? null : bodyIn(k, v); }
  if (!Object.keys(BODY_F).some(k => b[k] != null)) { toast('Informe ao menos um valor.'); return; }
  save('body', b); closeSheet(); render(); toast('Avaliação salva.');
};
A.bodyDel = d => confirmDlg('Excluir avaliação?', 'O registro será removido dos gráficos. Esta ação não pode ser desfeita.', 'Excluir', () => { remove('body', d.id); render(); }, true);

function evoExs() {
  const withH = S.exercises.filter(e => exHistory(e.id).length).sort((a, b) => a.name.localeCompare(b.name));
  if (!withH.length) return '<div class="card"><p class="mut">Os gráficos por exercício aparecem depois do primeiro treino concluído com séries registradas.</p></div>';
  if (!withH.some(e => e.id === evoEx)) evoEx = withH[0].id;
  const h = exHistory(evoEx), pr = prs(evoEx), M = { maxW: ['Carga máxima', x => U.w(x.maxW), U.wl()], bestR: ['Repetições', x => x.bestR, 'reps'], vol: ['Volume', x => U.w(x.vol), U.wl()] }, m = M[evoExM];
  const weeks = {}; h.forEach(x => { const k = mondayOf(x.date); (weeks[k] = weeks[k] || []).push(x); });
  return `<section class="card"><label class="f"><span>Exercício</span>${sel(withH.map(e => [e.id, e.name]), evoEx, 'data-c="evoEx"')}</label>${chips(Object.entries(M).map(([k, v]) => [k, v[0]]), evoExM, 'evoExM')}${lineChart(h.map(x => ({ x: x.t, y: m[1](x) })), m[2])}</section>
    <section class="card"><h3>Recordes pessoais</h3><div class="grid3"><div class="stat"><span>Maior carga</span><b>${fw(pr.maxW.v)}</b><small>${pr.maxW.r} reps · ${fshort(pr.maxW.date)}</small></div><div class="stat"><span>Mais repetições</span><b>${pr.maxR.v}</b><small>${fw(pr.maxR.w)} · ${fshort(pr.maxR.date)}</small></div><div class="stat"><span>Maior volume</span><b>${fmt(U.w(pr.maxVol.v), 0)}</b><small>${U.wl()} · ${fshort(pr.maxVol.date)}</small></div></div>
      ${h.length > 1 ? `<p class="mut sm">Do primeiro ao último registro: carga ${sign(U.w(h[h.length - 1].maxW - h[0].maxW))} ${U.wl()} · volume ${sign(U.w(h[h.length - 1].vol - h[0].vol), 0)} ${U.wl()}</p>` : ''}</section>
    <section class="card"><h3>Histórico por semana</h3><div class="tbl"><div class="tr th c4"><span>Semana de</span><span>Carga</span><span>Reps</span><span>Volume</span></div>${Object.keys(weeks).sort().reverse().map(k => { const w = weeks[k]; return `<div class="tr c4"><span>${fshort(k)}</span><span>${fmt(U.w(Math.max(...w.map(x => x.maxW))))}</span><span>${Math.max(...w.map(x => x.bestR))}</span><span>${fmt(U.w(w.reduce((a, x) => a + x.vol, 0)), 0)}</span></div>`; }).join('')}</div></section>
    <button class="btn ghost" data-a="go" data-v="exercise" data-id="${evoEx}">Ver página do exercício</button>`;
}
C.evoEx = (d, v) => { evoEx = v; render(); };
A.evoExM = d => { evoExM = d.v; render(); };

function evoFotos() {
  const dates = [...new Set(S.photos.map(p => p.date))].sort(); if (!dates.includes(phA)) phA = dates[0] || ''; if (!dates.includes(phB)) phB = dates[dates.length - 1] || '';
  const get = (d, pose) => S.photos.find(p => p.date === d && p.pose === pose), cmp = d => { const p = get(d, phPose); return `<div class="cmp">${p ? `<img src="${p.data}" alt="Foto ${phPose} de ${fdate(d)}">` : `<div class="empty">Sem foto ${phPose.toLowerCase()} nesta data</div>`}<span>${d ? fdate(d) : '—'}</span></div>`; };
  return `<p class="note">${ic('info', 14)} As fotos ficam somente neste aparelho, dentro do app. Nada é enviado para servidores e nenhuma análise automática é feita sobre as imagens.</p>
    <section class="card"><h3>Adicionar foto</h3><div class="grid2">${field('Data', 'type="date" id="phDate"', today())}<label class="f"><span>Posição</span>${sel(POSES.map(p => [p, p]), 'Frente', 'id="phPoseNew"')}</label></div><label class="btn ghost filebtn">${ic('camera', 18)} Tirar ou escolher foto<input type="file" accept="image/*" data-c="photoAdd" hidden></label></section>
    ${dates.length ? `<section class="card"><h3>Comparar datas</h3>${chips(POSES.map(p => [p, p]), phPose, 'phPose')}<div class="grid2">${sel(dates.map(d => [d, fdate(d)]), phA, 'data-c="phA" aria-label="Primeira data"')}${sel(dates.map(d => [d, fdate(d)]), phB, 'data-c="phB" aria-label="Segunda data"')}</div><div class="grid2">${cmp(phA)}${cmp(phB)}</div></section>
      <h3 class="sec">Galeria</h3>${dates.slice().reverse().map(d => `<section class="card"><b>${fdate(d)}</b><div class="gal">${S.photos.filter(p => p.date === d).sort((a, b) => POSES.indexOf(a.pose) - POSES.indexOf(b.pose)).map(p => `<button data-a="photoView" data-id="${p.id}"><img src="${p.data}" alt="${p.pose}"><span>${p.pose}</span></button>`).join('')}</div></section>`).join('')}` : '<div class="card"><p class="mut">Nenhuma foto registrada. Dica: mesma luz, mesmo local e mesma distância facilitam a comparação.</p></div>'}`;
}
function readImage(file) {
  return new Promise((res, rej) => {
    const img = new Image(), url = URL.createObjectURL(file);
    img.onload = () => { const k = Math.min(1, 1280 / Math.max(img.width, img.height)), c = document.createElement('canvas'); c.width = Math.round(img.width * k); c.height = Math.round(img.height * k); c.getContext('2d').drawImage(img, 0, 0, c.width, c.height); URL.revokeObjectURL(url); res(c.toDataURL('image/jpeg', .82)); };
    img.onerror = () => { URL.revokeObjectURL(url); rej(new Error('imagem inválida')); }; img.src = url;
  });
}
C.photoAdd = async (d, v, el) => {
  const file = el.files && el.files[0]; if (!file) return;
  try { const date = $('#phDate').value || today(), pose = $('#phPoseNew').value, data = await readImage(file), old = S.photos.find(p => p.date === date && p.pose === pose); if (old) await remove('photos', old.id); await save('photos', { id: uid(), date, pose, data }); toast('Foto salva neste aparelho.'); render(); }
  catch (e) { toast('Não foi possível ler esta imagem.'); }
};
A.phPose = d => { phPose = d.v; render(); };
C.phA = (d, v) => { phA = v; render(); };
C.phB = (d, v) => { phB = v; render(); };
A.photoView = d => { const p = S.photos.find(x => x.id === d.id); openSheet(`<h2>${p.pose} · ${fdate(p.date)}</h2><img class="phfull" src="${p.data}" alt="Foto ${p.pose}"><div class="stack"><button class="btn danger" data-a="photoDel" data-id="${p.id}">${ic('trash', 18)} Excluir foto</button><button class="btn ghost" data-a="closeSheet">Fechar</button></div>`); };
A.photoDel = d => confirmDlg('Excluir foto?', 'A imagem será apagada deste aparelho. Esta ação não pode ser desfeita.', 'Excluir foto', () => { remove('photos', d.id); render(); }, true);

function evoResumo() {
  const mon = mondayOf(today()), a = weekStats(addDays(mon, -7)), b = weekStats(mon), dW = (x, f) => x == null ? '—' : f(x);
  const row = (l, va, vb, diff) => `<div class="tr c4"><span>${l}</span><span>${va}</span><span><b>${vb}</b></span><span>${diff}</span></div>`;
  const d = (x, y, dec = 0, conv = v => v) => (x == null || y == null) ? '—' : sign(conv(y) - conv(x), dec);
  const diary = Object.values(S.diary).filter(z => SCALE.some(([f]) => z[f]) || z.note || z.foodNote).sort((x, y) => y.date.localeCompare(x.date));
  return `<section class="card"><h3>Resumo semanal</h3><p class="mut sm">Semana atual (desde ${fshort(mon)}) comparada com a anterior.</p>
      <div class="tbl"><div class="tr th c4"><span></span><span>Anterior</span><span>Atual</span><span>Dif.</span></div>
      ${row('Treinos realizados', a.n, b.n, d(a.n, b.n))}${row('Séries concluídas', a.sets, b.sets, d(a.sets, b.sets))}${row(`Volume (${U.wl()})`, fmt(U.w(a.vol), 0), fmt(U.w(b.vol), 0), d(a.vol, b.vol, 0, U.w))}
      ${row('Duração média', dW(a.dur, fdur), dW(b.dur, fdur), (a.dur == null || b.dur == null) ? '—' : sign((b.dur - a.dur) / 60000, 0) + ' min')}${row('Proteína média (g)', dW(a.prot, x => fmt(x, 0)), dW(b.prot, x => fmt(x, 0)), d(a.prot, b.prot))}${row(`Peso médio (${U.wl()})`, dW(a.weight, x => fmt(U.w(x))), dW(b.weight, x => fmt(U.w(x))), d(a.weight, b.weight, 1, U.w))}</div>
      <p class="mut sm">Proteína média considera apenas os dias com consumo registrado (${b.protDays} nesta semana).</p></section>
    <section class="card"><h3>Grupos musculares trabalhados na semana</h3>${Object.keys(b.groups).length ? Object.entries(b.groups).sort((x, y) => y[1] - x[1]).map(([g, n]) => `<div class="mrow"><div class="mrow-h"><span>${g}</span><span>${n} séries</span></div>${bar(100 * n / Math.max(...Object.values(b.groups)))}</div>`).join('') : '<p class="mut">Nenhuma série concluída nesta semana ainda.</p>'}</section>
    <section class="card"><div class="rowb"><h3>Diário</h3><button class="btn sm" data-a="diaryEdit" data-date="${today()}">${ic('edit', 16)} Registrar hoje</button></div>
      ${diary.slice(0, 30).map(z => `<button class="li s" data-a="diaryEdit" data-date="${z.date}"><div><b>${fdate(z.date)}</b><span class="mut sm">${SCALE.filter(([f]) => z[f]).map(([f, l]) => `${l}: ${z[f]}/5`).join(' · ')}</span>${z.note ? `<span class="mut sm">${esc(z.note)}</span>` : ''}${z.foodNote ? `<span class="mut sm">Alimentação: ${esc(z.foodNote)}</span>` : ''}</div>${ic('edit', 16)}</button>`).join('') || '<p class="mut">Registre como se sentiu, energia, sono e dificuldade dos treinos.</p>'}</section>
    <section class="card"><h3>Checklist semanal</h3><ul><li>Realizou os treinos ou ajustou a semana conforme a recuperação.</li><li>Registrou cargas e repetições.</li><li>Incluiu fontes de proteína nas principais refeições.</li><li>Acompanhou sono, disposição, apetite e bem-estar.</li><li>Evitou comparar o próprio corpo com o de outras pessoas.</li></ul></section>`;
}
A.diaryEdit = d => { const z = S.diary[d.date] || {}; openSheet(`<h2>Diário · ${fdate(d.date)}</h2>${diaryScales(d.date)}<label class="f"><span>Observações</span><textarea rows="3" data-c="diaryText" data-date="${d.date}" data-f="note">${esc(z.note || '')}</textarea></label><label class="f"><span>Observações sobre alimentação</span><textarea rows="2" data-c="diaryText" data-date="${d.date}" data-f="foodNote">${esc(z.foodNote || '')}</textarea></label><button class="btn" data-a="diaryClose">Concluir</button>`); };
A.diaryClose = () => { closeSheet(); render(); };
