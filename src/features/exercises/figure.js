'use strict';
/* ----- figura ilustrativa dos grupos musculares ----- */
function bodyFig(prim, secs = []) {
  const c = g => g === prim ? 'p' : secs.includes(g) ? 's' : '';
  const fig = (x, back) => `
    <circle cx="${x + 35}" cy="14" r="10"/>
    <ellipse class="${c('Ombros')}" cx="${x + 18}" cy="36" rx="9" ry="7"/><ellipse class="${c('Ombros')}" cx="${x + 52}" cy="36" rx="9" ry="7"/>
    ${back ? `<rect class="${c('Costas')}" x="${x + 22}" y="30" width="26" height="40" rx="7"/>` : `<rect class="${c('Peitoral')}" x="${x + 22}" y="30" width="26" height="17" rx="6"/><rect class="${c('Abdômen')}" x="${x + 25}" y="49" width="20" height="22" rx="5"/>`}
    <rect class="${c(back ? 'Tríceps' : 'Bíceps')}" x="${x + 8}" y="43" width="10" height="24" rx="5"/><rect class="${c(back ? 'Tríceps' : 'Bíceps')}" x="${x + 52}" y="43" width="10" height="24" rx="5"/>
    <rect x="${x + 6}" y="69" width="9" height="24" rx="4.5"/><rect x="${x + 55}" y="69" width="9" height="24" rx="4.5"/>
    <rect class="${back ? c('Glúteos') : ''}" x="${x + 22}" y="73" width="26" height="${back ? 17 : 12}" rx="6"/>
    <rect class="${c(back ? 'Posteriores' : 'Quadríceps')}" x="${x + 22}" y="${back ? 92 : 87}" width="12" height="${back ? 31 : 36}" rx="6"/><rect class="${c(back ? 'Posteriores' : 'Quadríceps')}" x="${x + 36}" y="${back ? 92 : 87}" width="12" height="${back ? 31 : 36}" rx="6"/>
    <rect class="${back ? c('Panturrilhas') : ''}" x="${x + 23}" y="126" width="10" height="32" rx="5"/><rect class="${back ? c('Panturrilhas') : ''}" x="${x + 37}" y="126" width="10" height="32" rx="5"/>
    <text x="${x + 35}" y="172" text-anchor="middle">${back ? 'Costas' : 'Frente'}</text>`;
  return `<svg class="fig" viewBox="0 0 170 176" role="img" aria-label="Ilustração: ${esc(prim)} em destaque">${fig(5, false)}${fig(95, true)}</svg>`;
}
