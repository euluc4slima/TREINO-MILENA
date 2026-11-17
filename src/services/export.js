'use strict';
/* Exportação de arquivos: download/compartilhamento e CSV */
/* Download / compartilhamento de arquivos (backup, CSV, calendário) */
async function download(name, text, mime) {
  const blob = new Blob([text], { type: mime });
  try {
    if (navigator.standalone && navigator.canShare) {
      const file = new File([blob], name, { type: mime });
      if (navigator.canShare({ files: [file] })) { await navigator.share({ files: [file], title: name }); return; }
    }
  } catch (e) { if (e && e.name === 'AbortError') return; }
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name;
  document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 4000);
}

/* CSV (separador ; e BOM para abrir corretamente no Excel/Numbers em português) */
const csvCell = v => { const s = v == null ? '' : typeof v === 'number' ? String(Math.round(v * 100) / 100).replace('.', ',') : String(v); return /[";\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s; };
const toCSV = rows => '﻿' + rows.map(r => r.map(csvCell).join(';')).join('\r\n');
A.csv = d => {
  let rows;
  if (d.t === 'treinos') { rows = [['data', 'treino', 'inicio', 'fim', 'duracao_min', 'exercicio', 'serie', 'carga_kg', 'repeticoes', 'concluida', 'observacao']]; doneSessions().forEach(se => se.entries.forEach(e => e.sets.forEach((s, j) => rows.push([se.date, se.name, ftime(se.startedAt), ftime(se.endedAt), sessionDur(se) / 60000, e.name, j + 1, s.w, s.r, s.done ? 'sim' : 'não', e.note || ''])))); }
  else if (d.t === 'alimentacao') { rows = [['data', 'refeicao', 'horario', 'alimento', 'quantidade', 'unidade', 'estado', 'kcal', 'proteina_g', 'carboidrato_g', 'gordura_g']]; Object.keys(S.days).sort().forEach(k => S.days[k].meals.forEach(m => m.items.forEach(i => { const n = itemNut(i); rows.push([k, m.name, m.time, itemName(i), i.qty, itemUnit(i), i.consumed ? 'consumido' : 'planejado', n.kcal, n.p, n.c, n.f]); }))); }
  else { rows = [['data', 'peso_kg', 'cintura_cm', 'quadril_cm', 'gluteos_cm', 'coxas_cm', 'bracos_cm', 'gordura_pct', 'observacoes']]; bodySorted().forEach(b => rows.push([b.date, b.weight, b.waist, b.hip, b.glutes, b.thigh, b.arm, b.fat, b.note || ''])); }
  if (rows.length < 2) { toast('Ainda não há registros para exportar.'); return; }
  download(`projeto-evolucao-${d.t}-${today()}.csv`, toCSV(rows), 'text/csv');
};
