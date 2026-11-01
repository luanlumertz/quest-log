# QuestLog

[![Acesse o QuestLog](https://img.shields.io/badge/QuestLog-Acessar-7C6AF7?style=flat)](https://quest-log-omega-jade.vercel.app/)
[![Explore e teste a API no Swagger](https://img.shields.io/badge/Swagger-API-85EA2D?style=flat&logo=swagger&logoColor=white)](https://questlog-sandbox.onrender.com/docs/)
[![Explore o catálogo de componentes no Storybook](https://img.shields.io/badge/Storybook-Componentes-FF4785?style=flat&logo=storybook&logoColor=white)](#catálogo-de-componentes)
[![Ask DeepWiki](https://deepwiki.com/badge.svg)](https://deepwiki.com/luanlumertz/quest-log)

O QuestLog é uma aplicação web para organizar sua biblioteca de jogos e acompanhar sua experiência com cada título. Registre o progresso, o tempo jogado, as datas de início e conclusão e suas avaliações, reunindo em um só lugar o histórico da sua jornada nos jogos.

O projeto nasceu da minha dificuldade em encontrar uma ferramenta que combinasse esses registros da forma como eu gostaria de usar. Desenvolvi o QuestLog para atender a uma necessidade própria e aproveitei essa oportunidade para aprofundar meus conhecimentos em desenvolvimento full stack, testes automatizados, Docker e pipelines de integração e entrega contínuas.

![Dashboard do QuestLog com estatísticas da biblioteca, jogos em andamento e atividades recentes](assets/screenshots/dashboard.png)

## Sumário

- [Funcionalidades](#funcionalidades)
- [Tecnologias](#tecnologias)
- [Arquitetura](#arquitetura)
- [Documentação da API](#documentação-da-api)
- [Catálogo de componentes](#catálogo-de-componentes)
- [Como executar localmente](#como-executar-localmente)
- [Como executar os testes](#como-executar-os-testes)
- [Licença](#licença)

## Funcionalidades

- **Busca de jogos:** pesquisa paginada integrada à RAWG e consulta aos detalhes de cada título.
- **Biblioteca pessoal:** adição e remoção de jogos, seleção de plataformas e filtros por título e status.
- **Acompanhamento de progresso:** organização dos jogos nos status Quero jogar, Jogando, Pausado, Abandonado e Zerado.
- **Registro da experiência:** avaliações de 0 a 5, tempo jogado e datas de início e conclusão.
- **Dashboard:** total de jogos, distribuição por status, tempo total jogado, jogos em andamento e atividades recentes.
- **Cadastro e autenticação:** criação de conta com verificação por e-mail, login e renovação automática da sessão.
- **Gerenciamento da conta:** edição do nome de exibição, alteração de senha, recuperação de acesso por e-mail e exclusão da conta.

## Tecnologias

### Frontend

- **React e TypeScript:** construção da interface e tipagem do código.
- **Vite:** servidor de desenvolvimento e build da aplicação.
- **Tailwind CSS:** estilização e layouts responsivos.
- **React Router:** navegação entre páginas.
- **TanStack Query (React Query):** consultas à API, cache e sincronização dos dados.
- **React Hook Form e Zod:** gerenciamento e validação dos formulários.
- **Storybook:** catálogo interativo dos componentes, suas propriedades e estados.

### Backend

- **Node.js, Express e TypeScript:** desenvolvimento da API REST.
- **PostgreSQL e Prisma ORM:** persistência dos dados, consultas e migrations.
- **Zod:** validação dos dados recebidos pela API.
- **OpenAPI e Swagger UI:** documentação dos endpoints e execução de requisições pelo navegador.
- **JSON Web Token (JWT) e bcryptjs:** autenticação e hash de senhas.
- **Helmet, CORS e express-rate-limit:** cabeçalhos de segurança, configuração de acesso entre origens e limitação de requisições.
- **Pino:** logs estruturados em JSON na produção e saída legível com pino-pretty no desenvolvimento.
- **RAWG:** integração com o catálogo de jogos.
- **Brevo e Nodemailer:** envio de e-mails pela API da Brevo ou por SMTP, conforme o ambiente.

### Testes e qualidade

- **Vitest:** execução dos testes unitários e de integração, com relatórios de cobertura.
- **React Testing Library:** testes dos componentes e das interações na interface.
- **MSW:** simulação das respostas da API nos testes do frontend.
- **Supertest:** testes HTTP da API.
- **Playwright:** testes de ponta a ponta (E2E).
- **ESLint, Prettier, Husky e lint-staged:** análise estática, formatação e verificações antes dos commits.

### Infraestrutura e entrega

- **Docker Compose:** ambiente local com PostgreSQL, pgAdmin e Mailpit.
- **GitHub Actions:** pipeline de verificações automatizadas e deploy do backend.
- **Vercel e Render:** hospedagem do frontend e do backend, respectivamente.
- **Neon:** hospedagem do banco PostgreSQL em produção.

## Arquitetura

O projeto reúne o frontend e o backend no mesmo repositório. O frontend React executa no navegador e consome a API REST, responsável pelas regras de negócio, pela persistência dos dados e pelas integrações externas.

O diagrama abaixo representa o fluxo em produção:

```mermaid
flowchart TD
    browser["Navegador · React"]
    vercel["Vercel · Hospedagem do frontend e proxy /api"]
    api["Render · API Node.js e Express"]
    database[("Neon · PostgreSQL")]
    rawg["RAWG · Catálogo de jogos"]
    brevo["Brevo · Envio de e-mails"]

    browser -->|Carregamento da aplicação e requisições /api| vercel
    vercel -->|Encaminhamento das requisições da API| api
    api -->|Prisma ORM| database
    api -->|Busca e detalhes de jogos| rawg
    api -->|Verificação de cadastro e recuperação de acesso| brevo
```

Em produção, o navegador faz as chamadas à API pelo caminho `/api` no domínio do frontend. A Vercel encaminha essas requisições ao backend no Render e acrescenta um cabeçalho secreto validado pela API. Assim, a comunicação do navegador acontece pela mesma origem, e o segredo fica restrito à infraestrutura.

No backend, as responsabilidades são divididas entre **rotas e middlewares** (entrada, autenticação e validação), **controllers** (requisições e respostas HTTP), **services** (regras de negócio), **repositories** (acesso ao banco) e **integrations** (comunicação com serviços externos).

No frontend, as **páginas e os componentes** compõem a interface, os **hooks** organizam consultas e mutações com React Query, e os **services** centralizam as chamadas à API. O cliente HTTP também coordena a renovação da sessão e a repetição da requisição quando necessário.

No ambiente local, o Docker Compose disponibiliza PostgreSQL, pgAdmin e Mailpit. O Mailpit permite inspecionar os e-mails enviados por SMTP durante o desenvolvimento.

## Documentação da API

A documentação usa **OpenAPI e Swagger UI** para apresentar endpoints, parâmetros, autenticação, respostas e modelos de dados (**Schemas**), além de permitir a execução de requisições pelo navegador. A seção **Comece por aqui** orienta o cadastro, a confirmação da conta e o login.

### Acesso público ao Swagger

[Explore e teste a API no Swagger](https://questlog-sandbox.onrender.com/docs/), sem instalar o projeto.

Os testes usam um **sandbox com API e banco próprios**, separado das contas e dos dados da aplicação principal. As operações são reais dentro desse ambiente: é possível criar, alterar e excluir seus dados de teste.

Para testar rotas protegidas, crie uma conta no sandbox pelas rotas de cadastro, confirme o código recebido por e-mail e faça login por `POST /auth/login`. O navegador gerencia os cookies automaticamente; não é necessário copiar tokens manualmente. Nas operações que exigem `X-QuestLog-Request`, mantenha o valor `true`. Se a sessão de acesso expirar, use `POST /auth/refresh` ou faça login novamente.

As contas do sandbox ficam elegíveis para exclusão automática após mais de **30 dias sem atividade**. O serviço pode demorar a responder no primeiro acesso após um período de inatividade.

### Acesso local ao Swagger

Siga o guia de [execução local](#como-executar-localmente) e mantenha o backend e o frontend em execução. Abra [http://localhost:5173/api/docs/](http://localhost:5173/api/docs/); o servidor `/api` usa o proxy local do Vite.

Para renovar e encerrar a sessão pelo Swagger local, configure no `backend/.env`:

```dotenv
AUTH_COOKIE_PATH_PREFIX=/api
```

Reinicie o backend e faça login novamente após essa configuração. Use uma conta do ambiente local e consulte os códigos de confirmação no [Mailpit](http://localhost:8025). As requisições são reais e usam o banco configurado no backend local.

## Catálogo de componentes

O **Storybook** apresenta os componentes de UI, autenticação, dashboard, jogos, biblioteca, perfil e navegação. Em **Docs**, consulte as descrições e propriedades; no **Canvas**, interaja com os exemplos e use **Controls** para experimentar as opções disponíveis. A página **Comece por aqui** explica como explorar o catálogo.

### Acesso público ao Storybook

**Link público:** [LINK] — substituir pelo endereço do catálogo após a publicação.

### Executar o Storybook localmente

Com Node.js e npm instalados, execute a partir da raiz do repositório:

```sh
cd frontend
npm ci
npm run storybook
```

Acesse [http://localhost:6006/](http://localhost:6006/). O catálogo usa **dados fictícios e operações simuladas**: não precisa de login, backend, banco ou Docker, e as interações não alteram os dados da aplicação. Os mesmos exemplos são usados localmente e no catálogo publicado.

Com as dependências do frontend instaladas, você também pode iniciá-lo pela raiz com `npm run storybook`.

Para gerar a versão estática, dentro de `frontend/`:

```sh
npm run build-storybook
```

O resultado é gerado em `frontend/storybook-static/`, pasta ignorada pelo Git.

## Como executar localmente

### Pré-requisitos

- Node.js 24, versão utilizada na CI, e npm.
- Git.
- Docker com Docker Compose disponível.
- Uma chave da API da RAWG para buscar jogos e consultar seus detalhes.

### 1. Clonar o repositório e instalar as ferramentas da raiz

```sh
git clone https://github.com/luanlumertz/quest-log.git
cd quest-log
npm ci
```

O `npm ci` instala as ferramentas da raiz conforme o `package-lock.json`. As dependências do backend e do frontend serão instaladas pelo comando `setup`, após a configuração dos arquivos de ambiente.

### 2. Configurar as variáveis de ambiente

Copie os arquivos de exemplo para os respectivos arquivos `.env`:

| Arquivo de exemplo      | Cópia local     | Finalidade                                  |
| ----------------------- | --------------- | ------------------------------------------- |
| `.env.example`          | `.env`          | Configuração dos serviços do Docker Compose |
| `backend/.env.example`  | `backend/.env`  | Banco, autenticação, integrações e servidor |
| `frontend/.env.example` | `frontend/.env` | Endereço da API no desenvolvimento          |

No `.env` da raiz, preencha:

```dotenv
POSTGRES_PASSWORD=questlog_local
PGADMIN_EMAIL=admin@example.com
PGADMIN_PASSWORD=pgadmin_local
```

Esses valores são exemplos para o ambiente local. No `backend/.env`, configure:

```dotenv
DATABASE_URL="postgresql://questlog:questlog_local@localhost:5432/quest_log"
JWT_SECRET="substitua_por_um_segredo_aleatorio"
RAWG_API_KEY="sua_chave_da_rawg"
```

A senha em `DATABASE_URL` deve corresponder a `POSTGRES_PASSWORD` da raiz. Se a senha contiver caracteres especiais, codifique-os para uso em uma URL.

Para gerar um segredo para `JWT_SECRET`, execute:

```sh
node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"
```

Mantenha os demais valores de desenvolvimento do exemplo do backend: `NODE_ENV=development`, `PORT_LOCAL=3000`, `FRONTEND_URL=http://localhost:5173`, `TRUST_PROXY_HOPS=0` e as configurações SMTP do Mailpit. `DIRECT_URL`, `ORIGIN_SECRET` e as credenciais da Brevo podem permanecer sem configuração para esse fluxo local.

No `frontend/.env`, mantenha:

```dotenv
VITE_API_URL="http://localhost:3000"
```

As chaves da RAWG e de autenticação ficam somente no backend. Os arquivos `.env` são ignorados pelo Git.

### 3. Instalar as aplicações e preparar o banco local

Na raiz do repositório, com o Docker em execução:

```sh
npm run setup
npm run db:prepare
```

O `setup` instala as dependências do backend e do frontend com `npm ci` e gera o Prisma Client. Execute-o no primeiro uso e quando precisar reinstalar as dependências.

O `db:prepare` inicia PostgreSQL, pgAdmin e Mailpit pelo Compose, aguarda o banco ficar saudável e aplica as migrations existentes. Ele exige uma conexão local com o banco `quest_log` na porta `5432`, conferindo tanto `DATABASE_URL` quanto `DIRECT_URL`, quando definida. Variáveis do terminal têm prioridade sobre o `backend/.env`; conexões de outros ambientes são recusadas.

Execute `db:prepare` no primeiro uso e após receber novas migrations. Esses comandos exigem o Docker instalado e em execução; não iniciam o Docker Desktop automaticamente.

### 4. Iniciar o ambiente de desenvolvimento

Na raiz:

```sh
npm run dev
```

O comando verifica as portas, inicia a infraestrutura se necessário, aguarda o PostgreSQL e executa backend e frontend no mesmo terminal. Um resumo apresenta os endereços locais. O ambiente combinado inicia as ferramentas diretamente pelo Node, com menos anúncios de inicialização e preservando os avisos e erros do Vite e do Storybook. A telemetria do Storybook fica desativada nessa execução.

Os logs da API usam pino-pretty no desenvolvimento, com horário, nível e mensagem. A produção e a CI mantêm JSON. No Windows, a API recebe a saída direta para evitar uma incompatibilidade do `tsx watch`; os outros serviços recebem os prefixos **WEB** e **STORYBOOK**. As dependências e migrations devem estar preparadas conforme o passo anterior.

Para incluir o Storybook:

```sh
npm run dev:full
```

Acesse a aplicação em `http://localhost:5173`, o Swagger em `http://localhost:5173/api/docs/` e o Storybook em `http://localhost:6006/`. A API usa `PORT` ou `PORT_LOCAL` do backend; com o exemplo local, fica em `http://localhost:3000`, com healthcheck em `/healthz`.

O ambiente combinado exige `NODE_ENV=development` e `APP_ENV=development`, quando definidos, e o banco local `quest_log`. Se uma porta necessária estiver ocupada, a inicialização é interrompida sem encerrar o processo existente. O frontend e o Storybook também exigem suas portas ao serem iniciados individualmente.

Os comandos individuais continuam disponíveis na raiz:

| Comando                         | Finalidade                                         |
| ------------------------------- | -------------------------------------------------- |
| `npm run dev --prefix backend`  | Iniciar somente a API                              |
| `npm run dev --prefix frontend` | Iniciar somente o frontend                         |
| `npm run storybook`             | Iniciar somente o catálogo, sem depender do Docker |
| `npm run infra:up`              | Iniciar a infraestrutura e aguardar sua preparação |
| `npm run infra:stop`            | Parar a infraestrutura preservando os dados        |

Você também pode entrar na pasta de cada aplicação e executar o comando diretamente, em terminais separados:

| Pasta de execução | Comando             | Finalidade                 |
| ----------------- | ------------------- | -------------------------- |
| `backend/`        | `npm run dev`       | Iniciar somente a API      |
| `frontend/`       | `npm run dev`       | Iniciar somente o frontend |
| `frontend/`       | `npm run storybook` | Iniciar somente o catálogo |

Por exemplo, `cd backend` seguido de `npm run dev` equivale a executar `npm run dev --prefix backend` na raiz. Os comandos individuais não iniciam a infraestrutura automaticamente: para usar a aplicação, mantenha os serviços preparados no passo anterior em execução ou use `npm run infra:up` na raiz. Encerre cada servidor com `Ctrl+C` no respectivo terminal.

Se a preparação da infraestrutura falhar, os servidores não começam. Depois de iniciados, quando um dos comandos do grupo encerrar, os demais serão encerrados pelo `concurrently`. Erros de requisição ou falhas internas que mantenham um comando de observação aberto não encerram automaticamente o grupo.

### 5. Criar uma conta e acessar a aplicação

Cadastre-se pela interface e abra o Mailpit em `http://localhost:8025` para consultar o código de verificação enviado por e-mail. Após verificar o cadastro, entre na aplicação e busque jogos para montar sua biblioteca.

O pgAdmin fica disponível em `http://localhost:5050`, com o e-mail e a senha definidos no `.env` da raiz. Para cadastrar a conexão com o banco nele, use o host `postgres`, a porta `5432`, o banco `quest_log`, o usuário `questlog` e a senha definida em `POSTGRES_PASSWORD`.

Para encerrar, use `Ctrl+C` no terminal de `dev` ou `dev:full`; os servidores daquele grupo serão encerrados com uma mensagem de conclusão. Esse encerramento intencional não é tratado como falha da aplicação. No Windows, o npm que abriu o comando ainda pode pedir uma confirmação de encerramento, dependendo do terminal. O encerramento dos servidores não para os containers; o aviso de infraestrutura ligada aparece somente quando a consulta ao Docker encontra containers do projeto em execução. Para parar a infraestrutura, execute na raiz:

```sh
npm run infra:stop
```

O `infra:stop` para apenas os containers do projeto. Se for executado com a aplicação ainda aberta, as operações que usam banco e SMTP podem falhar. Processos iniciados em outros terminais são independentes, mas compartilham esses serviços.

Os dados são mantidos nos volumes do Docker. As credenciais iniciais do PostgreSQL são aplicadas na primeira criação do volume; alterar apenas o `.env` depois disso não altera a senha do banco existente.

## Como executar os testes

Instale as dependências e gere o Prisma Client conforme o guia de execução local. Os comandos abaixo indicam quando devem ser executados na raiz ou dentro de uma pasta específica.

Os bancos `quest_log_test` e `quest_log_e2e` são criados pelos scripts do Docker na primeira inicialização de um volume vazio; volumes anteriores à inclusão desses scripts precisam ter esses bancos criados separadamente.

Para as migrations de testes, deixe `DIRECT_URL` sem definição, inclusive no terminal, para que o Prisma use a `DATABASE_URL` do banco de testes correspondente. Execute os comandos em um terminal sem variáveis de conexão de outro ambiente, pois variáveis já definidas nele podem ter prioridade sobre os arquivos `.env`.

### Scripts do ambiente local

Na raiz, execute `npm run test:dev` para verificar as proteções de conexão, os conflitos de portas e o encerramento do grupo. Esses testes usam conexões fictícias e processos isolados; não precisam de Docker nem acessam o banco.

### Backend: testes unitários e de integração

Os testes de integração usam o PostgreSQL local e limpam os dados do banco de testes entre os casos. Configure um arquivo `backend/.env.test` dedicado:

```dotenv
DATABASE_URL="postgresql://questlog:questlog_local@localhost:5432/quest_log_test"
NODE_ENV=test
JWT_SECRET="chave_ficticia_exclusiva_para_testes_locais"
RAWG_API_KEY="chave_ficticia_para_testes"
FRONTEND_URL="http://localhost:5173"
TRUST_PROXY_HOPS=0
```

Substitua `questlog_local` pela senha do PostgreSQL definida no `.env` da raiz. Use exclusivamente o banco `quest_log_test`: a configuração dos testes de integração exige esse nome e uma conexão local. As integrações com RAWG e envio de e-mails são simuladas nessa suíte.

Com o PostgreSQL do Docker em execução, aplique as migrations e rode os testes, a partir da raiz:

```sh
cd backend
npm run test:migrate
npm test
```

Para executar somente uma das suítes ou gerar a cobertura, ainda dentro de `backend/`:

```sh
npm test -- --project unit
npm test -- --project integration
npm run test:coverage
```

O relatório HTML de cobertura é gerado em `backend/coverage/index.html`.

### Frontend: testes unitários e de integração

Os testes do frontend usam Vitest, React Testing Library e MSW. Não precisam do backend ou do banco em execução; as respostas HTTP são simuladas.

A partir da raiz:

```sh
cd frontend
npm test
```

Para executar as suítes separadamente, acompanhar alterações ou gerar a cobertura, dentro de `frontend/`:

```sh
npm test -- --project unit
npm test -- --project integration
npm run test:watch
npm run test:coverage
```

O relatório HTML de cobertura é gerado em `frontend/coverage/index.html`. As configurações de cobertura do frontend e do backend exigem no mínimo 90% de statements, branches, functions e lines.

### Testes de ponta a ponta (E2E)

O Playwright executa os testes no Chromium, com um worker, usando backend, frontend, PostgreSQL e Mailpit. O catálogo de jogos é preparado com dados de teste e respostas simuladas, permitindo usar uma chave fictícia da RAWG.

Crie `backend/.env.e2e` com a configuração local abaixo, ajustando a senha do banco:

```dotenv
DATABASE_URL="postgresql://questlog:questlog_local@localhost:5432/quest_log_e2e"
NODE_ENV=test
PORT_LOCAL=3000
FRONTEND_URL="http://localhost:5173"
JWT_SECRET="chave_ficticia_exclusiva_para_e2e_locais"
RAWG_API_KEY="chave_ficticia_para_e2e"
TRUST_PROXY_HOPS=0
EMAIL_PROVIDER=smtp
SMTP_HOST=127.0.0.1
SMTP_PORT=1025
SMTP_FROM="QuestLog E2E <noreply@questlog.test>"
```

Use exclusivamente o banco `quest_log_e2e`, pois a suíte cria e remove dados nesse ambiente e verifica o nome do banco antes de acessá-lo. Crie também `frontend/.env.e2e`:

```dotenv
VITE_API_URL="/api"
```

O Playwright configura o proxy local e a proteção de origem automaticamente. Encerre os servidores de desenvolvimento das portas `3000` e `5173` antes de executar a suíte: o Playwright inicia seus próprios processos e não reutiliza servidores existentes.

A partir da raiz, inicie os serviços, prepare o banco E2E e instale o navegador:

```sh
docker compose up -d
cd backend
npx dotenv -e .env.e2e -- prisma migrate deploy
cd ..
npx playwright install chromium
```

Na raiz, execute:

```sh
npx playwright test
```

O preparo inicial dos dados E2E é automático. Para acompanhar o navegador ou executar apenas um arquivo, use, respectivamente:

```sh
npx playwright test --headed
npx playwright test e2e/tests/library.spec.ts
```

Em falhas, screenshots e traces são salvos em `test-results/`. Para gerar e abrir um relatório HTML local:

```sh
npx playwright test --reporter=html
npx playwright show-report
```

### Verificações automatizadas

A CI no GitHub Actions executa a verificação de formatação, lint, checagem de tipos, builds, testes com cobertura e E2E. O job **Formatação** também executa os testes dos scripts de desenvolvimento da raiz. O job **Frontend** gera o build do Storybook para verificar se o catálogo compila. Os relatórios de cobertura e os resultados do Playwright são disponibilizados como artefatos das respectivas etapas.

Todos os jobs têm limites de tempo explícitos, com limites adicionais nas etapas de builds e testes. Um novo commit no mesmo PR cancela a execução anterior daquele PR. As execuções de push na `main` mantêm o acompanhamento dos deploys, com grupos separados para produção e sandbox.

## Licença

Este projeto está disponível sob a [licença MIT](LICENSE).
