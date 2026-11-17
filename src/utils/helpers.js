'use strict';
/* Utilidades gerais: seletores, formatação de números, datas e durações */
const APP_VERSION = '1.1.0';

/* ---------- utilidades ---------- */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const uid = () => (window.crypto && crypto.randomUUID) ? crypto.randomUUID() : 'id-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 10);
const clone = o => JSON.parse(JSON.stringify(o));
const num = v => { if (v === '' || v == null) return null; const n = parseFloat(String(v).replace(',', '.')); return isFinite(n) ? n : null; };
const fmt = (n, d = 1) => (n == null || !isFinite(n)) ? '—' : (Math.round(n * 10 ** d) / 10 ** d).toLocaleString('pt-BR', { maximumFractionDigits: d });
const sign = (n, d = 1) => (n > 0 ? '+' : '') + fmt(n, d);
const pad = n => String(n).padStart(2, '0');
const dstr = (d = new Date()) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const dparse = s => { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d); };
const addDays = (s, n) => { const d = dparse(s); d.setDate(d.getDate() + n); return dstr(d); };
const today = () => dstr();
const dow = s => dparse(s).getDay();
const mondayOf = s => addDays(s, -((dow(s) + 6) % 7));
const diffDays = (a, b) => Math.round((dparse(b) - dparse(a)) / 864e5);
const DOW = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
const DOW3 = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const MONTHS = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
const fdate = s => { const d = dparse(s); return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`; };
const fshort = s => { const d = dparse(s); return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}`; };
const fdur = ms => { const t = Math.max(0, Math.round(ms / 1000)); const h = Math.floor(t / 3600), m = Math.floor(t % 3600 / 60), s = t % 60; return h ? `${h}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`; };
const ftime = ts => { const d = new Date(ts); return `${pad(d.getHours())}:${pad(d.getMinutes())}`; };
