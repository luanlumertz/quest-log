# Desenvolvimento local

[Voltar ao índice dos guias](README.md) · [Arquitetura geral](architecture.md)

Este guia reúne a configuração e os comandos para desenvolver o QuestLog na sua máquina. A API, o frontend e o Storybook executam como processos Node.js; PostgreSQL, pgAdmin e Mailpit ficam no Docker Compose. Os comandos combinados são definidos no [package.json da raiz](../package.json) e em [scripts/dev.mjs](../scripts/dev.mjs).

## Pré-requisitos

- Node.js 24, versão utilizada na CI, e npm.
- Git.
- Docker instalado e em execução, com Docker Compose disponível.
- Uma chave da API da RAWG para buscar jogos e consultar seus detalhes na aplicação.

Os comandos não abrem o Docker Desktop automaticamente. O Storybook pode executar sozinho, sem Docker, API, conta ou chave da RAWG; veja a [execução independente](#storybook-independente).

## Primeiro uso

### 1. Clonar e instalar as ferramentas da raiz

```sh
git clone https://github.com/luanlumertz/quest-log.git
cd quest-log
npm ci
```

Execute os comandos desta seção a partir da raiz, salvo indicação de outra pasta. O repositório tem arquivos `package.json` e `package-lock.json` separados para raiz, backend e frontend.

O `npm ci` instala as dependências conforme o lockfile da pasta atual e exige que ele esteja consistente com o manifesto. Na raiz, instala as ferramentas compartilhadas, como Prettier, Husky, Playwright e o executor dos comandos combinados. As dependências das duas aplicações serão instaladas pelo `setup`. A instalação do navegador usado nos E2E faz parte do [preparo dos testes](testing.md#testes-de-ponta-a-ponta-e2e).

### 2. Configurar as variáveis de ambiente

No primeiro uso, copie os exemplos para os arquivos locais:

```sh
cp .env.example .env
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

Você também pode fazer as cópias pelo editor ou explorador de arquivos. Se já tiver arquivos `.env` configurados, compare as novas opções dos exemplos e preserve seus valores locais.

| Arquivo                                                               | Configuração                                                    |
| --------------------------------------------------------------------- | --------------------------------------------------------------- |
| [`.env.example`](../.env.example) → `.env`                            | Credenciais dos serviços do Docker Compose.                     |
| [`backend/.env.example`](../backend/.env.example) → `backend/.env`    | Conexão com o banco, autenticação, e-mail e integrações da API. |
| [`frontend/.env.example`](../frontend/.env.example) → `frontend/.env` | Endereço da API usado pelo frontend no desenvolvimento.         |

#### Docker Compose

No `.env` da raiz, preencha, por exemplo:

```dotenv
POSTGRES_PASSWORD=questlog_local
PGADMIN_EMAIL=admin@example.com
PGADMIN_PASSWORD=pgadmin_local
```

Esses valores são exemplos para o ambiente local. O usuário PostgreSQL `questlog` e o banco `quest_log` estão definidos no [compose.yaml](../compose.yaml).

#### Backend

No `backend/.env`, preencha:

```dotenv
DATABASE_URL="postgresql://questlog:questlog_local@localhost:5432/quest_log"
JWT_SECRET="substitua_por_um_segredo_aleatorio"
RAWG_API_KEY="sua_chave_da_rawg"
```

A senha em `DATABASE_URL` deve corresponder a `POSTGRES_PASSWORD` da raiz. Se ela contiver caracteres especiais, codifique-os para uso em uma URL. Para gerar o valor de `JWT_SECRET`:

```sh
node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"
```

Mantenha a configuração local do exemplo:

```dotenv
NODE_ENV=development
PORT_LOCAL=3000
FRONTEND_URL="http://localhost:5173"
TRUST_PROXY_HOPS=0
EMAIL_PROVIDER=smtp
SMTP_HOST=127.0.0.1
SMTP_PORT=1025
SMTP_FROM="QuestLog <noreply@questlog.local>"
```

`APP_ENV`, quando definido, deve ser `development`. `DIRECT_URL`, `ORIGIN_SECRET` e as credenciais da Brevo podem permanecer sem configuração nesse fluxo. O e-mail local usa SMTP com Mailpit.

Variáveis já definidas no terminal têm prioridade sobre as do `backend/.env`. Os comandos combinados e o preparo do banco exigem uma conexão local com `quest_log` na porta `5432`, conferindo também `DIRECT_URL` quando preenchida. Conexões de outros ambientes são recusadas por esses comandos.

#### Frontend e caminhos dos cookies

O exemplo do frontend usa a API diretamente:

```dotenv
VITE_API_URL="http://localhost:3000"
```

Nesse caso, mantenha `AUTH_COOKIE_PATH_PREFIX` sem definição ou vazio no backend.

Para usar a aplicação e o Swagger local pelo mesmo proxy do Vite, configure **no backend**:

```dotenv
AUTH_COOKIE_PATH_PREFIX=/api
```

E **no frontend**:

```dotenv
VITE_API_URL=/api
```

Essas duas opções precisam acompanhar o mesmo caminho: com cookies de renovação em `/api/auth`, as chamadas de refresh e logout também devem passar por `/api/auth`. Reinicie os servidores e faça login novamente depois de alterar essa configuração. O [guia de autenticação](../backend/docs/authentication.md#cookies-e-caminhos-por-ambiente) explica os caminhos de cada cookie.

Os arquivos `.env` são ignorados pelo Git. As chaves da RAWG e de autenticação ficam somente no backend; variáveis `VITE_*` são usadas pelo código do navegador.

### 3. Instalar as aplicações e preparar o banco

Com os arquivos de ambiente configurados e o Docker em execução, na raiz:

```sh
npm run setup
npm run db:prepare
```

O `setup` instala as dependências do backend e do frontend com `npm ci` e gera o Prisma Client. Ele depende das ferramentas da raiz já instaladas e não inicia a infraestrutura nem aplica migrations.

O `db:prepare` inicia PostgreSQL, pgAdmin e Mailpit pelo Compose, aguarda a infraestrutura conforme as condições do Compose e o healthcheck do PostgreSQL e aplica as migrations existentes com `prisma migrate deploy`. Gerar o cliente e aplicar migrations são etapas diferentes; o [guia do banco](../backend/docs/database.md#evolução-com-migrations) detalha esse fluxo.

Os volumes do Compose preservam os dados entre execuções. Os bancos `quest_log_test` e `quest_log_e2e` também são criados pelo [script de inicialização](../docker/postgres/init/01-create-test-db.sql) na primeira inicialização de um volume vazio. Esse script não é reaplicado em volumes já existentes.

### 4. Iniciar os servidores

Na raiz:

```sh
npm run dev
```

O comando confere as portas, inicia ou reutiliza a infraestrutura do Compose e executa backend e frontend no mesmo terminal. As dependências e migrations devem estar preparadas pelo passo anterior; `dev` não aplica migrations.

Para iniciar também o catálogo de componentes, use, em vez do comando anterior:

```sh
npm run dev:full
```

`dev:full` acrescenta o Storybook ao mesmo grupo. O terminal apresenta um resumo dos endereços locais.

| Serviço                    | Endereço padrão                                                    |
| -------------------------- | ------------------------------------------------------------------ |
| Aplicação                  | [http://localhost:5173/](http://localhost:5173/)                   |
| API                        | `http://localhost:3000`                                            |
| Healthcheck                | [http://localhost:3000/healthz](http://localhost:3000/healthz)     |
| Swagger pelo Vite          | [http://localhost:5173/api/docs/](http://localhost:5173/api/docs/) |
| Storybook, quando iniciado | [http://localhost:6006/](http://localhost:6006/)                   |
| Mailpit                    | [http://localhost:8025/](http://localhost:8025/)                   |
| pgAdmin                    | [http://localhost:5050/](http://localhost:5050/)                   |

O PostgreSQL usa `127.0.0.1:5432`, e o SMTP do Mailpit usa `127.0.0.1:1025`. A API prioriza `PORT` sobre `PORT_LOCAL`. Para o fluxo padrão com proxy, mantenha a porta `3000`: o [Vite](../frontend/vite.config.ts) encaminha para ela por padrão. Alterar apenas a porta da API não atualiza esse destino.

### 5. Criar uma conta e explorar

Cadastre-se na aplicação e consulte no Mailpit o código enviado por e-mail. Confirme o cadastro, faça login e busque jogos para montar a biblioteca. Essa busca usa a chave real da RAWG configurada no backend.

Para experimentar a API pelo Swagger, configure o proxy e os cookies conforme o [passo de ambiente](#frontend-e-caminhos-dos-cookies) e siga o **Comece por aqui** da documentação. As operações locais usam o banco configurado na API; o [sandbox público](../README.md#acesso-público-ao-swagger) possui contas e banco separados.

No pgAdmin, entre com `PGADMIN_EMAIL` e `PGADMIN_PASSWORD`. Ao cadastrar uma conexão, use host `postgres`, porta `5432`, banco `quest_log`, usuário `questlog` e a senha definida em `POSTGRES_PASSWORD`. O host é `postgres` porque o pgAdmin está na rede do Compose; os processos Node.js na sua máquina usam `localhost`.

## Comandos da raiz

| Comando                | Finalidade                                                                 |
| ---------------------- | -------------------------------------------------------------------------- |
| `npm ci`               | Instalar as ferramentas da raiz conforme seu lockfile.                     |
| `npm run setup`        | Instalar backend e frontend e gerar o Prisma Client.                       |
| `npm run db:prepare`   | Iniciar a infraestrutura e aplicar migrations no banco local.              |
| `npm run dev`          | Iniciar infraestrutura, backend e frontend.                                |
| `npm run dev:full`     | Iniciar o mesmo grupo com Storybook.                                       |
| `npm run storybook`    | Iniciar somente o catálogo com as dependências do frontend já instaladas.  |
| `npm run infra:up`     | Iniciar a infraestrutura e aguardar sua preparação.                        |
| `npm run infra:stop`   | Parar os containers do projeto, preservando os dados.                      |
| `npm run test:dev`     | Verificar os scripts locais com processos e conexões isolados, sem Docker. |
| `npm run format:check` | Conferir a formatação do repositório.                                      |
| `npm run format`       | Aplicar a formatação.                                                      |

Os scripts têm escopo conforme a pasta: `npm run dev` na raiz inicia o grupo, em `backend/` inicia somente a API, e em `frontend/` inicia somente o Vite.

## Executar cada parte separadamente

Após preparar dependências e banco, você pode usar terminais independentes. A infraestrutura deve estar em execução; para iniciá-la pela raiz:

```sh
npm run infra:up
```

| Parte     | Comando a partir da raiz        | Alternativa dentro da pasta          |
| --------- | ------------------------------- | ------------------------------------ |
| API       | `npm run dev --prefix backend`  | Em `backend/`: `npm run dev`.        |
| Frontend  | `npm run dev --prefix frontend` | Em `frontend/`: `npm run dev`.       |
| Storybook | `npm run storybook`             | Em `frontend/`: `npm run storybook`. |

Por exemplo, `cd backend` seguido de `npm run dev` equivale a usar `npm run dev --prefix backend` na raiz. Os comandos individuais das aplicações não iniciam Docker, não preparam o banco e não gerenciam os servidores dos outros terminais.

### Storybook independente

Para explorar somente os componentes, basta instalar as dependências do frontend e executar dentro de `frontend/`:

```sh
npm ci
npm run storybook
```

O catálogo usa dados fictícios e operações simuladas. Não precisa configurar os arquivos `.env` da aplicação, iniciar a infraestrutura ou fazer login. Os cenários estão descritos no [guia de componentes e Storybook](../frontend/docs/components.md).

## Rotina após o primeiro uso

- **Ao voltar a desenvolver:** execute `npm run dev` ou `npm run dev:full` com o Docker disponível.
- **Após receber alterações nas dependências:** atualize a instalação da raiz com `npm ci` quando necessário e execute `npm run setup` para reinstalar as aplicações e gerar o cliente.
- **Após receber novas migrations:** execute `npm run db:prepare` antes de usar a versão nova da API.
- **Após alterar os arquivos de ambiente:** reinicie os servidores. Mudanças nos caminhos dos cookies exigem novo login.

`setup` usa `npm ci` para instalar o que já está nos manifestos e lockfiles. Ao adicionar uma dependência ao projeto, use `npm install` na pasta responsável, atualizando e versionando seu manifesto e lockfile.

Os testes unitários, de integração e E2E usam configurações próprias; siga o [guia de execução dos testes](testing.md).

## Logs e encerramento

Os comandos combinados iniciam as ferramentas diretamente pelo Node, com menos anúncios de inicialização, mantendo avisos e erros. Vite e Storybook usam saída mais resumida, e a telemetria do Storybook fica desativada nessa execução. Os comandos individuais mantêm a saída normal dessas ferramentas.

Os logs da API usam pino-pretty no desenvolvimento, com horário, nível e mensagem. Produção e CI usam JSON. No Windows, a API recebe saída direta para contornar uma incompatibilidade do `tsx watch`; os demais servidores do grupo recebem os prefixos **WEB** e **STORYBOOK**.

Para encerrar `dev` ou `dev:full`, pressione `Ctrl+C` naquele terminal. Os servidores iniciados pelo grupo são encerrados, e essa interrupção intencional não é tratada como falha da aplicação. No Windows, o npm que abriu o comando ainda pode pedir uma confirmação de encerramento, dependendo do terminal.

Os containers permanecem em execução após encerrar os servidores. O aviso **A infraestrutura continua ligada** aparece somente se a consulta ao Docker encontrar containers do projeto rodando. Para pará-los, execute na raiz:

```sh
npm run infra:stop
```

`infra:stop` preserva os volumes e não encerra servidores Node.js. Se a aplicação continuar aberta, operações que usam banco ou SMTP podem falhar até a infraestrutura voltar. Processos de outros terminais são independentes, mas compartilham esses serviços.

Se a preparação da infraestrutura falhar, os servidores não começam. Se um comando do grupo encerrar depois da inicialização, os demais são encerrados pelo executor. Uma falha de requisição ou erro que mantenha o processo de observação aberto não encerra automaticamente o grupo.

## Problemas comuns

| Situação                                                    | O que conferir                                                                                                                                                                                                                      |
| ----------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Docker indisponível ou falha ao iniciar containers          | Confirme que o Docker está em execução e consulte `docker compose ps` e `docker compose logs` na raiz.                                                                                                                              |
| Porta ocupada                                               | Confira o endereço indicado na mensagem e encerre o servidor no terminal que o iniciou. O comando combinado recusa o conflito e preserva o processo existente; Vite e Storybook também exigem suas portas nos comandos individuais. |
| Conexão recusada pelas proteções locais                     | Confira `NODE_ENV`, `APP_ENV`, `DATABASE_URL` e `DIRECT_URL`, inclusive valores definidos no terminal. Os comandos locais de banco e execução exigem `quest_log` local na porta `5432`.                                             |
| Falha de senha no PostgreSQL após mudar o `.env`            | As credenciais iniciais são aplicadas na criação do volume. Alterar o arquivo não troca a senha do banco já existente; confira a senha usada nesse banco e mantenha a URL correspondente.                                           |
| Tabela ou coluna inexistente                                | Confira se as migrations recebidas foram aplicadas no banco local com `npm run db:prepare`.                                                                                                                                         |
| Prisma Client ausente ou incompatível com o schema recebido | Execute `npm run setup` para gerar o cliente atual e confira se as migrations também foram aplicadas.                                                                                                                               |
| Refresh ou logout sem o cookie esperado                     | Confira se o prefixo dos cookies e o endereço usado pelo frontend e pelo Swagger correspondem ao mesmo caminho. Reinicie e faça login após ajustar.                                                                                 |
| Falha na busca ou nos detalhes externos de jogos            | Confira `RAWG_API_KEY` no backend e a disponibilidade da integração. Os erros da operação aparecem na interface e nos logs da API.                                                                                                  |
| Código de confirmação não encontrado                        | Confira Mailpit em `http://localhost:8025`, `EMAIL_PROVIDER=smtp` e os valores SMTP do backend.                                                                                                                                     |

As operações de modelagem e criação de migrations estão no [guia do banco](../backend/docs/database.md), e os fluxos completos de cadastro, senha e sessão estão no [guia de autenticação](../backend/docs/authentication.md).
