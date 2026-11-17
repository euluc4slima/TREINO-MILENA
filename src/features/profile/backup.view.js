'use strict';
/* BACKUP E SEGURANÇA */
let backupInfo = { est: null, ready: null };
async function refreshBackupInfo() { backupInfo = { est: await Store.estimate(), ready: await offlineReady() }; if (cur().v === 'backup') render(); }
V.backup = () => {
  const lb = S.kv.lastBackup, days = lb ? Math.floor((Date.now() - lb) / 864e5) : null, e = backupInfo.est, copies = [...S.backups].sort((a, b) => b.at - a.at);
  const when = ts => `${fdate(dstr(new Date(ts)))} às ${ftime(ts)}`;
  return head('Backup e segurança', { back: true, sub: 'Seus dados ficam somente neste aparelho' }) + `
    <section class="card"><h3>Situação</h3><div class="kvl">
      <span>Último backup exportado</span><span>${lb ? when(lb) : 'nunca'}</span>
      <span>Armazenamento protegido pelo sistema</span><span>${Store.persisted === true ? 'sim' : Store.persisted === false ? 'não garantido' : '—'}</span>
      <span>Espaço usado pelo app</span><span>${e ? fbytes(e.usage) : '—'}</span>
      <span>Pronto para uso offline</span><span>${backupInfo.ready === true ? 'sim' : backupInfo.ready === false ? (document.documentElement.dataset.build ? 'ainda não' : 'só na versão publicada') : '—'}</span>
      <span>Conexão agora</span><span>${ONLINE ? 'online' : 'offline'}</span>
      <span>Registros</span><span>${S.sessions.filter(x => x.status === 'done').length} treinos · ${S.body.length} avaliações · ${S.photos.length} ${S.photos.length === 1 ? "foto" : "fotos"}</span></div>
      ${DB.mem ? '<p class="note warn">Armazenamento local indisponível neste navegador: nada está sendo salvo.</p>' : ''}
      ${!lb ? '<p class="note warn">Nenhum backup exportado ainda. Exporte um arquivo e guarde fora do aparelho (Arquivos, iCloud Drive, e-mail).</p>' : days >= 14 ? `<p class="note warn">Último backup há ${days} dias. Exporte um novo.</p>` : ''}</section>
    <section class="card"><h3>Exportar backup (JSON)</h3><p class="mut sm">Arquivo com perfil, treinos, histórico, alimentação, evolução, medidas e configurações. Guarde-o fora do aparelho.</p>
      <button class="btn" data-a="backupExport" data-p="1">${ic('download', 18)} Exportar tudo (com fotos)</button><button class="btn ghost" data-a="backupExport" data-p="">${ic('download', 18)} Exportar sem fotos (arquivo menor)</button></section>
    <section class="card"><h3>Importar backup</h3><p class="mut sm">O arquivo é validado antes. Você confirma antes de qualquer substituição, e uma cópia interna dos dados atuais é criada automaticamente.</p>
      <label class="btn ghost filebtn">${ic('upload', 18)} Escolher arquivo de backup<input type="file" accept=".json,application/json" data-c="backupImport" hidden></label></section>
    <section class="card"><h3>Exportar em CSV</h3><p class="mut sm">Para abrir no Numbers ou Excel.</p><div class="grid3"><button class="btn sm ghost" data-a="csv" data-t="treinos">Treinos</button><button class="btn sm ghost" data-a="csv" data-t="alimentacao">Alimentação</button><button class="btn sm ghost" data-a="csv" data-t="medidas">Medidas</button></div></section>
    <section class="card"><h3>Cópias de segurança neste aparelho</h3><p class="mut sm">Pontos de restauração guardados dentro do app (sem fotos, até ${MAX_LOCAL_COPIES}). Protegem contra erros de uso, mas não contra perda ou troca do aparelho — para isso, exporte o arquivo.</p>
      <button class="btn ghost" data-a="copyMake">${ic('plus', 18)} Criar cópia de segurança agora</button>
      ${copies.map(c => `<div class="li s"><div><b>${when(c.at)}</b><span class="mut sm">${esc(c.label)} · ${c.data.sessions.filter(x => x.status === 'done').length} treinos</span></div><div class="ibs"><button class="btn sm ghost" data-a="copyRestore" data-id="${c.id}">Restaurar</button><button class="ib soft" data-a="copyDel" data-id="${c.id}" aria-label="Excluir cópia">${ic('trash', 18)}</button></div></div>`).join('') || '<p class="mut sm">Nenhuma cópia interna ainda.</p>'}</section>
    <button class="btn ghost" data-a="go" data-v="privacy">${ic('info', 18)} Política de privacidade</button>`;
};
A.backupExport = async d => {
  const withPhotos = !!d.p;
  try { await download(`projeto-evolucao-backup-${today()}${withPhotos ? '' : '-sem-fotos'}.json`, JSON.stringify(snapshot(withPhotos)), 'application/json'); await kvSet('lastBackup', Date.now()); render(); }
  catch (e) { console.error(e); toast('Não foi possível gerar o arquivo de backup.'); }
};
C.backupImport = async (d, v, el) => {
  const file = el.files && el.files[0]; if (!file) return; let data, res;
  try { data = JSON.parse(await file.text()); res = validateBackup(data); } catch (e) { res = { ok: false, errors: ['O arquivo não é um JSON válido.'] }; }
  el.value = '';
  if (!res.ok) { openSheet(`<h2>Arquivo recusado</h2><p class="note warn">${res.errors.map(esc).join('<br>')}</p><p class="mut sm">Nenhum dado foi alterado.</p><button class="btn" data-a="closeSheet">Fechar</button>`); return; }
  const s = res.summary;
  confirmDlg('Importar backup?', `Backup de ${fdate(dstr(new Date(s.date)))}: ${s.sessions} treinos, ${s.days} dias de alimentação, ${s.body} avaliações${s.photos == null ? ' (sem fotos: as fotos atuais serão mantidas)' : `, ${s.photos} fotos`}. Os dados atuais deste aparelho serão substituídos. Uma cópia interna dos dados atuais será criada antes.`, 'Substituir pelos dados do backup', async () => {
    try { await makeLocalCopy('Antes de importar backup'); await restore(data); applyTheme(); stack = [{ v: 'me', p: {} }, { v: 'backup', p: {} }]; render(); toast('Backup restaurado.'); }
    catch (e) { console.error(e); toast('Falha ao restaurar. Use uma cópia interna para voltar ao estado anterior.'); }
  }, true);
};
A.copyMake = async () => { await makeLocalCopy('Cópia manual'); render(); toast('Cópia de segurança criada neste aparelho.'); };
A.copyDel = d => confirmDlg('Excluir cópia?', 'Esta cópia de segurança interna será apagada.', 'Excluir cópia', () => { remove('backups', d.id); render(); }, true);
A.copyRestore = d => {
  const c = S.backups.find(x => x.id === d.id); if (!c) return;
  confirmDlg('Restaurar esta cópia?', 'Treinos, alimentação, medidas e configurações voltam ao estado dessa cópia. As fotos atuais são mantidas e o estado atual é guardado em uma nova cópia antes.', 'Restaurar', async () => {
    try { await makeLocalCopy('Antes de restaurar cópia'); await restore(c.data); applyTheme(); render(); toast('Cópia restaurada.'); } catch (e) { console.error(e); toast('Falha ao restaurar a cópia.'); }
  }, true);
};
