'use strict';
/* Cronômetros baseados em horário real (timestamps): continuam corretos após bloquear a tela ou fechar o app. */
let audioCtx;
function unlockAudio() { try { audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)(); if (audioCtx.state === 'suspended') audioCtx.resume(); } catch (e) { } }
function beep() {
  if (!S.kv.settings.sound || !audioCtx) return;
  try {
    [0, .22, .44].forEach((t, i) => {
      const o = audioCtx.createOscillator(), g = audioCtx.createGain(); o.type = 'sine'; o.frequency.value = i === 2 ? 1175 : 880;
      g.gain.setValueAtTime(0.0001, audioCtx.currentTime + t); g.gain.exponentialRampToValueAtTime(0.4, audioCtx.currentTime + t + .02); g.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + t + .18);
      o.connect(g).connect(audioCtx.destination); o.start(audioCtx.currentTime + t); o.stop(audioCtx.currentTime + t + .2);
    });
  } catch (e) { }
}
const buzz = () => { if (S.kv.settings.vibrate && navigator.vibrate) try { navigator.vibrate([200, 100, 200]); } catch (e) { } };
const notifOK = () => 'Notification' in window && Notification.permission === 'granted';
function notify(title, body) {
  if (!notifOK()) return;
  try {
    if (navigator.serviceWorker && navigator.serviceWorker.controller) navigator.serviceWorker.ready.then(r => r.showNotification(title, { body, tag: title, icon: 'icons/icon-192.png' })).catch(() => { });
    else new Notification(title, { body });
  } catch (e) { }
}

const Rest = {
  get: () => S.kv.rest || { state: 'idle', dur: S.kv.settings.rest },
  set(r) { kvSet('rest', r); updateRestUI(); },
  start(dur) { unlockAudio(); const d = dur || Rest.get().dur; Rest.set({ state: 'run', dur: d, endAt: Date.now() + d * 1000 }); },
  pause() { const r = Rest.get(); if (r.state === 'run') Rest.set({ state: 'pause', dur: r.dur, remaining: Math.max(0, r.endAt - Date.now()) }); },
  resume() { unlockAudio(); const r = Rest.get(); if (r.state === 'pause') Rest.set({ state: 'run', dur: r.dur, endAt: Date.now() + r.remaining }); },
  skip() { Rest.set({ state: 'idle', dur: Rest.get().dur }); },
  setDur(d) { const r = Rest.get(); if (r.state === 'run' || r.state === 'pause') Rest.start(d); else Rest.set({ state: 'idle', dur: d }); },
  adjust(s) { const r = Rest.get(); if (r.state === 'run') Rest.set({ ...r, endAt: Math.max(Date.now(), r.endAt + s * 1000), dur: Math.max(5, r.dur + s) }); else if (r.state === 'pause') Rest.set({ ...r, remaining: Math.max(0, r.remaining + s * 1000), dur: Math.max(5, r.dur + s) }); },
  left() { const r = Rest.get(); return r.state === 'run' ? r.endAt - Date.now() : r.state === 'pause' ? r.remaining : r.state === 'done' ? 0 : r.dur * 1000; },
  finish() {
    const r = Rest.get(), late = Date.now() - r.endAt;
    Rest.set({ state: 'done', dur: r.dur });
    if (late < 5000) { beep(); buzz(); notify('Descanso concluído', 'Hora da próxima série.'); toast('Descanso concluído!'); }
    else toast(`Descanso concluído há ${fdur(late)}.`);
  }
};
const REST_OPTS = [30, 45, 60, 90, 120, 180];
function restHTML() {
  const r = Rest.get(), clock = `<b class="rclock" data-clock="rest">${fdur(Math.ceil(Rest.left() / 1000) * 1000)}</b>`;
  if (r.state === 'run' || r.state === 'pause') return `
    <div class="rbar"><i id="restBar"></i></div>
    <div class="rrow"><div><span class="mut sm">${r.state === 'pause' ? 'Descanso pausado' : 'Descanso'}</span>${clock}</div>
      <div class="rbtns"><button class="btn sm ghost" data-a="restAdj" data-s="-15">−15s</button><button class="btn sm ghost" data-a="restAdj" data-s="15">+15s</button></div></div>
    <div class="rrow3">${r.state === 'run' ? `<button class="btn" data-a="restPause">${ic('pause', 18)} Pausar</button>` : `<button class="btn" data-a="restResume">${ic('play', 18)} Continuar</button>`}
      <button class="btn ghost" data-a="restRestart">${ic('refresh', 18)} Reiniciar</button><button class="btn ghost" data-a="restSkip">${ic('skip', 18)} Pular</button></div>`;
  if (r.state === 'done') return `<div class="rrow"><div><span class="mut sm">Descanso concluído</span><b class="rclock">00:00</b></div><button class="btn" data-a="restSkip">${ic('check', 18)} Próxima série</button></div>`;
  return `<div class="chips rchips">${REST_OPTS.map(s => `<button class="chip ${r.dur === s ? 'on' : ''}" data-a="restDur" data-v="${s}">${s}s</button>`).join('')}<button class="chip ${REST_OPTS.includes(r.dur) ? '' : 'on'}" data-a="restCustom">${REST_OPTS.includes(r.dur) ? 'Outro' : r.dur + 's'}</button></div>
    <button class="btn big" data-a="restStart">${ic('clock', 20)} INICIAR DESCANSO · ${r.dur}s</button>`;
}
function updateRestUI() { const el = $('#restPanel'); if (el) el.innerHTML = restHTML(); renderMini(); tick(); }
A.restStart = () => Rest.start();
A.restPause = () => Rest.pause();
A.restResume = () => Rest.resume();
A.restRestart = () => Rest.start(Rest.get().dur);
A.restSkip = () => Rest.skip();
A.restAdj = d => Rest.adjust(+d.s);
A.restDur = d => Rest.setDur(+d.v);
A.restCustom = () => openSheet(`<h2>Descanso personalizado</h2>${field('Tempo em segundos', 'name="sec" type="number" inputmode="numeric" min="5" max="900"', Rest.get().dur)}<div class="stack"><button class="btn" data-a="restCustomOk">Definir</button><button class="btn ghost" data-a="closeSheet">Cancelar</button></div>`);
A.restCustomOk = () => { const v = num(formVals().sec); closeSheet(); if (v && v >= 5) Rest.setDur(Math.min(900, Math.round(v))); };

function renderMini() {
  const el = $('#mini'); if (!el) return; const se = activeSession(), r = Rest.get();
  if (!se || cur().v === 'session') { el.innerHTML = ''; el.classList.remove('on'); return; }
  el.classList.add('on');
  el.innerHTML = `<button data-a="resume"><span class="dot"></span><span class="mini-t"><b>${esc(se.name)}</b> em andamento</span><span class="mini-c">${(r.state === 'run' || r.state === 'pause') ? `${ic('clock', 14)}<b data-clock="rest"></b> · ` : ''}<b data-clock="session"></b></span>${ic('next', 18)}</button>`;
}
function tick() {
  const se = activeSession();
  if (se) { const t = fdur(sessionDur(se)); $$('[data-clock="session"]').forEach(e => { if (e.textContent !== t) e.textContent = t; }); }
  const r = Rest.get();
  if (r.state === 'run' && Rest.left() <= 0) { Rest.finish(); return; }
  if (r.state === 'run' || r.state === 'pause') {
    const l = Rest.left(), t = fdur(Math.ceil(l / 1000) * 1000);
    $$('[data-clock="rest"]').forEach(e => { if (e.textContent !== t) e.textContent = t; });
    const b = $('#restBar'); if (b) b.style.width = Math.max(0, Math.min(100, 100 * l / (r.dur * 1000))) + '%';
  }
}

/* Mantém a tela acesa durante o treino quando o aparelho permite (Wake Lock). */
let wakeLock = null;
async function keepAwake(on) {
  try {
    if (on && !wakeLock && 'wakeLock' in navigator && document.visibilityState === 'visible') { wakeLock = await navigator.wakeLock.request('screen'); wakeLock.addEventListener('release', () => { wakeLock = null; }); }
    else if (!on && wakeLock) { await wakeLock.release(); wakeLock = null; }
  } catch (e) { wakeLock = null; }
}
