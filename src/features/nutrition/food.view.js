'use strict';
/* ALIMENTAÇÃO — plano x consumo real, substituições, alimentos, metas e histórico */
let foodDate = today();
const mealsOf = src => src === 'plan' ? S.kv.mealPlan : ensureDay(foodDate).meals;
function saveMeals(src) { const sortT = a => a.sort((x, y) => (x.time || '').localeCompare(y.time || '')); if (src === 'plan') { sortT(S.kv.mealPlan); return kvSet('mealPlan', S.kv.mealPlan); } sortT(S.days[foodDate].meals); return save('days', S.days[foodDate]); }
const nutLine = n => `${fmt(n.kcal, 0)} kcal · P ${fmt(n.p)} g · C ${fmt(n.c)} g · G ${fmt(n.f)} g`;
function mealCard(m, mi, src) {
  const day = src === 'day', a = `data-src="${src}" data-m="${mi}"`, cons = m.items.filter(i => i.consumed).length;
  const st = !day ? '' : cons === 0 ? '<span class="pill planned">Planejado</span>' : cons < m.items.length ? '<span class="pill active">Parcial</span>' : '<span class="pill done">Consumido</span>';
  return `<section class="card meal"><div class="rowb"><button class="lnk l" data-a="mealMenu" ${a}><b>${esc(m.time || '--:--')} · ${esc(m.name)}</b><span class="mut sm">${nutLine(sumNut([m], false))} (estimado)</span></button>${st}</div>
    ${m.items.map((i, ii) => { const n = itemNut(i); return `<div class="fi ${i.consumed ? 'on' : ''}">${day ? `<button class="ck sm ${i.consumed ? 'on' : ''}" data-a="foodToggle" ${a} data-i="${ii}" aria-pressed="${!!i.consumed}" aria-label="${i.consumed ? 'Consumido' : 'Marcar como consumido'}: ${esc(itemName(i))}">${ic('check', 18)}</button>` : ''}
      <button class="fi-m" data-a="itemSheet" ${a} data-i="${ii}"><b>${esc(itemName(i))}</b><span class="mut sm">${fmt(i.qty, 0)} ${itemUnit(i)} · ${fmt(n.kcal, 0)} kcal · ${fmt(n.p)} g prot.</span></button>${ic('next', 16)}</div>`; }).join('') || '<p class="mut sm">Nenhum alimento nesta refeição.</p>'}
    ${m.note ? `<p class="mut sm">${esc(m.note)}</p>` : ''}
    <div class="rowb"><button class="btn sm ghost" data-a="foodPick" ${a}>${ic('plus', 16)} Alimento</button>${day && m.items.length ? `<button class="btn sm ${cons === m.items.length ? 'ghost' : ''}" data-a="mealAll" ${a}>${cons === m.items.length ? 'Desmarcar tudo' : 'Marcar tudo como consumido'}</button>` : ''}</div></section>`;
}
V.food = () => {
  const g = S.kv.goals, dv = dayView(foodDate), tot = sumNut(dv.meals, true), plan = sumNut(dv.meals, false), t = today();
  return head('Alimentação', { sub: 'Planejado × consumido' }) + `
    <div class="datenav"><button class="ib soft" data-a="foodNav" data-d="-1" aria-label="Dia anterior">${ic('back')}</button><div><b>${foodDate === t ? 'Hoje' : DOW[dow(foodDate)]}</b><span class="mut sm">${fdate(foodDate)}</span></div><button class="ib soft" data-a="foodNav" data-d="1" aria-label="Próximo dia">${ic('next')}</button></div>
    <section class="card"><div class="prot"><div><span class="mut sm">Proteína consumida</span><p class="big">${fmt(tot.p, 0)}<small> / ${g.pMin}–${g.pMax} g</small></p></div><div class="ring" style="--p:${Math.min(100, pctOf(tot.p, g.pMin))}"><b>${pctOf(tot.p, g.pMin)}%</b></div></div>
      ${g.showKcal ? macroRow('Calorias', tot.kcal, g.kcalMin, g.kcalMax, 'kcal') : ''}${macroRow('Carboidratos', tot.c, g.cMin, g.cMax, 'g')}${macroRow('Gorduras', tot.f, g.fMin, g.fMax, 'g')}
      <p class="mut sm">Planejado para o dia: ${nutLine(plan)}.</p>
      <p class="note">Valores e metas são estimativas do planejamento inicial, não uma prescrição nutricional. Valide com nutricionista. <button class="lnk" data-a="goalsSheet">Editar metas</button></p></section>
    <section class="card rowb water"><div>${ic('drop', 20)} <b>Água</b> <span class="mut sm">${dv.water || 0} ${(dv.water || 0) === 1 ? 'copo' : 'copos'} (~${fmt((dv.water || 0) * 0.25, 2)} L)</span></div><div class="ibs"><button class="ib soft" data-a="water" data-d="-1" aria-label="Remover copo">${ic('minus', 18)}</button><button class="ib soft" data-a="water" data-d="1" aria-label="Adicionar copo">${ic('plus', 18)}</button></div></section>
    ${dv.meals.map((m, i) => mealCard(m, i, 'day')).join('')}
    <button class="btn ghost" data-a="mealAdd" data-src="day">${ic('plus', 18)} Adicionar refeição</button>
    <label class="f"><span>Observações sobre a alimentação do dia</span><textarea rows="2" data-c="diaryText" data-date="${foodDate}" data-f="foodNote" placeholder="Apetite, dificuldades, como se sentiu…">${esc((S.diary[foodDate] || {}).foodNote || '')}</textarea></label>
    <div class="grid2 nav4"><button class="card navc" data-a="go" data-v="plan">${ic('list')}<span>Cardápio padrão</span></button><button class="card navc" data-a="go" data-v="subs">${ic('swap')}<span>Substituições</span></button><button class="card navc" data-a="go" data-v="foods">${ic('book')}<span>Alimentos</span></button><button class="card navc" data-a="go" data-v="foodHist">${ic('history')}<span>Histórico</span></button></div>`;
};
A.foodNav = d => { foodDate = addDays(foodDate, +d.d); render(); };
A.water = d => { const day = ensureDay(foodDate); day.water = Math.max(0, (day.water || 0) + (+d.d)); save('days', day); render(); };
function setConsumed(i, on) { if (on) { i.consumed = true; i.n = calcNut(foodById(i.foodId), i.qty); i.at = Date.now(); } else { i.consumed = false; delete i.n; delete i.at; } }
A.foodToggle = d => { const i = mealsOf('day')[d.m].items[d.i]; setConsumed(i, !i.consumed); saveMeals('day'); render(); };
A.mealAll = d => { const m = mealsOf('day')[d.m], all = m.items.every(i => i.consumed); m.items.forEach(i => setConsumed(i, !all)); saveMeals('day'); render(); };
A.mealAdd = d => { mealsOf(d.src).push({ id: uid(), name: 'Nova refeição', time: '12:00', items: [] }); saveMeals(d.src); render(); toast('Refeição adicionada. Toque no nome para editar.'); };
A.mealMenu = d => { const m = mealsOf(d.src)[d.m]; openSheet(`<h2>Refeição</h2><input type="hidden" name="src" value="${d.src}"><input type="hidden" name="m" value="${d.m}">${field('Nome', 'name="name"', m.name)}${field('Horário', 'name="time" type="time"', m.time)}${field('Observação', 'name="note"', m.note || '')}
  <div class="stack"><button class="btn" data-a="mealSave">Salvar</button><button class="btn danger" data-a="mealDel" data-src="${d.src}" data-m="${d.m}">${ic('trash', 18)} Excluir refeição</button><button class="btn ghost" data-a="closeSheet">Cancelar</button></div>${d.src === 'day' ? '<p class="mut sm">Alterações aqui valem só para este dia. Para mudar todos os dias, edite o cardápio padrão.</p>' : ''}`); };
A.mealSave = () => { const f = formVals(), m = mealsOf(f.src)[f.m]; m.name = f.name.trim() || 'Refeição'; m.time = f.time; m.note = f.note; saveMeals(f.src); closeSheet(); render(); };
A.mealDel = d => confirmDlg('Excluir refeição?', d.src === 'plan' ? 'A refeição sai do cardápio padrão. Dias já registrados não mudam.' : 'A refeição e os itens marcados nela serão removidos deste dia.', 'Excluir', () => { mealsOf(d.src).splice(+d.m, 1); saveMeals(d.src); render(); }, true);

/* Item: quantidade, substituição, remoção */
let itemCtx = null;
A.itemSheet = d => {
  itemCtx = { src: d.src, m: +d.m, i: +d.i }; const i = mealsOf(d.src)[d.m].items[d.i], f = foodById(i.foodId);
  if (d.src === 'day') saveMeals('day');
  openSheet(`<h2>${esc(itemName(i))}</h2><p class="mut sm">${f ? `Por 100 ${f.unit}: ${nutLine(f)} (aproximado)` : 'Alimento removido da biblioteca.'}</p>
    ${field(`Quantidade (${itemUnit(i)})`, 'type="number" inputmode="decimal" min="0" data-c="itemQty"', i.qty)}<p id="itemNut" class="note">${nutLine(itemNut(i))}</p>
    <div class="stack"><button class="btn" data-a="closeSheet">Concluir</button><button class="btn ghost" data-a="subList">${ic('swap', 18)} Substituir alimento</button><button class="btn danger" data-a="itemDel">${ic('trash', 18)} Remover</button></div>`);
};
const ctxItem = () => mealsOf(itemCtx.src)[itemCtx.m].items[itemCtx.i];
C.itemQty = (d, v) => { const i = ctxItem(); i.qty = Math.max(0, num(v) || 0); if (i.consumed) i.n = calcNut(foodById(i.foodId), i.qty); saveMeals(itemCtx.src); $('#itemNut').textContent = nutLine(itemNut(i)); render(); };
A.itemDel = () => { mealsOf(itemCtx.src)[itemCtx.m].items.splice(itemCtx.i, 1); saveMeals(itemCtx.src); closeSheet(); render(); };
function equiv(cf, qty, alt) { const k = MAIN[cf.group] || 'kcal', target = cf[k] * qty / 100; const q = alt[k] > 0 ? Math.max(5, Math.round(target / alt[k] * 100 / 5) * 5) : qty; return { q, k }; }
A.subList = () => {
  const i = ctxItem(), cf = foodById(i.foodId); if (!cf) { toast('Alimento original não está mais na biblioteca.'); return; }
  const base = calcNut(cf, i.qty), kn = { p: 'proteína', c: 'carboidrato', f: 'gordura', kcal: 'energia' }, alts = S.foods.filter(f => f.group === cf.group && f.id !== cf.id);
  openSheet(`<h2>Substituir ${esc(cf.name)}</h2><p class="mut sm">Atual: ${fmt(i.qty, 0)} ${cf.unit} — ${nutLine(base)}. A quantidade sugerida iguala a ${kn[MAIN[cf.group] || 'kcal']}; os demais valores podem diferir.</p>
    <div class="scroll">${alts.map(f => { const e = equiv(cf, i.qty, f), n = calcNut(f, e.q), dk = n.kcal - base.kcal, neq = Math.abs(dk) > Math.max(25, base.kcal * .2); return `<button class="li" data-a="subOk" data-id="${f.id}" data-q="${e.q}"><div><b>${esc(f.name)} — ${e.q} ${f.unit}</b><span class="mut sm">${nutLine(n)}</span>${neq ? `<span class="sm warnc">Não equivalente em energia: ${sign(dk, 0)} kcal</span>` : '<span class="sm upc">Aproximadamente equivalente</span>'}</div>${ic('swap', 18)}</button>`; }).join('') || '<p class="mut">Não há outras opções neste grupo. Cadastre novos alimentos na biblioteca.</p>'}</div>
    <button class="btn ghost" data-a="closeSheet">Cancelar</button>`);
};
A.subOk = d => { const i = ctxItem(); i.foodId = d.id; i.qty = +d.q; if (i.consumed) i.n = calcNut(foodById(i.foodId), i.qty); saveMeals(itemCtx.src); closeSheet(); render(); toast('Alimento substituído. Ajuste a quantidade se necessário.'); };

/* Seletor de alimentos */
let pickCtx = null;
const foodPickList = q => S.foods.filter(f => !q || f.name.toLowerCase().includes(q.toLowerCase())).sort((a, b) => a.name.localeCompare(b.name)).map(f => `<button class="li" data-a="foodPickOk" data-id="${f.id}"><div><b>${esc(f.name)}</b><span class="mut sm">${f.group} · por 100 ${f.unit}: ${fmt(f.kcal, 0)} kcal · ${fmt(f.p)} g prot.</span></div>${ic('plus', 18)}</button>`).join('') || '<p class="mut">Nenhum alimento encontrado.</p>';
A.foodPick = d => { pickCtx = { src: d.src, m: +d.m }; openSheet(`<h2>Adicionar alimento</h2><input type="search" placeholder="Buscar alimento" data-oi="foodQ" aria-label="Buscar alimento"><div id="foodPickList" class="scroll">${foodPickList('')}</div><div class="stack"><button class="btn ghost" data-a="foodForm">${ic('plus', 18)} Cadastrar novo alimento</button><button class="btn ghost" data-a="closeSheet">Fechar</button></div>`); };
OI.foodQ = (d, v) => { $('#foodPickList').innerHTML = foodPickList(v); };
A.foodPickOk = d => { const f = foodById(d.id), items = mealsOf(pickCtx.src)[pickCtx.m].items; items.push({ foodId: f.id, qty: f.portion || 100, ...(pickCtx.src === 'day' ? { consumed: false } : {}) }); saveMeals(pickCtx.src); render(); A.itemSheet({ src: pickCtx.src, m: pickCtx.m, i: items.length - 1 }); };

/* Cardápio padrão */
V.plan = () => head('Cardápio padrão', { back: true, sub: 'Base usada nos dias sem registro' }) + `<p class="note">Estimativa do plano: ${nutLine(sumNut(S.kv.mealPlan, false))}. A soma pode variar conforme marcas e preparo e não equivale automaticamente à meta diária.</p>
  ${S.kv.mealPlan.map((m, i) => mealCard(m, i, 'plan')).join('')}<button class="btn ghost" data-a="mealAdd" data-src="plan">${ic('plus', 18)} Adicionar refeição</button>
  <p class="mut sm">Mudanças no cardápio padrão valem para dias ainda sem registro. Dias já registrados permanecem como estão.</p>`;

/* Biblioteca de alimentos */
let foodsQ = '';
const foodsList = () => FOOD_GROUPS.map(g => { const l = S.foods.filter(f => f.group === g && (!foodsQ || f.name.toLowerCase().includes(foodsQ.toLowerCase()))).sort((a, b) => a.name.localeCompare(b.name)); return l.length ? `<h3 class="sec">${g}</h3>` + l.map(f => `<button class="li card" data-a="foodForm" data-id="${f.id}"><div><b>${esc(f.name)}</b><span class="mut sm">por 100 ${f.unit}: ${nutLine(f)}</span></div>${ic('edit', 16)}</button>`).join('') : ''; }).join('') || '<p class="mut center">Nenhum alimento encontrado.</p>';
V.foods = () => head('Alimentos', { back: true, sub: 'Valores aproximados por 100 g ou 100 ml', right: `<button class="ib" data-a="foodForm" aria-label="Novo alimento">${ic('plus')}</button>` }) + `<input type="search" placeholder="Buscar alimento" value="${esc(foodsQ)}" data-oi="foodsQ" aria-label="Buscar alimento"><div id="foodsList">${foodsList()}</div>`;
OI.foodsQ = (d, v) => { foodsQ = v; $('#foodsList').innerHTML = foodsList(); };
A.foodForm = d => {
  const f = d.id ? foodById(d.id) : { name: '', group: 'Proteínas', unit: 'g', kcal: '', p: '', c: '', f: '', portion: 100 }, n = 'type="number" inputmode="decimal" min="0" step="any"';
  openSheet(`<h2>${d.id ? 'Editar alimento' : 'Novo alimento'}</h2><input type="hidden" name="id" value="${esc(d.id || '')}">${field('Nome', 'name="name"', f.name)}
    <div class="grid2"><label class="f"><span>Grupo</span>${sel(FOOD_GROUPS.map(g => [g, g]), f.group, 'name="group"')}</label><label class="f"><span>Unidade</span>${sel([['g', 'gramas (g)'], ['ml', 'mililitros (ml)']], f.unit, 'name="unit"')}</label></div>
    <p class="mut sm">Valores por 100 g ou 100 ml (veja o rótulo do produto):</p>
    <div class="grid4">${field('kcal', `name="kcal" ${n}`, f.kcal)}${field('Prot. (g)', `name="p" ${n}`, f.p)}${field('Carb. (g)', `name="c" ${n}`, f.c)}${field('Gord. (g)', `name="f" ${n}`, f.f)}</div>${field('Porção habitual', `name="portion" ${n}`, f.portion)}
    <div class="stack"><button class="btn" data-a="foodSave">Salvar</button>${d.id ? `<button class="btn danger" data-a="foodDel" data-id="${d.id}">${ic('trash', 18)} Excluir alimento</button>` : ''}<button class="btn ghost" data-a="closeSheet">Cancelar</button></div>`);
};
A.foodSave = () => {
  const v = formVals(); if (!v.name.trim()) { toast('Informe o nome do alimento.'); return; }
  const f = { ...(v.id ? foodById(v.id) : { id: uid(), custom: true }), name: v.name.trim(), group: v.group, unit: v.unit, kcal: num(v.kcal) || 0, p: num(v.p) || 0, c: num(v.c) || 0, f: num(v.f) || 0, portion: num(v.portion) || 100 };
  save('foods', f); closeSheet(); render(); toast('Alimento salvo.');
  if (pickCtx && !v.id && (cur().v === 'food' || cur().v === 'plan')) A.foodPickOk({ id: f.id });
};
A.foodDel = d => confirmDlg('Excluir alimento?', 'Ele sai da biblioteca e do cardápio padrão. Consumos já registrados mantêm os valores salvos.', 'Excluir', () => {
  remove('foods', d.id); S.kv.mealPlan.forEach(m => m.items = m.items.filter(i => i.foodId !== d.id)); kvSet('mealPlan', S.kv.mealPlan); render();
}, true);

/* Substituições */
V.subs = () => head('Substituições', { back: true, sub: 'Opções para variar o cardápio' }) + `<p class="note">Valores aproximados por 100 g ou 100 ml. Alimentos do mesmo grupo não são automaticamente equivalentes: confira proteína e energia. Ao substituir um item de uma refeição, o app sugere a quantidade que iguala o nutriente principal e avisa quando a energia difere.</p>
  ${['Proteínas', 'Carboidratos', 'Gorduras'].map(g => `<section class="card"><h3>${g}</h3><div class="tbl"><div class="tr th"><span>Alimento</span><span>kcal</span><span>P</span><span>C</span><span>G</span></div>${S.foods.filter(f => f.group === g).sort((a, b) => a.name.localeCompare(b.name)).map(f => `<button class="tr" data-a="foodForm" data-id="${f.id}"><span>${esc(f.name)}</span><span>${fmt(f.kcal, 0)}</span><span>${fmt(f.p)}</span><span>${fmt(f.c)}</span><span>${fmt(f.f)}</span></button>`).join('')}</div></section>`).join('')}
  <button class="btn ghost" data-a="foodForm">${ic('plus', 18)} Criar nova substituição</button>
  <section class="card"><h3>Estratégias para pouco apetite</h3><ul><li>Planejar 4–5 momentos de alimentação, sem rigidez.</li><li>Usar leite, iogurte e vitaminas quando sólidos forem difíceis.</li><li>Acrescentar pequenas porções de azeite, abacate ou pasta de amendoim.</li><li>Distribuir fontes de proteína ao longo do dia.</li><li>Evitar grandes volumes de líquido logo antes das refeições, se isso reduzir o apetite.</li></ul><p class="mut sm">Whey é opcional, por conveniência. Qualquer suplementação deve ser discutida com profissional.</p></section>`;

/* Histórico alimentar */
V.foodHist = () => {
  const g = S.kv.goals, days = Object.keys(S.days).filter(hasFoodLog).sort().reverse();
  const pts = days.slice(0, 30).reverse().map(d => ({ x: dparse(d).getTime(), y: dayTotals(d).p }));
  return head('Histórico alimentar', { back: true, sub: `${days.length} dias com registro` }) + `<section class="card"><h3>Proteína consumida por dia (g)</h3>${lineChart(pts, 'g')}<p class="mut sm">Meta de referência: ${g.pMin}–${g.pMax} g/dia (estimativa).</p></section>
    ${days.length ? `<section class="card"><div class="tbl"><div class="tr th"><span>Dia</span><span>kcal</span><span>P</span><span>C</span><span>G</span></div>${days.map(d => { const t = dayTotals(d); return `<button class="tr" data-a="foodDay" data-d="${d}"><span>${fdate(d)}</span><span>${fmt(t.kcal, 0)}</span><span>${fmt(t.p, 0)}</span><span>${fmt(t.c, 0)}</span><span>${fmt(t.f, 0)}</span></button>`; }).join('')}</div></section>` : '<div class="card"><p class="mut">Nenhum alimento registrado como consumido ainda.</p></div>'}`;
};

/* Metas nutricionais */
A.goalsSheet = () => {
  const g = S.kv.goals, n = 'type="number" inputmode="decimal" min="0"', row = (l, a, b) => `<div class="grid2">${field(`${l} mín.`, `name="${a}" ${n}`, g[a])}${field(`${l} máx.`, `name="${b}" ${n}`, g[b])}</div>`;
  openSheet(`<h2>Metas nutricionais</h2><p class="note warn">Estimativas sujeitas à validação profissional. Não são prescrição nutricional.</p>${row('Energia (kcal)', 'kcalMin', 'kcalMax')}${row('Proteínas (g)', 'pMin', 'pMax')}${row('Carboidratos (g)', 'cMin', 'cMax')}${row('Gorduras (g)', 'fMin', 'fMax')}
    <label class="sw"><input type="checkbox" name="showKcal" ${g.showKcal ? 'checked' : ''}><span>Exibir calorias no painel</span></label><div class="stack"><button class="btn" data-a="goalsSave">Salvar metas</button><button class="btn ghost" data-a="closeSheet">Cancelar</button></div>`);
};
A.goalsSave = () => { const f = formVals(), g = S.kv.goals; for (const k of ['kcalMin', 'kcalMax', 'pMin', 'pMax', 'cMin', 'cMax', 'fMin', 'fMax']) g[k] = num(f[k]) || 0; g.showKcal = f.showKcal; kvSet('goals', g); closeSheet(); render(); toast('Metas atualizadas.'); };
