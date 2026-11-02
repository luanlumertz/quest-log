# Testes e verificações

[Voltar ao índice dos guias](README.md) · [Desenvolvimento local](development.md)

O QuestLog usa testes em diferentes níveis: scripts de desenvolvimento, unidades de código, integração de componentes e serviços e fluxos completos no navegador. Este guia reúne o preparo dos ambientes, os comandos e as diferenças entre as suítes.

## Visão das suítes

| Suíte                  | Ferramentas e foco                                                                            | Dependências em execução                                                                    |
| ---------------------- | --------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| Scripts da raiz        | Test runner do Node.js; conexões permitidas, portas e encerramento dos processos.             | Processos e servidores temporários criados pelos testes; sem Docker ou banco.               |
| Unitários do backend   | Vitest; schemas, funções e serviços com dependências substituídas conforme o caso.            | Sem PostgreSQL em execução.                                                                 |
| Integração do backend  | Vitest e Supertest; requisições à aplicação Express e persistência real.                      | PostgreSQL com `quest_log_test`; RAWG e envio de e-mail simulados.                          |
| Unitários do frontend  | Vitest em Node.js; funções, schemas e configurações.                                          | Sem API, navegador ou banco em execução.                                                    |
| Integração do frontend | Vitest, JSDOM, React Testing Library e MSW; componentes, páginas e comunicação HTTP simulada. | Sem API ou banco; o DOM é simulado pelo JSDOM.                                              |
| E2E                    | Playwright e Chromium; navegação e fluxos completos, incluindo cookies e persistência.        | API, frontend, PostgreSQL com `quest_log_e2e` e Mailpit; catálogo preparado para os testes. |

Os projetos Vitest são definidos nas configurações do [backend](../backend/vitest.config.ts) e do [frontend](../frontend/vitest.config.ts). Os E2E têm uma [configuração na raiz](../playwright.config.ts).

## Preparação e isolamento

Instale as dependências e gere o Prisma Client conforme o [primeiro uso do ambiente local](development.md#primeiro-uso). Para testar somente o frontend, basta instalar suas dependências com `npm ci` dentro de `frontend/`.

Use arquivos dedicados: `backend/.env.test` para Vitest e `backend/.env.e2e` e `frontend/.env.e2e` para Playwright. Os exemplos abaixo usam credenciais fictícias e a senha local `questlog_local`; substitua essa senha pela do PostgreSQL do seu Docker.

| Banco            | Finalidade                                                    |
| ---------------- | ------------------------------------------------------------- |
| `quest_log`      | Desenvolvimento manual; não é o banco das suítes.             |
| `quest_log_test` | Integração do backend, que limpa os registros entre os casos. |
| `quest_log_e2e`  | E2E, com preparação de catálogo e contas próprias por teste.  |

Os dois bancos de testes são criados pelo [script do PostgreSQL](../docker/postgres/init/01-create-test-db.sql) na primeira inicialização de um volume vazio. Em um volume anterior à inclusão desse script, crie os bancos ausentes separadamente antes de aplicar suas migrations.

Execute o preparo em um terminal sem variáveis de conexão ou de ambiente de outra instalação. A [configuração do Prisma](../backend/prisma.config.ts) prioriza `DIRECT_URL` quando preenchida. Nos exemplos de teste, ela fica vazia para usar `DATABASE_URL` e evitar herdar uma conexão direta do `backend/.env`, que o Prisma também pode carregar. Uma variável já definida no terminal pode ter prioridade sobre o arquivo carregado pelo `dotenv-cli`.

`npm run db:prepare` prepara somente `quest_log` e recusa bancos de teste. Use os comandos específicos abaixo para as migrations das suítes.

## Scripts do ambiente local

Na raiz:

```sh
npm run test:dev
```

Os testes em [scripts/dev.test.mjs](../scripts/dev.test.mjs) verificam conexões permitidas, conflitos de portas e encerramento do grupo em caso de falha ou interrupção. Criam processos e servidores temporários próprios e os encerram ao concluir. Não precisam configurar `.env`, ligar o Docker ou acessar um banco.

## Backend: testes unitários e de integração

### Configuração

Crie `backend/.env.test`:

```dotenv
DATABASE_URL="postgresql://questlog:questlog_local@localhost:5432/quest_log_test"
DIRECT_URL=""
NODE_ENV=test
APP_ENV=test
JWT_SECRET="chave_ficticia_exclusiva_para_testes_locais"
RAWG_API_KEY="chave_ficticia_para_testes"
FRONTEND_URL="http://localhost:5173"
TRUST_PROXY_HOPS=0
```

Os scripts `test`, `test:coverage` e `test:migrate` do backend carregam esse arquivo com `dotenv-cli`. Mantenha `ORIGIN_SECRET` sem configuração no fluxo padrão dessa suíte. O teste de integração confere `DATABASE_URL` antes da limpeza: ela precisa indicar o banco `quest_log_test` em `localhost`, `127.0.0.1` ou `[::1]`.

Para integração, inicie a infraestrutura a partir da raiz:

```sh
npm run infra:up
```

Depois, entre em `backend/`, aplique as migrations de testes e execute:

```sh
cd backend
npm run test:migrate
npm test
```

Os testes usam a aplicação Express diretamente pelo Supertest; não é necessário iniciar `npm run dev` da API.

### Selecionar a suíte

Dentro de `backend/`:

```sh
npm test -- --project unit
npm test -- --project integration
```

Os unitários podem executar com a configuração de teste e o cliente gerado, sem banco em execução. Os de integração exigem PostgreSQL com as migrations aplicadas. Para executar um arquivo específico:

```sh
npm test -- --project integration tests/integration/auth/passwordChange.integration.test.ts
```

### Preparação e simulações

O [setup de integração](../backend/tests/integration/setup.ts) aguarda os trabalhos de e-mail agendados, reinicia contadores de requisições e remove os dados do banco de testes antes de cada caso. Os arquivos de integração executam sem paralelismo entre arquivos para compartilhar esse banco de forma controlada.

Os [mocks da RAWG](../backend/tests/mocks/rawg.mock.ts) e do [envio de e-mail](../backend/tests/mocks/mail.mock.ts) substituem as integrações externas. As requisições continuam passando por rotas, middlewares, controllers, serviços e Prisma. Os helpers, fixtures e chamadas Supertest ficam em [backend/tests](../backend/tests).

## Frontend: testes unitários e de integração

Os testes do frontend não precisam de backend, PostgreSQL ou Mailpit em execução. Com suas dependências instaladas, dentro de `frontend/`:

```sh
npm test
```

Para selecionar o projeto, acompanhar alterações ou executar apenas um arquivo:

```sh
npm test -- --project unit
npm test -- --project integration
npm run test:watch
npm test -- --project integration tests/integration/services/api.integration.test.ts
```

O projeto `unit` executa em Node.js, e `integration` usa JSDOM e o [setup compartilhado](../frontend/tests/integration/setup.ts). Esse setup carrega as asserções do jest-dom, inicia o MSW e limpa componentes renderizados, `sessionStorage` e handlers entre os casos.

O [servidor MSW](../frontend/tests/mocks/server.mock.ts) e os [helpers de resposta](../frontend/tests/mocks/api.mock.ts) simulam o HTTP usado pelo cliente real do frontend. As configurações de cache dos exemplos de teste podem usar [createTestQueryClient](../frontend/tests/helpers/createTestQueryClient.helper.ts), que desabilita repetições automáticas para controlar o cenário.

JSDOM permite testar estados e interações, mas não calcula o layout de um navegador real. As verificações visuais e responsivas podem ser exploradas no Storybook; os fluxos no navegador pertencem aos E2E.

## Cobertura

Dentro de `backend/` ou `frontend/`, execute:

```sh
npm run test:coverage
```

Cada configuração usa V8 e exige no mínimo **90%** nas quatro métricas: statements, branches, functions e lines. Uma suíte pode passar nos casos e ainda falhar no comando de cobertura se uma dessas métricas ficar abaixo do limite.

| Saída          | Backend                       | Frontend                       |
| -------------- | ----------------------------- | ------------------------------ |
| HTML navegável | `backend/coverage/index.html` | `frontend/coverage/index.html` |
| LCOV           | `backend/coverage/lcov.info`  | `frontend/coverage/lcov.info`  |
| Resumo         | Terminal.                     | Terminal.                      |

O backend mede `src/**/*.ts`, excluindo a entrada do servidor, o cliente Prisma gerado e os arquivos de OpenAPI. O frontend mede `src/**/*.{ts,tsx}`, excluindo `main.tsx` e `App.tsx`. Stories e configurações do catálogo ficam fora dessa seleção. Os testes dos scripts da raiz e os E2E são executados separadamente dessas métricas.

As pastas `coverage/` são ignoradas pelo Git. O relatório ajuda a localizar caminhos sem verificação; os novos casos devem confirmar regras e comportamentos relevantes.

## Testes de ponta a ponta (E2E)

### Configurar os arquivos

Crie `backend/.env.e2e`, ajustando a senha local:

```dotenv
DATABASE_URL="postgresql://questlog:questlog_local@localhost:5432/quest_log_e2e"
DIRECT_URL=""
NODE_ENV=test
APP_ENV=test
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

Crie também `frontend/.env.e2e`:

```dotenv
VITE_API_URL="/api"
```

O [iniciador do backend E2E](../e2e/scripts/start-backend.mts) carrega o arquivo dedicado, verifica a conexão real, ativa o modo de teste E2E e configura os cookies com prefixo `/api`. A configuração do Playwright fornece ao frontend e ao backend o segredo fictício do proxy. Os testes usam o mesmo caminho `/api` do navegador para login, refresh e demais chamadas.

O arquivo do backend E2E prevalece na inicialização desse processo. Já a aplicação de migrations abaixo usa `dotenv-cli` e segue a precedência de variáveis descrita em [preparação e isolamento](#preparação-e-isolamento).

### Preparar e executar

Encerre servidores de desenvolvimento nas portas `3000` e `5173`. O Playwright inicia seus próprios processos nessas portas e não reutiliza servidores existentes; não execute `dev` ou `dev:full` para preparar essa parte da suíte.

Com o Docker disponível, execute a partir da raiz:

```sh
npm run infra:up
cd backend
npx dotenv -e .env.e2e -- prisma migrate deploy
cd ..
npx playwright install chromium
npx playwright test
```

O navegador precisa ser instalado no primeiro uso e quando sua versão exigida pelo Playwright mudar. Em Linux, quando forem necessárias também as dependências do sistema, use `npx playwright install --with-deps chromium`, como na CI.

O [globalSetup](../e2e/global-setup.ts) prepara o jogo e suas plataformas antes da suíte. Não é necessário rodar o seed manualmente no fluxo normal.

Na raiz, para acompanhar o navegador ou executar um arquivo específico:

```sh
npx playwright test --headed
npx playwright test e2e/tests/library.spec.ts
```

### Dados e integrações

Os E2E usam um worker, sem paralelismo completo e sem repetição automática de testes. Cada teste recebe uma conta com e-mail único; a [fixture](../e2e/fixtures/test.fixture.ts) limpa os dados e as mensagens dessa conta ao terminar. Os helpers recusam operações de preparação e limpeza fora do padrão de e-mail E2E e verificam se a conexão real aponta para `quest_log_e2e`.

O catálogo combina [dados preparados no banco](../e2e/seeds/game.seed.ts) e [interceptação das consultas de busca e detalhes](../e2e/helpers/rawg.helper.ts) no navegador. Isso permite usar uma chave fictícia da RAWG sem depender do catálogo externo. Cadastro, login, alterações na biblioteca e demais fluxos usam a API real do ambiente E2E. Os e-mails são recebidos pelo Mailpit e consultados pelos helpers da suíte.

A fixture também fornece `X-E2E-Test-ID` para separar os contadores de login no modo E2E. Esse comportamento é condicionado ao ambiente de teste e ao banco E2E no [limitador](../backend/src/middlewares/rateLimit.middleware.ts); os limites de produção não usam essa identificação.

### Relatórios e investigação de falhas

Screenshots de falha e traces retidos em falhas ficam em `test-results/`. Para gerar e abrir um relatório HTML local, na raiz:

```sh
npx playwright test --reporter=html
npx playwright show-report
```

O primeiro comando executa a suíte novamente com o reporter HTML. Na CI, o relatório HTML já é gerado sem abrir o navegador. As pastas `test-results/` e `playwright-report/` são ignoradas pelo Git.

Ao investigar uma falha, confira a primeira asserção que falhou, o screenshot, o trace e os logs dos servidores. Prefira seletores por papel e nome acessível e condições que representem o estado esperado. Mensagens que permanecem no DOM durante animações precisam ser verificadas no estado correto, especialmente antes de recarregar a página ou navegar.

## Organização e manutenção dos testes

| Local                                                                                                                                                             | Conteúdo                                                                                     |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| [scripts/dev.test.mjs](../scripts/dev.test.mjs)                                                                                                                   | Testes do executor local com o test runner do Node.                                          |
| [backend/tests/unit](../backend/tests/unit)                                                                                                                       | Unidades do backend.                                                                         |
| [backend/tests/integration](../backend/tests/integration)                                                                                                         | Integração HTTP e banco do backend.                                                          |
| [backend/tests/fixtures](../backend/tests/fixtures), [helpers](../backend/tests/helpers), [mocks](../backend/tests/mocks) e [requests](../backend/tests/requests) | Dados de exemplo, operações de apoio, integrações substituídas e chamadas HTTP reutilizadas. |
| [frontend/tests/unit](../frontend/tests/unit) e [integration](../frontend/tests/integration)                                                                      | Unidades e integração do frontend.                                                           |
| [frontend/tests/fixtures](../frontend/tests/fixtures), [helpers](../frontend/tests/helpers) e [mocks](../frontend/tests/mocks)                                    | Dados, configurações de apoio e respostas simuladas.                                         |
| [e2e/tests](../e2e/tests)                                                                                                                                         | Fluxos completos, com fixtures, helpers e seeds nas pastas vizinhas.                         |

Antes de criar um helper ou mock, confira os existentes. Use unitários para regras isoladas, integração para conferir a colaboração entre as partes e E2E para os fluxos que dependem do navegador e da persistência. Faça as asserções sobre resultados e comportamentos observáveis, incluindo persistência quando ela fizer parte do cenário.

As stories documentam componentes e oferecem interações simuladas; seus arquivos não são selecionados pelas suítes Vitest atuais. A geração do Storybook é uma verificação de build da CI, e a manutenção dos exemplos está no [guia de componentes](../frontend/docs/components.md).

## Verificações locais e CI

Além dos testes, na raiz você pode executar `npm run format:check`. Dentro de `backend/` ou `frontend/`, os comandos `npm run lint`, `npm run typecheck`, `npm run typecheck:tests` e `npm run build` conferem aspectos diferentes do código. No frontend, `npm run build-storybook` gera também o catálogo. Executar Vitest não substitui essas verificações de tipos e build.

A [CI](../.github/workflows/ci.yml) executa em PRs para a `main` e em pushes nessa branch:

| Job        | Verificações principais                                                                                                 |
| ---------- | ----------------------------------------------------------------------------------------------------------------------- |
| Formatação | Prettier e testes dos scripts da raiz.                                                                                  |
| Backend    | Lint, tipos da aplicação e dos testes, build, migrations no banco de testes e cobertura.                                |
| Frontend   | Lint, tipos da aplicação e dos testes, builds da aplicação e do Storybook e cobertura.                                  |
| E2E        | Ambiente isolado com PostgreSQL e Mailpit, geração do cliente, tipos dos E2E, migrations, Chromium e testes Playwright. |

Cada job tem um limite de tempo, com limites adicionais nas etapas de build e testes. O Playwright tem um limite global de dez minutos na CI e rejeita testes marcados com `test.only`. Um novo commit no mesmo PR cancela a execução anterior desse PR; pushes na `main` preservam o acompanhamento dos deploys em grupos próprios.

Os artefatos `backend-coverage`, `frontend-coverage` e `e2e-report` ficam disponíveis na execução do GitHub Actions por sete dias, quando seus arquivos são produzidos. Os deploys do backend em produção e sandbox são acionados após os quatro jobs de validação em pushes na `main`.

## Problemas comuns

| Situação                                         | O que conferir                                                                                                  |
| ------------------------------------------------ | --------------------------------------------------------------------------------------------------------------- |
| Banco de teste não existe                        | Confira os bancos criados no volume local e o nome esperado pela suíte.                                         |
| Tabela ou coluna ausente                         | Aplique as migrations no banco daquela suíte; `db:prepare` prepara somente desenvolvimento.                     |
| Prisma usa uma conexão inesperada                | Confira `DIRECT_URL`, `DATABASE_URL`, arquivos carregados e variáveis do terminal antes de executar migrations. |
| Configuração de ambiente incompatível            | Confira `NODE_ENV=test` e `APP_ENV=test`, sem valores herdados de outra instalação.                             |
| E2E falha antes de abrir a página                | Confira PostgreSQL, Mailpit e as portas `3000` e `5173`, que devem estar livres para os servidores da suíte.    |
| Chromium não encontrado                          | Execute `npx playwright install chromium` na raiz.                                                              |
| Testes passam, mas a etapa de cobertura falha    | Consulte as quatro métricas e os arquivos no relatório da suíte correspondente.                                 |
| Teste do frontend não recebe a resposta esperada | Confira o handler MSW, o endereço da API usado no teste e a preparação dos providers.                           |

O preparo dos serviços locais e seu encerramento estão no [guia de desenvolvimento](development.md). A estrutura dos dados e os efeitos das exclusões estão no [guia do banco](../backend/docs/database.md).
