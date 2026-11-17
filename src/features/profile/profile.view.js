'use strict';
/* PERFIL — dados pessoais, preferências, lembretes, backup e instalação */
const kvf = (label, k, f, attrs = '', t = '') => field(label, `data-c="kv" data-k="${k}" data-f="${f}" ${t ? `data-t="${t}"` : ''} ${attrs}`, S.kv[k][f]);
const kvsw = (label, k, f) => `<label class="sw"><input type="checkbox" data-c="kv" data-k="${k}" data-f="${f}" ${S.kv[k][f] ? 'checked' : ''}><span>${label}</span></label>`;
const NUMI = 'type="number" inputmode="decimal" min="0" step="any"';
V.me = () => {
  const p = S.kv.profile, s = S.kv.settings, g = S.kv.goals, R = S.kv.reminders, installed = !!navigator.standalone || window.matchMedia('(display-mode: standalone)').matches;
  const np = 'Notification' in window ? Notification.permission : 'unsupported';
  const rem = (k, label, extra = '') => `<div class="remrow"><label class="sw"><input type="checkbox" data-c="rem" data-k="${k}" data-f="on" ${R[k].on ? 'checked' : ''}><span>${label}</span></label>${extra}</div>`;
  return head('Perfil', { sub: 'Dados, preferências e backup' }) + `
    <section class="card"><h3>Dados pessoais</h3>${kvf('Nome', 'profile', 'name', 'placeholder="Como quer ser chamada" data-r="1"')}
      <div class="grid2">${kvf('Sexo', 'profile', 'sex')}${kvf('Idade', 'profile', 'age')}${kvf('Altura (cm)', 'profile', 'height', NUMI + ' data-r="1"', 'num')}<label class="f"><span>Peso inicial (${U.wl()})</span><input ${NUMI} data-c="pw" data-f="startWeight" value="${r2(U.w(p.startWeight))}"></label>
        <label class="f"><span>Peso atual (${U.wl()})</span><input ${NUMI} data-c="curWeight" value="${r2(U.w(currentWeight()))}"></label><label class="f"><span>Marco de acompanhamento (${U.wl()})</span><input ${NUMI} data-c="pw" data-f="milestone" value="${r2(U.w(p.milestone))}"></label></div>
      <p class="mut sm">IMC calculado: <b>${fmt(bmi())}</b> kg/m² (estimativa a partir do peso atual e da altura). Alterar o peso atual cria um registro de peso com a data de hoje.</p>
      ${kvf('Experiência', 'profile', 'experience')}${kvf('Objetivo', 'profile', 'goal')}${kvf('Prioridades', 'profile', 'priorities')}${kvf('Característica alimentar', 'profile', 'food')}</section>
    <section class="card"><h3>Preferências de treino</h3><div class="grid2">${kvf('Treinos por semana', 'profile', 'freq', NUMI, 'num')}${kvf('Horário habitual', 'profile', 'trainTime', 'type="time"')}</div>${kvf('Local de treino', 'profile', 'place')}
      <label class="f"><span>Descanso padrão</span>${sel([...REST_OPTS.map(x => [x, `${x} segundos`])], s.rest, 'data-c="kv" data-k="settings" data-f="rest" data-t="num"')}</label>
      <button class="btn ghost" data-a="tab" data-v="train">Editar divisão semanal e treinos</button></section>
    <section class="card"><h3>Metas nutricionais</h3><p class="mut">Energia ${g.kcalMin}–${g.kcalMax} kcal · Proteínas ${g.pMin}–${g.pMax} g · Carboidratos ${g.cMin}–${g.cMax} g · Gorduras ${g.fMin}–${g.fMax} g</p><p class="mut sm">Estimativas do planejamento inicial, sujeitas à validação profissional.</p><button class="btn ghost" data-a="goalsSheet">Editar metas</button></section>
    <section class="card"><h3>Aparência e unidades</h3><div class="grid2"><label class="f"><span>Tema</span>${sel([['light', 'Claro'], ['dark', 'Escuro'], ['auto', 'Automático']], s.theme, 'data-c="kv" data-k="settings" data-f="theme"')}</label><label class="f"><span>Peso e cargas</span>${sel([['kg', 'Quilos (kg)'], ['lb', 'Libras (lb)']], s.unitW, 'data-c="kv" data-k="settings" data-f="unitW" data-r="1"')}</label><label class="f"><span>Medidas</span>${sel([['cm', 'Centímetros'], ['in', 'Polegadas']], s.unitL, 'data-c="kv" data-k="settings" data-f="unitL" data-r="1"')}</label></div>
      ${kvsw('Som ao terminar o descanso', 'settings', 'sound')}${kvsw('Vibração (quando o aparelho permite)', 'settings', 'vibrate')}<p class="mut sm">No iPhone, o som segue a chave lateral de silencioso e a vibração por navegador não é suportada.</p></section>
    <section class="card"><h3>Lembretes</h3>
      ${rem('treino', 'Horário do treino', `<input type="time" data-c="rem" data-k="treino" data-f="time" value="${R.treino.time}" aria-label="Horário do lembrete de treino">`)}${rem('refeicoes', 'Refeições (horários do cardápio)')}${rem('agua', 'Água', sel([[60, 'a cada 1 h'], [90, 'a cada 1h30'], [120, 'a cada 2 h'], [180, 'a cada 3 h']], R.agua.every, 'data-c="rem" data-k="agua" data-f="every" aria-label="Intervalo"'))}${rem('peso', 'Registro de peso (seg. e qui.)', `<input type="time" data-c="rem" data-k="peso" data-f="time" value="${R.peso.time}" aria-label="Horário do lembrete de peso">`)}${rem('avaliacao', 'Avaliações (semanas 4, 8 e 12)')}
      <p class="mut sm">Notificações: ${np === 'granted' ? 'permitidas' : np === 'denied' ? 'bloqueadas nos ajustes do aparelho' : np === 'unsupported' ? 'não suportadas neste navegador — no iPhone, instale o app na Tela de Início (iOS 16.4 ou superior)' : 'ainda não permitidas'}.</p>
      ${np === 'default' ? `<button class="btn ghost" data-a="notifAsk">${ic('bell', 18)} Permitir notificações</button>` : ''}
      <p class="note"><b>Limitação do iPhone:</b> sem um servidor de envio, o iOS só exibe os lembretes deste app enquanto ele está aberto. Para avisos confiáveis com o app fechado, exporte os lembretes ativos para o app Calendário:</p>
      <button class="btn ghost" data-a="ics">${ic('calendar', 18)} Exportar lembretes para o Calendário</button></section>
    <section class="card"><h3>Backup e segurança</h3><p class="mut sm">${S.kv.lastBackup ? `Último backup exportado em ${fdate(dstr(new Date(S.kv.lastBackup)))} às ${ftime(S.kv.lastBackup)}.` : 'Nenhum backup exportado ainda.'} Os dados ficam somente neste aparelho.</p>
      <button class="btn" data-a="go" data-v="backup">${ic('download', 18)} BACKUP E SEGURANÇA</button><button class="btn ghost" data-a="go" data-v="privacy">${ic('info', 18)} Política de privacidade</button></section>
    <section class="card"><h3>Planejamento</h3><button class="btn ghost" data-a="go" data-v="program">${ic('target', 18)} Programa e novo ciclo de 12 semanas</button><button class="btn ghost" data-a="resetPlan">${ic('refresh', 18)} Redefinir planejamento inicial</button><button class="btn danger" data-a="wipe">${ic('trash', 18)} Apagar todos os dados</button></section>
    <section class="card"><h3>Instalação no iPhone</h3>${installed ? '<p class="note up">App instalado na Tela de Início.</p>' : '<ol><li>Abra este endereço no <b>Safari</b>.</li><li>Toque em <b>Compartilhar</b> (quadrado com seta para cima).</li><li>Escolha <b>Adicionar à Tela de Início</b> e confirme.</li><li>Abra o app pelo ícone: ele passa a funcionar em tela cheia e offline.</li></ol>'}<button class="btn ghost" data-a="checkUpdate">${ic('refresh', 18)} Verificar atualização</button><p class="mut sm">Projeto Evolução · versão ${APP_VERSION}${document.documentElement.dataset.build ? ' · build ' + document.documentElement.dataset.build : ' · modo desenvolvimento'}</p></section>
    <p class="foot">Ferramenta de organização e acompanhamento. Não realiza diagnóstico nem prescrição. Procure avaliação se houver dor aguda, tontura, cansaço persistente, perda de peso involuntária ou dificuldade persistente para se alimentar.</p>`;
};
C.pw = (d, v) => { const n = num(v); if (n == null) return; S.kv.profile[d.f] = U.wIn(n); kvSet('profile', S.kv.profile); render(); };
C.curWeight = (d, v) => { const n = num(v); if (n == null) return; const b = S.body.find(x => x.date === today()) || { id: uid(), date: today() }; b.weight = U.wIn(n); save('body', b); render(); toast('Peso de hoje registrado.'); };
C.rem = (d, v) => { S.kv.reminders[d.k][d.f] = d.f === 'every' ? +v : v; kvSet('reminders', S.kv.reminders); if (d.f === 'on' && v && 'Notification' in window && Notification.permission === 'default') A.notifAsk(); };
A.notifAsk = async () => { try { const r = await Notification.requestPermission(); toast(r === 'granted' ? 'Notificações permitidas.' : 'Notificações não permitidas.'); } catch (e) { toast('Este navegador não permite notificações.'); } render(); };
A.ics = () => exportICS();

/* Operações destrutivas — sempre com confirmação */
A.resetPlan = () => confirmDlg('Redefinir planejamento?', 'Treinos, divisão semanal, cardápio padrão e metas voltam à configuração inicial do plano. Histórico de treinos, alimentação registrada, medidas e fotos são mantidos.', 'Redefinir planejamento', async () => {
  await makeLocalCopy('Antes de redefinir o planejamento');
  for (const w of [...S.workouts]) await remove('workouts', w.id);
  for (const w of SEED.workouts) await save('workouts', clone(w));
  for (const e of SEED.exercises) if (!exById(e.id)) await save('exercises', clone(e));
  for (const f of SEED.foods) if (!foodById(f.id)) await save('foods', clone(f));
  await kvSet('schedule', clone(SEED.schedule)); await kvSet('mealPlan', clone(SEED.mealPlan)); await kvSet('goals', clone(SEED.goals));
  render(); toast('Planejamento inicial restaurado.');
}, true);
A.wipe = () => confirmDlg('Apagar todos os dados?', 'Treinos, alimentação, medidas, fotos e configurações serão apagados deste aparelho. Exporte um backup antes, se quiser guardar os registros.', 'Continuar', () =>
  confirmDlg('Tem certeza?', 'Esta ação é definitiva e não pode ser desfeita.', 'Apagar tudo definitivamente', async () => { for (const s of STORES) await DB.clear(s); location.reload(); }, true), true);
