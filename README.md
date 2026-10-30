# QuestLog

[![Ask DeepWiki](https://deepwiki.com/badge.svg)](https://deepwiki.com/luanlumertz/quest-log)

[Acesse o QuestLog](https://quest-log-omega-jade.vercel.app/)

O QuestLog é uma aplicação web para organizar sua biblioteca de jogos e acompanhar sua experiência com cada título. Registre o progresso, o tempo jogado, as datas de início e conclusão e suas avaliações, reunindo em um só lugar o histórico da sua jornada nos jogos.

O projeto nasceu da minha dificuldade em encontrar uma ferramenta que combinasse esses registros da forma como eu gostaria de usar. Desenvolvi o QuestLog para atender a uma necessidade própria e aproveitei essa oportunidade para aprofundar meus conhecimentos em desenvolvimento full stack, testes automatizados, Docker e pipelines de integração e entrega contínuas.

![Dashboard do QuestLog com estatísticas da biblioteca, jogos em andamento e atividades recentes](assets/screenshots/dashboard.png)

## Sumário

- [Funcionalidades](#funcionalidades)
- [Tecnologias](#tecnologias)
- [Arquitetura](#arquitetura)
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

### Backend

- **Node.js, Express e TypeScript:** desenvolvimento da API REST.
- **PostgreSQL e Prisma ORM:** persistência dos dados, consultas e migrations.
- **Zod:** validação dos dados recebidos pela API.
- **JSON Web Token (JWT) e bcryptjs:** autenticação e hash de senhas.
- **Helmet, CORS e express-rate-limit:** cabeçalhos de segurança, configuração de acesso entre origens e limitação de requisições.
- **Pino:** logs estruturados.
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

## Como executar localmente

### Pré-requisitos

- Node.js 24, versão utilizada na CI, e npm.
- Git.
- Docker com Docker Compose disponível.
- Uma chave da API da RAWG para buscar jogos e consultar seus detalhes.

### 1. Clonar o repositório e instalar as dependências

```sh
git clone https://github.com/luanlumertz/quest-log.git
cd quest-log
npm ci
npm ci --prefix backend
npm ci --prefix frontend
```

As dependências da raiz, do backend e do frontend são instaladas separadamente.

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

### 3. Iniciar os serviços locais

Na raiz do repositório, com o Docker em execução:

```sh
docker compose up -d
docker compose ps
```

Aguarde o PostgreSQL ficar saudável antes de aplicar as migrations. O Compose inicia o banco, o pgAdmin e o Mailpit; o backend e o frontend serão executados separadamente nos próximos passos.

### 4. Preparar o banco e iniciar o backend

Em um terminal, a partir da raiz:

```sh
cd backend
npx prisma generate
npx prisma migrate deploy
npm run dev
```

O comando `prisma generate` gera o Prisma Client, e `prisma migrate deploy` aplica as migrations existentes ao banco local. A API fica disponível em `http://localhost:3000`, com healthcheck em `http://localhost:3000/healthz`.

### 5. Iniciar o frontend

Em outro terminal, a partir da raiz:

```sh
cd frontend
npm run dev
```

Acesse `http://localhost:5173`. Mantenha essa porta disponível, pois ela está configurada como origem permitida no backend.

### 6. Criar uma conta e acessar a aplicação

Cadastre-se pela interface e abra o Mailpit em `http://localhost:8025` para consultar o código de verificação enviado por e-mail. Após verificar o cadastro, entre na aplicação e busque jogos para montar sua biblioteca.

O pgAdmin fica disponível em `http://localhost:5050`, com o e-mail e a senha definidos no `.env` da raiz. Para cadastrar a conexão com o banco nele, use o host `postgres`, a porta `5432`, o banco `quest_log`, o usuário `questlog` e a senha definida em `POSTGRES_PASSWORD`.

Para encerrar, interrompa o frontend e o backend com `Ctrl+C` nos respectivos terminais e execute, na raiz:

```sh
docker compose stop
```

Os dados são mantidos nos volumes do Docker. As credenciais iniciais do PostgreSQL são aplicadas na primeira criação do volume; alterar apenas o `.env` depois disso não altera a senha do banco existente.

## Como executar os testes

Instale as dependências e gere o Prisma Client conforme o guia de execução local. Os comandos abaixo indicam quando devem ser executados na raiz ou dentro de uma pasta específica.

Os bancos `quest_log_test` e `quest_log_e2e` são criados pelos scripts do Docker na primeira inicialização de um volume vazio; volumes anteriores à inclusão desses scripts precisam ter esses bancos criados separadamente.

Para as migrations de testes, deixe `DIRECT_URL` sem definição, inclusive no terminal, para que o Prisma use a `DATABASE_URL` do banco de testes correspondente. Execute os comandos em um terminal sem variáveis de conexão de outro ambiente, pois variáveis já definidas nele podem ter prioridade sobre os arquivos `.env`.

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

A CI no GitHub Actions executa a verificação de formatação, lint, checagem de tipos, builds, testes com cobertura e E2E. Os relatórios de cobertura e os resultados do Playwright são disponibilizados como artefatos das respectivas etapas.

## Licença

Este projeto está disponível sob a [licença MIT](LICENSE).
