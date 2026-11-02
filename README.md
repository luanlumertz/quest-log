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
- [Guias técnicos](#guias-técnicos)
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

Consulte o [guia de arquitetura](docs/architecture.md) para conhecer as responsabilidades das camadas, os fluxos de requisições e as diferenças entre desenvolvimento, produção e sandbox.

## Documentação da API

A documentação usa **OpenAPI e Swagger UI** para apresentar endpoints, parâmetros, autenticação, respostas e modelos de dados (**Schemas**), além de permitir a execução de requisições pelo navegador. A seção **Comece por aqui** orienta o cadastro, a confirmação da conta e o login.

### Acesso público ao Swagger

[Explore e teste a API no Swagger](https://questlog-sandbox.onrender.com/docs/), sem instalar o projeto.

Os testes usam um **sandbox com API e banco próprios**, separado das contas e dos dados da aplicação principal. As operações são reais dentro desse ambiente: é possível criar, alterar e excluir seus dados de teste.

Para testar rotas protegidas, crie uma conta no sandbox pelas rotas de cadastro, confirme o código recebido por e-mail e faça login por `POST /auth/login`. O navegador gerencia os cookies automaticamente; não é necessário copiar tokens manualmente. Nas operações que exigem `X-QuestLog-Request`, mantenha o valor `true`. Se a sessão de acesso expirar, use `POST /auth/refresh` ou faça login novamente.

As contas do sandbox ficam elegíveis para exclusão automática após mais de **30 dias sem atividade**. O serviço pode demorar a responder no primeiro acesso após um período de inatividade.

### Acesso local ao Swagger

Siga o [guia de desenvolvimento](docs/development.md), incluindo a [configuração do frontend e dos cookies](docs/development.md#frontend-e-caminhos-dos-cookies), e mantenha backend e frontend em execução. Abra [http://localhost:5173/api/docs/](http://localhost:5173/api/docs/); o servidor `/api` usa o proxy local do Vite.

Use uma conta do ambiente local e consulte os códigos no [Mailpit](http://localhost:8025). As requisições são reais e usam o banco configurado no backend local. O [guia de autenticação](backend/docs/authentication.md#cookies-e-caminhos-por-ambiente) explica os caminhos dos cookies em cada ambiente.

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

## Guias técnicos

Consulte o [índice da documentação](docs/README.md) para encontrar as instruções disponíveis e acompanhar a organização dos guias de arquitetura, desenvolvimento, testes, deploy e detalhes do backend e do frontend.

## Como executar localmente

Você precisa de Node.js 24 com npm, Git, Docker com Compose em execução e uma chave da RAWG. O [guia de desenvolvimento local](docs/development.md) reúne a configuração completa, os comandos individuais e a resolução de problemas.

Clone o repositório e instale as ferramentas da raiz:

```sh
git clone https://github.com/luanlumertz/quest-log.git
cd quest-log
npm ci
```

Crie `.env`, `backend/.env` e `frontend/.env` a partir dos respectivos `.env.example`. Configure as credenciais locais do Docker, a conexão PostgreSQL, `JWT_SECRET` e `RAWG_API_KEY`, seguindo o [passo de configuração](docs/development.md#2-configurar-as-variáveis-de-ambiente). Para usar aplicação e Swagger juntos pelo Vite, esse passo também explica `VITE_API_URL=/api` e `AUTH_COOKIE_PATH_PREFIX=/api`.

Com os arquivos configurados, execute na raiz:

```sh
npm run setup
npm run db:prepare
npm run dev
```

Acesse a aplicação em [http://localhost:5173/](http://localhost:5173/). Cadastre-se e consulte o código de confirmação no [Mailpit](http://localhost:8025/). Para incluir o Storybook no grupo, use `npm run dev:full` no lugar de `npm run dev`.

Você também pode iniciar cada aplicação com `npm run dev` diretamente em `backend/` e `frontend/`, em terminais separados e com a infraestrutura disponível. Veja as [alternativas de execução](docs/development.md#executar-cada-parte-separadamente).

Para encerrar os servidores do grupo, use `Ctrl+C`; para parar a infraestrutura preservando os dados, execute `npm run infra:stop`. O [guia](docs/development.md#logs-e-encerramento) detalha o comportamento dos processos e containers.

## Como executar os testes

Instale as dependências e gere o Prisma Client conforme o [guia de desenvolvimento local](docs/development.md#primeiro-uso). Os comandos abaixo indicam quando devem ser executados na raiz ou dentro de uma pasta específica.

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
