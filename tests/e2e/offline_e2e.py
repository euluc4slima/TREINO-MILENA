"""Teste de ponta a ponta em navegador real (Chromium, tela de iPhone), incluindo modo offline.
Opcional: exige Python 3 e Playwright (pip install playwright && playwright install chromium).
Uso:  npm run build && python3 tests/e2e/offline_e2e.py
Variáveis: DIST (pasta do build), OLD_APP (pasta de uma versão antiga, para testar atualização sem perda de dados)."""
import json, os, subprocess, sys, tempfile, time
from playwright.sync_api import sync_playwright
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
DIST = os.path.abspath(os.environ.get('DIST', os.path.join(ROOT, 'dist'))); OLD = os.environ.get('OLD_APP'); PORT = '8770'; U = f'http://127.0.0.1:{PORT}/'
res = []; errs = []; external = []
def ok(name, cond, extra=''):
    res.append(bool(cond)); print(('PASS ' if cond else 'FAIL ') + name + ((' → ' + str(extra)) if extra and not cond else ''))
def serve_new():
    env = dict(os.environ, PORT=PORT); p = subprocess.Popen(['node', os.path.join(ROOT, 'scripts', 'serve.mjs'), 'dist'], cwd=os.path.dirname(DIST), env=env, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL); time.sleep(1); return p
def watch(pg):
    pg.on('console', lambda m: errs.append(m.text) if m.type == 'error' and 'ERR_INTERNET_DISCONNECTED' not in m.text else None)
    pg.on('pageerror', lambda e: errs.append('PAGEERROR ' + str(e)))
    pg.on('request', lambda r: external.append(r.url) if not r.url.startswith(U) and not r.url.startswith(('data:', 'blob:')) else None)
    return pg
def ready(pg): pg.wait_for_selector('#tabs .tab'); pg.wait_for_timeout(300)
if os.path.dirname(DIST) != ROOT:   # servidor sempre serve <cwd>/dist
    assert os.path.basename(DIST) == 'dist'
has_media = bool(json.load(open(os.path.join(DIST, 'media.json'))))
profile = tempfile.mkdtemp(); srv = None
try:
  with sync_playwright() as p:
    def launch(): return p.chromium.launch_persistent_context(profile, viewport={'width': 390, 'height': 844}, device_scale_factor=2, accept_downloads=True, locale='pt-BR')
    ctx = launch(); pg = watch(ctx.new_page())
    if OLD:   # ---- atualização a partir de uma versão antiga, sem perder registros ----
        srv = subprocess.Popen([sys.executable, '-m', 'http.server', PORT, '--bind', '127.0.0.1'], cwd=OLD, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL); time.sleep(1)
        pg.goto(U); ready(pg); pg.click('[data-a=tab][data-v=train]'); pg.click('[data-a=startWorkout][data-id=w-infA]'); pg.wait_for_selector('.sr .ck')
        pg.locator('.sr:not(.srh) input[data-f=w]').nth(0).fill('10'); pg.locator('.sr:not(.srh) input[data-f=r]').nth(0).fill('12'); pg.locator('.sr:not(.srh) input[data-f=r]').nth(0).blur(); pg.click('.sr:not(.srh) .ck >> nth=0')
        pg.click('[data-a=finishAsk]'); pg.click('[data-a=finish]'); pg.wait_for_selector('.hero.done')
        pg.evaluate("(async()=>{await save('body',{id:'old1',date:today(),weight:47.3}); S.kv.profile.name='Bia'; await kvSet('profile',S.kv.profile)})()")
        pg.wait_for_timeout(1500); ok('versão antiga em uso com service worker', pg.evaluate("navigator.serviceWorker.getRegistration().then(r=>!!(r&&r.active))"))
        srv.terminate(); srv.wait(); srv = serve_new()
        pg.reload(); ready(pg); pg.wait_for_selector('#toast.on button', timeout=20000); ok('atualização detectada', 'Nova versão' in pg.inner_text('#toast'))
        with pg.expect_navigation(): pg.click('#toast button')
        ready(pg); pg.wait_for_timeout(800)
        st = pg.evaluate("(async()=>({build:document.documentElement.dataset.build||'',sess:doneSessions().length,name:S.kv.profile.name,w:currentWeight(),video:exById('smith').video,ver:(await indexedDB.databases()).find(d=>d.name==='projeto-evolucao').version,caches:await caches.keys()}))()")
        ok('atualização preserva os registros e migra o banco', st['build'] and st['sess'] == 1 and st['name'] == 'Bia' and st['w'] == 47.3 and st['video'] == 'agachamento-smith' and st['ver'] == 2 and not any(c.startswith('projeto-evolucao-') for c in st['caches']), st)
        pg.evaluate("(async()=>{for(const s of STORES) await DB.clear(s)})()"); pg.reload(); ready(pg)
    else:
        srv = serve_new(); pg.goto(U); ready(pg)
    # ---- 1-2: com internet, carregar todas as páginas ----
    pg.wait_for_function("navigator.serviceWorker.controller && typeof offlineReady==='function'", timeout=15000)
    ok('1 abre com internet e fica pronto para offline', pg.evaluate("offlineReady()"))
    pages = ['home', 'train', 'library', 'history', 'calendar', 'program', 'food', 'plan', 'subs', 'foods', 'foodHist', 'evo', 'me', 'backup', 'privacy']
    def visit_all(tag):
        bad = []
        for v in pages:
            pg.evaluate(f"stack=[{{v:'{v}',p:{{}}}}]; render()"); t = pg.inner_text('#view')
            if 'Algo deu errado' in t or len(t) < 40: bad.append(v)
        for t in ['corpo', 'ex', 'fotos', 'resumo']:
            pg.evaluate(f"evoTab='{t}'; stack=[{{v:'evo',p:{{}}}}]; render()")
            if 'Algo deu errado' in pg.inner_text('#view'): bad.append('evo:' + t)
        pg.evaluate("evoTab='corpo'; tab('home')"); ok(tag, not bad, bad)
    visit_all('2 todas as páginas carregam (online)')
    ok('3 manifest e ícones para instalação', pg.evaluate("fetch('manifest.webmanifest').then(r=>r.json()).then(m=>m.display==='standalone'&&m.icons.length>=3&&!!document.querySelector('link[rel=apple-touch-icon]'))"))
    if has_media:
        pg.wait_for_function("MEDIA_CACHED.size>0", timeout=15000); ok('vídeo local guardado para uso offline', True)
    # ---- 4-6: desconectar, fechar e abrir de novo em modo avião ----
    ctx.set_offline(True); pg.close(); pg = watch(ctx.new_page()); pg.goto(U); ready(pg)
    ok('4-6 abre sem internet após fechar', pg.evaluate("!!document.documentElement.dataset.build && navigator.onLine===false"))
    visit_all('7 todos os módulos navegáveis offline')
    # ---- 8-11: treino offline ----
    pg.click('[data-a=tab][data-v=train]'); pg.click('[data-a=startWorkout][data-id=w-infA]'); pg.wait_for_selector('.sr .ck')
    ok('8 iniciar treino offline', pg.evaluate('!!activeSession() && S.sessions.filter(s=>s.status==="active").length===1'))
    t = pg.inner_text('.ex .demo')
    if has_media:
        ok('15 selo "Disponível offline"', 'Disponível offline' in t, t); pg.click('.ex [data-a=videoPlay]'); pg.wait_for_selector('video.demov')
        rg = pg.evaluate("fetch(document.querySelector('video.demov').src,{headers:{Range:'bytes=100-299'}}).then(async r=>[r.status,(await r.arrayBuffer()).byteLength,r.headers.get('Content-Range')])")
        ok('15 vídeo local servido offline em trechos (Range)', rg[0] == 206 and rg[1] == 200 and rg[2].startswith('bytes 100-299/'), rg); pg.click('#sheet .btn[data-a=closeSheet]')
        pg.locator('.exnav [data-a=exNav][data-d="1"]').click(); ok('exercício sem vídeo: sem demonstração offline', 'Sem demonstração cadastrada' in pg.inner_text('.ex .demo')); pg.locator('.exnav [data-a=exNav][data-d="-1"]').click()
    else:
        ok('15 sem vídeo local e sem internet: instruções escritas', 'Sem demonstração cadastrada' in t and pg.locator('.ex a[href*=youtube]').count() == 0, t)
        pg.click('.ex .demo [data-a=exSheet]'); ok('15 instruções e ilustração offline', 'Execução' in pg.inner_text('#sheet') and pg.locator('#sheet svg.fig').count() == 1); pg.click('#sheet .btn[data-a=closeSheet]')
    w = pg.locator('.sr:not(.srh) input[data-f=w]'); r = pg.locator('.sr:not(.srh) input[data-f=r]')
    for i in range(3):
        w.nth(i).fill('10'); r.nth(i).fill('12'); r.nth(i).blur(); pg.click(f'.sr:not(.srh) .ck >> nth={i}')
    ok('9 registrar séries', pg.evaluate('doneSets(activeSession().entries[0]).length===3'))
    pg.click('.sr:not(.srh) >> nth=2 >> .stp >> nth=0 >> button >> nth=1'); pg.click('.sr:not(.srh) >> nth=2 >> .stp >> nth=0 >> button >> nth=1')
    ok('10 alterar carga', pg.evaluate('activeSession().entries[0].sets[2].w===12'))
    pg.click('[data-a=restStart]'); pg.wait_for_timeout(1200); a1 = pg.evaluate("Rest.get().state==='run' && Rest.left()<89500"); pg.click('[data-a=restPause]'); l1 = pg.evaluate('Rest.left()'); pg.wait_for_timeout(700); l2 = pg.evaluate('Rest.left()'); pg.click('[data-a=restResume]')
    pg.evaluate("(()=>{const se=activeSession(); se.startedAt-=30*60000; save('sessions',se); kvSet('rest',{...Rest.get(),endAt:Date.now()-20000});})()"); pg.wait_for_timeout(700)
    ok('11 cronômetros por horário real (pausa, retomada, retorno do segundo plano)', a1 and abs(l1 - l2) < 5 and pg.evaluate("Rest.get().state==='done'") and pg.inner_text('.sclock b').startswith('30:'))
    pg.click('[data-a=finishAsk]'); pg.click('[data-a=finish]'); pg.wait_for_selector('.hero.done'); ok('treino finalizado', 'PARABÉNS' in pg.inner_text('#view'))
    pg.click('[data-a=tab][data-v=train]'); pg.click('.navc[data-v=history]'); ok('12 consultar histórico', pg.locator('.li.card').count() == 1)
    pg.click('[data-a=tab][data-v=food]'); pg.click('[data-a=mealAll] >> nth=0'); ok('13 registrar alimentação', pg.evaluate('dayTotals(today()).n===4'))
    pg.click('[data-a=tab][data-v=evo]'); pg.click('[data-a=bodyForm]'); pg.fill('[name=weight]', '47.8'); pg.click('[data-a=bodySave]'); ok('14 registrar peso', pg.evaluate('currentWeight()===47.8'))
    from PIL import Image; Image.new('RGB', (300, 400), (140, 170, 140)).save(os.path.join(profile, 'f.jpg'))
    pg.click('[data-a=evoTab][data-v=fotos]'); pg.set_input_files('input[data-c=photoAdd]', os.path.join(profile, 'f.jpg')); pg.wait_for_selector('.gal img')
    # ---- 16: exportar backup offline ----
    pg.click('[data-a=tab][data-v=me]'); pg.click('[data-a=go][data-v=backup]'); ok('área Backup e segurança', 'nunca' in pg.inner_text('#view'))
    with pg.expect_download() as d: pg.click('[data-a=backupExport][data-p="1"]')
    bk = os.path.join(profile, 'bk.json'); d.value.save_as(bk); data = json.load(open(bk)); pg.wait_for_timeout(300)
    ok('16 exportar backup (com fotos) e registrar a data', data['app'] == 'projeto-evolucao' and len(data['sessions']) == 1 and len(data['photos']) == 1 and pg.evaluate('!!S.kv.lastBackup') and 'nunca' not in pg.inner_text('.kvl'))
    with pg.expect_download() as d: pg.click('[data-a=csv][data-t=treinos]')
    d.value.save_as(os.path.join(profile, 't.csv')); ok('CSV de treinos', 'Agachamento no Smith;1;10;12;sim' in open(os.path.join(profile, 't.csv'), encoding='utf-8-sig').read())
    with pg.expect_download() as d: pg.click('[data-a=csv][data-t=alimentacao]')
    ok('CSV de alimentação', d.value.suggested_filename.endswith('.csv'))
    pg.click('[data-a=copyMake]'); pg.wait_for_timeout(300); ok('cópia de segurança manual', pg.evaluate('S.backups.length===1'))
    # ---- 17: fechar e reabrir ----
    pg.close(); pg = watch(ctx.new_page()); pg.goto(U); ready(pg)
    ok('17 fechar e reabrir offline mantém registros', pg.evaluate("doneSessions().length===1 && currentWeight()===47.8 && dayTotals(today()).n===4 && S.photos.length===1 && S.backups.length===1"))
    # ---- 18: importar backup (validação + confirmação) ----
    bad = os.path.join(profile, 'bad.json'); open(bad, 'w').write('{"app":"outro"}')
    pg.click('[data-a=tab][data-v=me]'); pg.click('[data-a=go][data-v=backup]'); pg.set_input_files('input[data-c=backupImport]', bad); pg.wait_for_selector('#sheet.on')
    ok('18 arquivo inválido recusado', 'Arquivo recusado' in pg.inner_text('#sheet') and pg.evaluate('doneSessions().length===1')); pg.click('#sheet .btn[data-a=closeSheet]')
    pg.evaluate("(async()=>{await remove('sessions',S.sessions[0].id); await remove('body',S.body[0].id)})()")
    pg.set_input_files('input[data-c=backupImport]', bk); pg.wait_for_selector('#sheet.on'); ok('18 pede confirmação antes de substituir', 'substituídos' in pg.inner_text('#sheet') and pg.evaluate('S.sessions.length===0'))
    pg.click('[data-a=confirmOk]'); pg.wait_for_timeout(1200)
    ok('18 importar backup restaura os dados', pg.evaluate("doneSessions().length===1 && currentWeight()===47.8 && S.photos.length===1 && S.backups.some(b=>b.label==='Antes de importar backup')"))
    # ---- 19-20: "reiniciar o aparelho": encerra o navegador inteiro e abre de novo, ainda offline ----
    ctx.close(); ctx = launch(); ctx.set_offline(True); pg = watch(ctx.new_page()); pg.goto(U); ready(pg)
    ok('19-20 após reiniciar, tudo continua disponível offline', pg.evaluate("doneSessions().length===1 && currentWeight()===47.8 && dayTotals(today()).n===4 && S.photos.length===1 && !!document.documentElement.dataset.build"))
    ok('tela offline guardada', pg.evaluate("fetch('offline.html').then(r=>r.text()).then(t=>t.includes('sem conexão'))"))
    ok('sem rolagem horizontal', pg.evaluate('document.documentElement.scrollWidth<=window.innerWidth'))
    ctx.set_offline(False); pg.reload(); ready(pg); pg.click('[data-a=tab][data-v=train]'); pg.click('.navc[data-v=library]'); pg.click('#libList .li >> nth=3'); pg.wait_for_timeout(200)
    ok('modo online: botão abre pesquisa no YouTube quando não há vídeo local', pg.locator('#view a.video[href^="https://www.youtube.com/results?search_query="]').count() == 1 and 'Disponível apenas online' in pg.inner_text('#view'))
    ctx.close()
finally:
    if srv: srv.terminate()
ok('nenhuma requisição a servidores externos durante todo o uso', not external, external[:5])
ok('nenhum erro no console', not errs, errs[:5])
print(f'{sum(res)} de {len(res)} verificações ok'); sys.exit(0 if all(res) else 1)
