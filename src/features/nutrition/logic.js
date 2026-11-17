'use strict';
/* ----- alimentação ----- */
const foodById = id => S.foods.find(f => f.id === id);
const MAIN = { 'Proteínas': 'p', 'Carboidratos': 'c', 'Gorduras': 'f' };
function calcNut(food, qty) { const k = (qty || 0) / 100; return food ? { name: food.name, kcal: food.kcal * k, p: food.p * k, c: food.c * k, f: food.f * k } : { name: 'Alimento removido', kcal: 0, p: 0, c: 0, f: 0 }; }
const itemNut = i => (i.consumed && i.n) ? i.n : calcNut(foodById(i.foodId), i.qty);
const itemName = i => (foodById(i.foodId) || {}).name || (i.n && i.n.name) || 'Alimento removido';
const itemUnit = i => (foodById(i.foodId) || {}).unit || 'g';
/* Dia sem registro mostra o plano como "Planejado" sem gravar nada; o registro só é criado na primeira interação. */
const planAsDay = date => ({ date, virtual: true, water: 0, meals: clone(S.kv.mealPlan).map(m => ({ ...m, items: m.items.map(i => ({ ...i, consumed: false })) })) });
const dayView = date => S.days[date] || planAsDay(date);
function ensureDay(date) { if (!S.days[date]) { const d = planAsDay(date); delete d.virtual; d.meals.forEach(m => m.id = uid()); S.days[date] = d; } return S.days[date]; }
function sumNut(meals, onlyConsumed) {
  const t = { kcal: 0, p: 0, c: 0, f: 0, n: 0 };
  for (const m of meals) for (const i of m.items) { if (onlyConsumed && !i.consumed) continue; const n = itemNut(i); t.kcal += n.kcal; t.p += n.p; t.c += n.c; t.f += n.f; t.n++; }
  return t;
}
const dayTotals = date => sumNut(dayView(date).meals, true);
const hasFoodLog = date => !!S.days[date] && S.days[date].meals.some(m => m.items.some(i => i.consumed));
