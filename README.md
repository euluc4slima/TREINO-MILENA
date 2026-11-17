# Projeto Evolução

Aplicativo pessoal de treinamento, alimentação e evolução para iPhone. É uma PWA **offline-first**: depois de instalada e carregada uma vez, funciona sem internet, e todos os dados ficam no aparelho.

> Ferramenta de organização e acompanhamento. Não faz diagnóstico nem prescrição. Metas nutricionais são estimativas sujeitas à validação profissional.

Guia passo a passo para quem não programa: **[INSTALACAO_E_USO.md](INSTALACAO_E_USO.md)** · Privacidade: **[PRIVACIDADE.md](PRIVACIDADE.md)**

## Comandos

```bash
npm install      # não baixa nada: o projeto não tem dependências
npm run dev      # desenvolvimento em http://localhost:5173 (sem service worker)
npm test         # testes automatizados de banco e cálculos
npm run build    # gera a versão de produção em dist/
npm run preview  # build + servidor de produção em http://localhost:4173 (com offline)
```

Requer Node.js 18 ou superior.

## Tecnologia e decisões

| Item | Escolha |
|---|---|
| Interface | HTML, CSS e JavaScript puros, organizados por funcionalidade |
| Banco | IndexedDB com migrações versionadas (`src/database`) |
| Offline | Service Worker próprio: precache de todo o app + Cache First |
| Build | `scripts/build.mjs`, só com módulos nativos do Node |
| Dependências | **nenhuma**, nem em execução nem em desenvolvimento |

**Por que não React, TypeScript, Vite, Dexie e Workbox:** o aplicativo já existia em JavaScript puro, funcionando e testado. Reescrevê-lo traria risco de regressão sem ganho para um app individual, e zero dependências é a garantia mais forte de funcionamento offline e de que o projeto continuará compilando daqui a anos. O que essas ferramentas ofereceriam foi implementado diretamente: build com nomes versionados pelo conteúdo, precache automático, migrações de banco e testes.

## Estrutura

```
projeto-evolucao/
├── index.html                 página única; lista os scripts em ordem de carregamento
├── public/                    copiado como está para dist/
│   ├── icons/                 ícones e telas de abertura do iPhone
│   ├── videos/exercises/      vídeos MP4 locais (opcional) + LEIA-ME.md
│   ├── manifest.webmanifest
│   ├── offline.html           tela exibida se um recurso não estiver guardado
│   └── _headers               cabeçalhos de cache (Netlify)
├── src/
│   ├── main.js                inicialização
│   ├── sw.js                  modelo do service worker (preenchido no build)
│   ├── styles/app.css         identidade visual, temas claro e escuro
│   ├── utils/                 helpers.js (datas, formatação), units.js (kg/lb, cm/pol)
│   ├── components/            ui.js (ícones, navegação, folhas, toast), chart.js
│   ├── database/              schema.js, migrations.js, db.js, seed.js
│   ├── services/              backup.js, export.js, offline.js, storage.js
│   ├── pages/home.js          Início
│   └── features/
│       ├── workouts/          logic, timers, Tela de Treino, editor, histórico, programa
│       ├── exercises/         biblioteca, figura muscular, media.js (vídeo local/online)
│       ├── nutrition/         logic, Alimentação
│       ├── progress/          logic, Evolução, fotos, resumo, diário
│       ├── calendar/          logic, Calendário
│       └── profile/           Perfil, lembretes, Backup e Segurança, Privacidade
├── scripts/                   build.mjs, serve.mjs
├── tests/                     calculos.test.mjs, banco.test.mjs, helpers/, e2e/
├── .github/workflows/deploy.yml   publicação automática no GitHub Pages
├── netlify.toml · vercel.json
├── package.json · package-lock.json · .gitignore
└── README.md · INSTALACAO_E_USO.md · PRIVACIDADE.md
```

Os arquivos de `src/` são scripts clássicos que compartilham o mesmo escopo; a ordem em `index.html` é a ordem de dependência. O build junta todos em `dist/assets/app.<hash>.js`.

## Funcionamento offline

1. **Sem dependências externas.** Nenhuma fonte, script, imagem ou API remota. O app só fala com o próprio endereço em que foi publicado. O teste de ponta a ponta confirma que nenhuma requisição externa é feita.
2. **Precache.** No build, `dist/sw.js` recebe a lista de todos os arquivos e uma versão calculada a partir do conteúdo. Na primeira abertura com internet, o service worker guarda tudo.
3. **Cache First.** Toda navegação e todo arquivo são atendidos pelo cache. A rede só é usada para arquivos ainda não guardados; se falhar, aparece `offline.html`.
4. **Atualização segura.** Ao publicar um build novo, a versão muda sozinha. O app mostra "Nova versão disponível — Atualizar", troca os arquivos e remove o cache antigo. O banco de dados não é tocado.
5. **Dados.** IndexedDB, com pedido de armazenamento persistente ao sistema. Erros de gravação e falta de espaço geram aviso.
6. **Vídeos.** Arquivos em `public/videos/exercises/` são guardados em um cache próprio após a primeira abertura, e servidos em trechos (Range), como o Safari exige.

O que depende de internet: baixar o app e suas atualizações, e a pesquisa de exercícios no YouTube.

### Demonstração dos exercícios

| Situação | Botão | Selo |
|---|---|---|
| Vídeo local guardado | abre o vídeo no app | Disponível offline |
| Sem vídeo local, com internet | abre a pesquisa no YouTube | Disponível apenas online |
| Sem vídeo local, sem internet | abre ilustração e instruções escritas | Sem demonstração cadastrada |

Nenhum vídeo acompanha o projeto. Veja `public/videos/exercises/LEIA-ME.md` para os nomes de arquivo e a compressão.

## Banco de dados e migrações

Tabelas: `kv` (perfil, metas, preferências, divisão semanal, cardápio padrão, ciclos, lembretes), `exercises`, `workouts`, `sessions`, `foods`, `days`, `body`, `diary`, `photos`, `backups`.

Para mudar a estrutura: aumente `DB_VERSION` em `src/database/schema.js` e acrescente um item em `MIGRATIONS` (`src/database/migrations.js`). Migrações só acrescentam ou ajustam; nunca apagam registros. A migração 1 → 2 (cópias internas e vídeo por exercício) é coberta por teste.

## Backup e segurança

Em **Perfil → Backup e segurança**:
- Exportar tudo em JSON, com ou sem fotos (as fotos vão dentro do arquivo).
- Importar backup, com validação da estrutura e confirmação antes de substituir.
- CSV de treinos, alimentação e medidas.
- Cópias de segurança internas (até 5), criadas manualmente e automaticamente antes de importar, restaurar ou redefinir o planejamento.
- Data do último backup, espaço usado e situação do modo offline.

## Publicação

O app usa apenas caminhos relativos: funciona na raiz de um domínio ou em subpasta (como `usuario.github.io/projeto-evolucao/`), sem ajuste de caminho base.

- **GitHub Pages:** em Settings → Pages, escolha Source "GitHub Actions". O fluxo `.github/workflows/deploy.yml` testa, gera o build e publica a cada envio para `main`. Em contas gratuitas, o Pages exige repositório público: o código fica visível, mas nenhum dado pessoal está nele.
- **Netlify:** importe o repositório (usa `netlify.toml`) ou arraste a pasta `dist/` para o deploy manual.
- **Vercel:** importe o repositório (usa `vercel.json`).

## Testes

- `npm test` — 23 testes de cálculos e banco (duração com pausas, volume, progressão, planejado × consumido, ciclo, persistência, migração, backup, validação, cópias internas, falta de espaço), com um IndexedDB em memória.
- `tests/e2e/offline_e2e.py` — opcional, exige Python e Playwright. Percorre os 20 cenários de offline em navegador real: atualização a partir da versão antiga, uso completo sem rede, vídeo local, backup, fechar e reabrir, reinício do navegador.

**O que os testes não cobrem:** foram executados no Chromium, não em um iPhone. Instalação pela Tela de Início, reprodução de vídeo, câmera, notificações e reinício do aparelho precisam ser conferidos no próprio iPhone — o roteiro está na Parte G do guia. O fluxo do GitHub Actions também não pôde ser executado antes da entrega.

## Limitações do iOS

- **Segundo plano:** o iOS suspende o app ao bloquear a tela. Os cronômetros usam horários reais e mostram o tempo certo ao voltar, mas som e notificação do fim do descanso não disparam com o aparelho bloqueado.
- **Lembretes:** sem servidor de push, só aparecem com o app aberto. Alternativa: exportar os lembretes para o app Calendário.
- **Armazenamento:** o Safari pode apagar dados de sites não usados por semanas. Apps instalados na Tela de Início ficam mais protegidos, mas o backup exportado continua sendo a única garantia.
- **Safari e app instalado têm armazenamentos separados.** Use backup para levar dados de um para o outro.
- **Som** segue a chave de silencioso; **vibração** não existe para sites.
- **Notificações** exigem iOS 16.4+ e app instalado.
- **Vídeos:** use H.264 em MP4.

## Segurança do repositório

Não há segredos, tokens ou credenciais. Não envie backups, CSVs ou fotos: o `.gitignore` bloqueia os nomes padrão dos arquivos exportados.
