'use strict';
/* Backup e restauração: exportação JSON, validação, importação e cópias de segurança internas */
const BACKUP_APP = 'projeto-evolucao', MAX_LOCAL_COPIES = 5;
function snapshot(withPhotos = true) {
  const d = { app: BACKUP_APP, schema: DB_VERSION, version: APP_VERSION, exportedAt: new Date().toISOString(), kv: S.kv, exercises: S.exercises, workouts: S.workouts, sessions: S.sessions, foods: S.foods, days: Object.values(S.days), body: S.body, diary: Object.values(S.diary) };
  if (withPhotos) d.photos = S.photos;
  return clone(d);
}
/* Confere a estrutura do arquivo antes de qualquer alteração nos dados. */
function validateBackup(d) {
  const errors = [], isObj = x => !!x && typeof x === 'object' && !Array.isArray(x);
  if (!isObj(d)) return { ok: false, errors: ['O arquivo não contém um backup.'] };
  if (d.app !== BACKUP_APP) errors.push('O arquivo não é um backup do Projeto Evolução.');
  if (typeof d.schema !== 'number') errors.push('Versão do backup ausente.');
  else if (d.schema > DB_VERSION) errors.push('Backup criado por uma versão mais nova do app. Atualize o app antes de importar.');
  if (!isObj(d.kv) || !isObj(d.kv.profile)) errors.push('Perfil ausente no backup.');
  for (const s of ['exercises', 'workouts', 'sessions', 'foods', 'days', 'body', 'diary']) if (!Array.isArray(d[s])) errors.push(`Seção "${s}" ausente ou inválida.`);
  if (d.photos !== undefined && !Array.isArray(d.photos)) errors.push('Seção de fotos inválida.');
  if (!errors.length) {
    if (d.sessions.some(x => !isObj(x) || !x.id || !Array.isArray(x.entries) || typeof x.startedAt !== 'number')) errors.push('Há treinos com formato inválido.');
    if ([...d.exercises, ...d.workouts, ...d.foods, ...d.body].some(x => !isObj(x) || !x.id)) errors.push('Há registros sem identificador.');
    if ([...d.days, ...d.diary].some(x => !isObj(x) || !/^\d{4}-\d{2}-\d{2}$/.test(x.date || ''))) errors.push('Há registros diários com data inválida.');
    if ((d.photos || []).some(x => !isObj(x) || !x.id || !/^data:image\//.test(x.data || ''))) errors.push('Há fotos com formato inválido.');
  }
  return { ok: !errors.length, errors, summary: errors.length ? null : { date: d.exportedAt, sessions: d.sessions.filter(x => x.status === 'done').length, days: d.days.length, body: d.body.length, photos: d.photos ? d.photos.length : null } };
}
/* Substitui os dados pelo conteúdo do backup. Backups sem fotos mantêm as fotos atuais. As cópias internas não são apagadas. */
async function restore(d) {
  const v = validateBackup(d); if (!v.ok) throw new Error(v.errors[0]);
  for (const s of USER_STORES) { if (s === 'photos' && d.photos === undefined) continue; await DB.clear(s); }
  for (const [k, val] of Object.entries(d.kv)) await DB.put('kv', { k, v: val });
  for (const s of USER_STORES) if (s !== 'kv') for (const row of (d[s] || [])) await DB.put(s, row);
  await loadAll(); await seedIfNeeded();
}
/* Cópia de segurança interna (sem fotos), guardada no próprio aparelho. Mantém as mais recentes. */
async function makeLocalCopy(label) {
  const rec = { id: uid(), at: Date.now(), label, data: snapshot(false) };
  await save('backups', rec);
  const old = [...S.backups].sort((a, b) => b.at - a.at).slice(MAX_LOCAL_COPIES);
  for (const o of old) await remove('backups', o.id);
  return rec;
}
