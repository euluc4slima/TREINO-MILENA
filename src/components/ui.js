'use strict';
/* Componentes de interface: ícones, navegação, toast, folhas modais e delegação de eventos */
/* ---------- ícones (traço, 24×24) ---------- */
const ICONS = {
  home: '<path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/>',
  dumbbell: '<path d="M6.5 6.5v11M17.5 6.5v11M3 9v6M21 9v6M6.5 12h11"/>',
  food: '<path d="M5 3v6a2 2 0 0 0 4 0V3M7 11v10M17 3c-2 2-3 5-3 9h3zM17 12v9"/>',
  chart: '<path d="M4 20V4M4 20h16M8 16l4-5 3 3 5-7"/>',
  user: '<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 4-6 8-6s8 2 8 6"/>',
  play: '<path d="M7 4v16l13-8z"/>', pause: '<path d="M8 5v14M16 5v14"/>',
  check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>', plus: '<path d="M12 5v14M5 12h14"/>', minus: '<path d="M5 12h14"/>',
  x: '<path d="M6 6l12 12M18 6L6 18"/>', back: '<path d="M15 5l-7 7 7 7"/>', next: '<path d="M9 5l7 7-7 7"/>',
  up: '<path d="M5 15l7-7 7 7"/>', down: '<path d="M5 9l7 7 7-7"/>',
  trash: '<path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13M10 11v6M14 11v6"/>',
  edit: '<path d="M4 20h4L19 9l-4-4L4 16zM13.5 6.5l4 4"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  video: '<rect x="3" y="5" width="18" height="14" rx="4"/><path d="M10 9v6l5-3z"/>',
  calendar: '<rect x="3" y="5" width="18" height="16" rx="3"/><path d="M3 10h18M8 3v4M16 3v4"/>',
  history: '<path d="M3 12a9 9 0 1 0 3-6.7L3 8M3 3v5h5M12 7v5l3 2"/>',
  trophy: '<path d="M8 4h8v5a4 4 0 0 1-8 0zM8 6H4v1a4 4 0 0 0 4 4M16 6h4v1a4 4 0 0 1-4 4M12 13v5M8 21h8"/>',
  bell: '<path d="M6 16v-5a6 6 0 0 1 12 0v5l2 2H4zM10 21h4"/>',
  camera: '<path d="M4 8h3l2-3h6l2 3h3v11H4z"/><circle cx="12" cy="13" r="3.5"/>',
  download: '<path d="M12 4v11M7 11l5 5 5-5M4 20h16"/>', upload: '<path d="M12 16V5M7 9l5-5 5 5M4 20h16"/>',
  search: '<circle cx="11" cy="11" r="6.5"/><path d="M16 16l4.5 4.5"/>',
  info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7.5v.5"/>',
  swap: '<path d="M4 8h14l-3-3M20 16H6l3 3"/>',
  drop: '<path d="M12 3c4 5 6 8 6 11a6 6 0 0 1-12 0c0-3 2-6 6-11z"/>',
  list: '<path d="M8 6h12M8 12h12M8 18h12M4 6h.01M4 12h.01M4 18h.01"/>',
  book: '<path d="M5 4h11a3 3 0 0 1 3 3v13H8a3 3 0 0 1-3-3zM5 17a3 3 0 0 1 3-3h11"/>',
  flag: '<path d="M5 21V4h12l-2 4 2 4H5"/>',
  refresh: '<path d="M20 12a8 8 0 1 1-2.3-5.7L20 8M20 3v5h-5"/>',
  skip: '<path d="M5 5l9 7-9 7zM18 5v14"/>',
  more: '<path d="M5 12h.01M12 12h.01M19 12h.01"/>',
  target: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/>'
};
const ic = (n, s = 22) => `<svg class="ic" width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[n] || ''}</svg>`;

/* ---------- navegação e renderização ---------- */
const A = {}, C = {}, OI = {}, V = {};
let stack = [{ v: 'home', p: {} }];
const cur = () => stack[stack.length - 1];
function go(v, p = {}) { stack.push({ v, p }); render(); window.scrollTo(0, 0); }
function back() { if (stack.length > 1) stack.pop(); else stack = [{ v: 'home', p: {} }]; render(); }
function tab(v) { stack = [{ v, p: {} }]; render(); window.scrollTo(0, 0); }
const TABS = [['home', 'Início', 'home'], ['train', 'Treinos', 'dumbbell'], ['food', 'Alimentação', 'food'], ['evo', 'Evolução', 'chart'], ['me', 'Perfil', 'user']];
function render() {
  const r = cur(), y = window.scrollY, key = r.v + JSON.stringify(r.p || {});
  document.body.classList.toggle('full', r.v === 'session');
  let html;
  try { html = V[r.v](r.p || {}); } catch (e) { console.error(e); html = head('Algo deu errado', { back: true }) + `<div class="card"><p>Não foi possível abrir esta tela. Seus dados continuam salvos.</p><p class="mut sm">${esc(e.message)}</p></div>`; }
  $('#view').innerHTML = html;
  $('#tabs').innerHTML = TABS.map(([v, l, i]) => `<button class="tab ${stack[0].v === v ? 'on' : ''}" data-a="tab" data-v="${v}">${ic(i)}<span>${l}</span></button>`).join('');
  renderMini();
  $('#view').classList.toggle('anim', key !== render.last);
  if (key === render.last) window.scrollTo(0, y);
  render.last = key;
  if (typeof tick === 'function') tick();
  if (typeof keepAwake === 'function') keepAwake(r.v === 'session');
}
A.tab = d => tab(d.v);
A.back = () => back();
A.go = d => { const p = { ...d }; delete p.a; delete p.v; go(d.v, p); };
function head(title, o = {}) {
  return `<header class="top">${o.back ? `<button class="ib" data-a="back" aria-label="Voltar">${ic('back')}</button>` : ''}<div class="top-t"><h1>${esc(title)}</h1>${o.sub ? `<p>${esc(o.sub)}</p>` : ''}</div>${o.right || ''}</header>`;
}

/* ---------- toast, folha modal e confirmação ---------- */
let toastT;
function toast(msg, act) {
  const t = $('#toast'); if (!t) return;
  t.innerHTML = `<span>${esc(msg)}</span>${act ? `<button data-a="toastAct">${esc(act.label)}</button>` : ''}`;
  toast.fn = act && act.fn; t.classList.add('on');
  clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove('on'), act ? 15000 : 3200);
}
A.toastAct = () => { $('#toast').classList.remove('on'); if (toast.fn) toast.fn(); };
function openSheet(html) {
  const s = $('#sheet');
  s.innerHTML = `<div class="sheet-bg" data-a="closeSheet"></div><div class="sheet-body" role="dialog" aria-modal="true"><div class="grab"></div>${html}</div>`;
  s.classList.add('on');
}
function closeSheet() { const s = $('#sheet'); s.classList.remove('on'); s.innerHTML = ''; }
A.closeSheet = closeSheet;
let confirmCb;
function confirmDlg(title, msg, ok, cb, danger) {
  confirmCb = cb;
  openSheet(`<h2>${esc(title)}</h2><p class="mut">${esc(msg)}</p><div class="stack"><button class="btn ${danger ? 'danger' : ''}" data-a="confirmOk">${esc(ok)}</button><button class="btn ghost" data-a="closeSheet">Cancelar</button></div>`);
}
A.confirmOk = () => { const cb = confirmCb; closeSheet(); if (cb) cb(); };
function formVals(root = $('#sheet')) { const o = {}; $$('[name]', root).forEach(e => { o[e.name] = e.type === 'checkbox' ? e.checked : e.value; }); return o; }

/* ---------- pequenos componentes ---------- */
const sel = (opts, val, attrs = '') => `<select ${attrs}>${opts.map(([v, l]) => `<option value="${esc(v)}" ${String(v) === String(val ?? '') ? 'selected' : ''}>${esc(l)}</option>`).join('')}</select>`;
const chips = (list, val, act, extra = '') => `<div class="chips">${list.map(([v, l]) => `<button class="chip ${String(v) === String(val) ? 'on' : ''}" data-a="${act}" data-v="${esc(v)}" ${extra}>${esc(l)}</button>`).join('')}</div>`;
const field = (label, attrs, val) => `<label class="f"><span>${label}</span><input ${attrs} value="${esc(val ?? '')}"></label>`;
const bar = (pct, cls = '') => `<div class="bar ${cls}"><i style="width:${Math.max(0, Math.min(100, pct || 0))}%"></i></div>`;

/* Campo genérico ligado a S.kv[k][f]: data-c="kv" data-k data-f [data-t="num"] [data-r] */
C.kv = (d, v) => {
  const o = S.kv[d.k]; o[d.f] = d.t === 'num' ? num(v) : v; kvSet(d.k, o);
  if (d.k === 'settings') applyTheme();
  if (d.r) render();
};

function applyTheme() {
  const t = S.kv.settings.theme;
  const dark = t === 'dark' || (t === 'auto' && window.matchMedia('(prefers-color-scheme: dark)').matches);
  document.documentElement.dataset.theme = dark ? 'dark' : 'light';
  const m = $('meta[name="theme-color"]'); if (m) m.content = dark ? '#121714' : '#F4F6F2';
}

/* ---------- delegação de eventos ---------- */
document.addEventListener('click', e => {
  const el = e.target.closest('[data-a]'); if (!el) return;
  const f = A[el.dataset.a]; if (f) f(el.dataset, el, e);
});
document.addEventListener('change', e => {
  const el = e.target.closest('[data-c]'); if (!el) return;
  const f = C[el.dataset.c]; if (f) f(el.dataset, el.type === 'checkbox' ? el.checked : el.value, el);
});
document.addEventListener('input', e => {
  const el = e.target.closest('[data-oi]'); if (!el) return;
  const f = OI[el.dataset.oi]; if (f) f(el.dataset, el.value, el);
});
