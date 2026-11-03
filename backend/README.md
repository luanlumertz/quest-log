# Backend do QuestLog

[Apresentação do projeto](../README.md) · [Índice dos guias](../docs/README.md)

API REST em Node.js, Express e TypeScript para contas, autenticação, catálogo de jogos, bibliotecas pessoais e dashboard. Usa PostgreSQL com Prisma, Zod para validação e integrações com RAWG e envio de e-mail.

## Executar localmente

No primeiro uso, siga o [guia de desenvolvimento](../docs/development.md#primeiro-uso) para configurar os arquivos de ambiente, instalar as dependências, gerar o Prisma Client e aplicar as migrations.

Com o ambiente preparado e a infraestrutura em execução, dentro de `backend/`:

```sh
npm run dev
```

A API usa `http://localhost:3000` na configuração local de exemplo, com healthcheck em `/healthz`. Esse comando inicia somente o backend. Para iniciar a infraestrutura e as aplicações pelo mesmo terminal, use os [comandos da raiz](../docs/development.md#comandos-da-raiz).

## Documentação da API

- [Swagger público](https://questlog-sandbox.onrender.com/docs/): demonstração com API, banco e contas próprios do sandbox.
- [Swagger local](http://localhost:5173/api/docs/): exige backend e frontend em execução pelo fluxo do proxy Vite. Confira a [configuração dos cookies e do frontend](../docs/development.md#frontend-e-caminhos-dos-cookies).

As operações do Swagger alteram os dados do ambiente correspondente. Os contratos dos endpoints ficam no OpenAPI; os guias abaixo explicam os fluxos e a implementação.

## Guias do backend

| Assunto                                                      | Guia                                   |
| ------------------------------------------------------------ | -------------------------------------- |
| Modelo, relacionamentos, regras de persistência e migrations | [Banco de dados](docs/database.md)     |
| Cadastro, cookies, sessão, senha e proteções das requisições | [Autenticação](docs/authentication.md) |
| Eventos, níveis, identificação de requisições e investigação | [Logs](docs/logging.md)                |

A [arquitetura geral](../docs/architecture.md) apresenta as camadas da API e suas integrações. Consulte também os guias compartilhados de [testes](../docs/testing.md), [deploy](../docs/deployment.md) e [decisões técnicas](../docs/decisions/README.md).

## Comandos nesta pasta

Todos os comandos abaixo são executados em `backend/`:

| Comando                      | Finalidade                                               |
| ---------------------------- | -------------------------------------------------------- |
| `npm run dev`                | Iniciar a API com observação de alterações.              |
| `npm run lint`               | Executar ESLint.                                         |
| `npm run typecheck`          | Conferir os tipos da aplicação.                          |
| `npm run typecheck:tests`    | Conferir os tipos dos testes.                            |
| `npm run build`              | Compilar a API e copiar os assets para `dist/`.          |
| `npm start`                  | Iniciar a API compilada, após build e preparo do banco.  |
| `npm test`                   | Executar as suítes unitária e de integração.             |
| `npm test -- --project unit` | Executar somente os unitários.                           |
| `npm run test:coverage`      | Executar os testes com relatório e limites de cobertura. |

Os testes usam `backend/.env.test`, e a integração exige `quest_log_test` com suas migrations. O [guia de testes](../docs/testing.md#backend-testes-unitários-e-de-integração) contém a preparação e os comandos específicos. `npm run dev` e `npm start` não aplicam migrations automaticamente; essa preparação está nos guias de desenvolvimento e deploy.
