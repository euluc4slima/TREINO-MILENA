# Instalação e uso — passo a passo

Guia para quem nunca programou. Faça na ordem. Os comandos estão prontos para copiar e colar.

**Caminho mais curto:** se você só quer o app no iPhone, vá direto às Partes E e F. O GitHub gera e publica o aplicativo sozinho; as Partes B, C e D são opcionais.

---

## PARTE A — Como baixar o projeto

1. Abra a página do repositório no GitHub.
2. Clique no botão verde **Code**.
3. Clique em **Download ZIP**.
4. Abra a pasta Downloads e dê dois cliques no arquivo ZIP para descompactar. Surge a pasta `projeto-evolucao`.

Se você recebeu o ZIP diretamente (sem GitHub), basta descompactar.

---

## PARTE B — Como abrir o projeto no computador (opcional)

### 1. Instalar o Node.js
1. Acesse **nodejs.org**.
2. Baixe a versão indicada como **LTS**.
3. Abra o instalador e avance até o fim com as opções padrão.

### 2. Abrir o Terminal
- **Mac:** pressione `Command + Espaço`, digite `Terminal` e pressione Enter.
- **Windows:** abra o menu Iniciar, digite `PowerShell` e pressione Enter.

### 3. Conferir a instalação
```bash
node -v
```
Deve aparecer algo como `v20.11.0` (qualquer número a partir de 18 serve).

### 4. Entrar na pasta do projeto
Digite `cd ` (com um espaço depois), arraste a pasta `projeto-evolucao` para dentro da janela do Terminal e pressione Enter. Fica parecido com:
```bash
cd ~/Downloads/projeto-evolucao
```

### 5. Instalar as dependências
```bash
npm install
```
Termina em um segundo: o projeto não tem dependências para baixar.

---

## PARTE C — Como executar no computador (opcional)

```bash
npm run dev
```
O Terminal mostra `http://localhost:5173`. Abra esse endereço no navegador.

Para encerrar, volte ao Terminal e pressione `Ctrl + C`.

Neste modo o offline fica desligado de propósito, para que alterações no código apareçam ao recarregar. Para testar a versão final com offline:
```bash
npm run preview
```
e abra `http://localhost:4173`.

Para rodar os testes:
```bash
npm test
```

---

## PARTE D — Como gerar a versão final (opcional)

```bash
npm run build
```
Os arquivos prontos ficam na pasta **`dist`**, dentro de `projeto-evolucao`. É essa pasta que vai para a internet.

Você não precisa fazer isso se usar o GitHub Pages (Parte F): o GitHub gera a versão final sozinho.

---

## PARTE E — Como publicar no GitHub

### 1. Criar a conta e o repositório
1. Crie uma conta em **github.com**.
2. Clique no **+** no alto à direita e em **New repository**.
3. Em *Repository name*, escreva `projeto-evolucao`.
4. Escolha **Public** (necessário para o GitHub Pages em contas gratuitas; o código não contém nenhum dado pessoal).
5. Não marque nenhuma outra opção. Clique em **Create repository**.

### 2. Enviar os arquivos

**Opção sem Terminal (recomendada):**
1. Instale o **GitHub Desktop** (desktop.github.com) e entre com sua conta.
2. Menu **File → Add local repository** e escolha a pasta `projeto-evolucao`. Se ele avisar que a pasta não é um repositório, clique em **create a repository** e confirme.
3. No campo *Summary*, escreva `Primeira versão` e clique em **Commit to main**.
4. Clique em **Publish repository**, desmarque *Keep this code private* e confirme.

**Opção com Terminal** (exige o Git instalado, de git-scm.com). Dentro da pasta do projeto, troque `SEU-USUARIO` pelo seu nome de usuário:
```bash
git init
git add .
git commit -m "Primeira versão"
git branch -M main
git remote add origin https://github.com/SEU-USUARIO/projeto-evolucao.git
git push -u origin main
```

### 3. Manter o código atualizado
Sempre que alterar arquivos:
- **GitHub Desktop:** escreva um resumo, clique em **Commit to main** e depois em **Push origin**.
- **Terminal:**
```bash
git add .
git commit -m "Descreva a mudança"
git push
```

**Nunca coloque na pasta do projeto** backups exportados, CSVs ou fotos pessoais.

---

## PARTE F — Como instalar no iPhone

O iPhone só instala aplicativos web servidos por HTTPS. O GitHub Pages oferece isso de graça.

### 1. Ativar o GitHub Pages (uma única vez)
1. No repositório, abra **Settings**.
2. No menu lateral, clique em **Pages**.
3. Em *Build and deployment → Source*, escolha **GitHub Actions**.
4. Abra a aba **Actions** do repositório. Se houver um aviso pedindo para habilitar os fluxos, confirme.
5. Clique em **Publicar no GitHub Pages** e em **Run workflow**. Aguarde o círculo ficar verde (1 a 2 minutos).
6. Volte em **Settings → Pages**: o endereço aparece no alto, no formato `https://SEU-USUARIO.github.io/projeto-evolucao/`.

Daí em diante, cada envio de código publica a nova versão sozinho.

Se o fluxo falhar (círculo vermelho), clique nele para ver a etapa com erro. Alternativa que não depende do GitHub Actions: rode `npm run build` (Parte D) e arraste a pasta `dist` para o deploy manual do Netlify.

### 2. Instalar
1. No iPhone, abra o **Safari** (precisa ser o Safari).
2. Digite o endereço do passo anterior.
3. Espere a tela inicial aparecer e navegue por alguns segundos.
4. Toque no botão **Compartilhar** (quadrado com seta para cima).
5. Role a lista e toque em **Adicionar à Tela de Início**.
6. Toque em **Adicionar**.
7. Abra o app pelo novo ícone **Evolução**, com internet, e aguarde alguns segundos. É nessa abertura que os arquivos são guardados para uso offline.

Use sempre o ícone. O que for registrado pelo Safari não aparece no app instalado, e vice-versa.

---

## PARTE G — Como utilizar sem internet

### Quando o app está pronto
Abra **Perfil → Backup e segurança**. Na seção *Situação*, a linha **Pronto para uso offline** deve mostrar **sim**.

### Teste em modo avião
1. Feche o app (deslize para cima e descarte-o).
2. Ative o **Modo Avião** e confira se o Wi‑Fi também desligou.
3. Abra o app pelo ícone. Ele deve abrir normalmente.
4. Inicie um treino, registre uma série, inicie o descanso, finalize.
5. Marque um alimento como consumido e registre o peso.
6. Feche o app e abra de novo: os registros devem estar lá.
7. Desligue e ligue o iPhone, ainda em modo avião, e abra o app outra vez.

Se algum passo falhar, volte a ficar online, abra o app, aguarde meio minuto e repita.

### O que depende de conexão
- A primeira abertura e o recebimento de atualizações.
- O botão de execução quando não há vídeo local: ele abre uma pesquisa no YouTube. Sem internet, o botão mostra a ilustração e as instruções escritas.

Todo o resto funciona offline: treinos, cronômetros, histórico, alimentação, evolução, fotos, calendário, backup.

### Vídeos offline (opcional)
Para ter demonstrações sem internet, coloque vídeos MP4 próprios ou autorizados em `public/videos/exercises/`, com os nomes indicados no arquivo `LEIA-ME.md` dessa pasta, e publique de novo. O selo do exercício passa a mostrar **Disponível offline**.

### Limites do iPhone
Com a tela bloqueada, o iPhone pausa o app. O cronômetro mostra o tempo correto ao voltar, mas o aviso sonoro do descanso não toca com o aparelho bloqueado. Durante o treino, o app pede ao sistema para manter a tela acesa.

---

## PARTE H — Como fazer backup

Os dados existem **somente no iPhone**. Se o aparelho for perdido, trocado ou o app removido, só o backup recupera os registros.

### Exportar
1. **Perfil → Backup e segurança**.
2. Toque em **Exportar tudo (com fotos)**.
3. Na janela de compartilhamento, escolha **Salvar em Arquivos** e uma pasta do **iCloud Drive**, ou envie para o seu próprio e-mail.

Sugestão: uma vez por semana. A tela mostra a data do último backup e avisa quando passa de 14 dias.

### Restaurar
1. **Perfil → Backup e segurança → Escolher arquivo de backup**.
2. Selecione o arquivo `.json`.
3. O app confere o arquivo, mostra o que ele contém e pede confirmação. Os dados atuais são substituídos.

Antes de substituir, o app guarda sozinho uma cópia interna do estado atual. Se algo sair errado, use **Restaurar** na lista *Cópias de segurança neste aparelho*.

### Cópias internas
**Criar cópia de segurança agora** guarda um ponto de restauração dentro do app (sem fotos). Serve para desfazer um engano, não substitui o arquivo exportado.

### Planilhas
Os botões **Treinos**, **Alimentação** e **Medidas** geram arquivos CSV que abrem no Numbers ou no Excel.

---

## PARTE I — Como atualizar

Atualizar o aplicativo **não apaga os registros**: o código e os dados ficam em lugares separados no iPhone.

1. Exporte um backup antes, por precaução (Parte H).
2. Altere os arquivos do projeto no computador.
3. Envie para o GitHub (Parte E, item 3). O GitHub publica a nova versão em 1 a 2 minutos.
4. No iPhone, com internet, abra o app. Em instantes aparece **Nova versão disponível — Atualizar**. Toque em **Atualizar**.

Se o aviso não aparecer: **Perfil → Verificar atualização**, ou feche e abra o app.

Para conferir a versão em uso, veja o fim da tela **Perfil** (número da versão e código do build).

### O que não fazer
- Não remova o ícone da Tela de Início para "reinstalar": isso apaga os dados. Se precisar, exporte o backup antes e importe depois.
- Não use **Apagar todos os dados** sem ter um backup.
- Não limpe os dados de sites nos Ajustes do Safari sem ter um backup.
