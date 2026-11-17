'use strict';
/* ----- gráfico de linha (SVG) ----- */
function lineChart(pts, unit = '') {
  if (!pts.length) return `<div class="empty">Sem registros neste período.</div>`;
  const W = 340, H = 170, L = 38, R = 12, T = 14, B = 24;
  let ys = pts.map(p => p.y), lo = Math.min(...ys), hi = Math.max(...ys);
  if (lo === hi) { lo -= 1; hi += 1; } const padY = (hi - lo) * 0.12; lo -= padY; hi += padY;
  const x0 = pts[0].x, x1 = pts[pts.length - 1].x, sx = x => x1 === x0 ? (L + (W - L - R) / 2) : L + (x - x0) / (x1 - x0) * (W - L - R), sy = y => T + (hi - y) / (hi - lo) * (H - T - B);
  const grid = [0, .5, 1].map(k => { const v = lo + (hi - lo) * k, y = sy(v); return `<line x1="${L}" x2="${W - R}" y1="${y}" y2="${y}" class="g"/><text x="${L - 6}" y="${y + 3.5}" text-anchor="end">${fmt(v)}</text>`; }).join('');
  const path = pts.map((p, i) => `${i ? 'L' : 'M'}${sx(p.x).toFixed(1)} ${sy(p.y).toFixed(1)}`).join(' ');
  const last = pts[pts.length - 1], d = t => fshort(dstr(new Date(t)));
  return `<svg class="chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="Gráfico de evolução">${grid}
    ${pts.length > 1 ? `<path d="${path}" class="ln"/>` : ''}${pts.map(p => `<circle cx="${sx(p.x).toFixed(1)}" cy="${sy(p.y).toFixed(1)}" r="3.2" class="pt"><title>${d(p.x)}: ${fmt(p.y)} ${unit}</title></circle>`).join('')}
    <text x="${Math.min(W - R, sx(last.x))}" y="${sy(last.y) - 8}" text-anchor="end" class="lv">${fmt(last.y)} ${unit}</text>
    <text x="${L}" y="${H - 6}">${d(x0)}</text>${x1 !== x0 ? `<text x="${W - R}" y="${H - 6}" text-anchor="end">${d(x1)}</text>` : ''}</svg>`;
}
