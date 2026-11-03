# Frontend do QuestLog

[Apresentação do projeto](../README.md) · [Índice dos guias](../docs/README.md)

Aplicação React com TypeScript e Vite para organizar a biblioteca de jogos e acompanhar progresso, notas, tempo e datas. Usa Tailwind CSS na apresentação, React Router na navegação, TanStack Query nas consultas e React Hook Form com Zod nos formulários.

## Executar a aplicação

No primeiro uso, siga o [guia de desenvolvimento](../docs/development.md#primeiro-uso) para instalar as dependências e preparar o backend, a infraestrutura e os arquivos de ambiente.

Com esse ambiente preparado, dentro de `frontend/`:

```sh
npm run dev
```

A aplicação fica em [http://localhost:5173/](http://localhost:5173/). Esse comando inicia somente o Vite; as operações da aplicação dependem da API. Para iniciar infraestrutura, backend e frontend juntos, use os [comandos da raiz](../docs/development.md#comandos-da-raiz).

O endereço local da API e os caminhos dos cookies precisam estar alinhados. A [configuração do ambiente](../docs/development.md#frontend-e-caminhos-dos-cookies) explica o acesso direto e o uso do proxy `/api`, inclusive com Swagger local.

## Explorar o Storybook

Para explorar somente o catálogo, instale as dependências e execute dentro de `frontend/`:

```sh
npm ci
npm run storybook
```

Acesse [http://localhost:6006/](http://localhost:6006/). Os exemplos usam os componentes reais com dados fictícios e operações simuladas; não precisam de API, banco, Docker, arquivos `.env` ou login.

A página **Comece por aqui** orienta a navegação entre Docs, Canvas, Controls e Actions. As informações de acesso público ficam na [seção do Storybook no README principal](../README.md#catálogo-de-componentes).

## Guias do frontend

| Assunto                                                           | Guia                                            |
| ----------------------------------------------------------------- | ----------------------------------------------- |
| Pastas, rotas, estados, consultas, formulários e comunicação HTTP | [Arquitetura do frontend](docs/architecture.md) |
| Componentes, stories, controles, fixtures e simulações            | [Componentes e Storybook](docs/components.md)   |

Consulte também a [arquitetura geral](../docs/architecture.md), os [fluxos de autenticação](../backend/docs/authentication.md) e os guias compartilhados de [testes](../docs/testing.md), [deploy](../docs/deployment.md) e [decisões técnicas](../docs/decisions/README.md).

## Comandos nesta pasta

Todos os comandos abaixo são executados em `frontend/`:

| Comando                   | Finalidade                                               |
| ------------------------- | -------------------------------------------------------- |
| `npm run dev`             | Iniciar o servidor de desenvolvimento da aplicação.      |
| `npm run storybook`       | Iniciar o catálogo de componentes.                       |
| `npm run build-storybook` | Gerar o catálogo estático em `storybook-static/`.        |
| `npm run lint`            | Executar ESLint.                                         |
| `npm run typecheck`       | Conferir os tipos da aplicação, configuração e stories.  |
| `npm run typecheck:tests` | Conferir os tipos dos testes.                            |
| `npm run build`           | Conferir os tipos e gerar a aplicação em `dist/`.        |
| `npm test`                | Executar as suítes unitária e de integração.             |
| `npm run test:watch`      | Acompanhar alterações durante os testes.                 |
| `npm run test:coverage`   | Executar os testes com relatório e limites de cobertura. |

Os testes Vitest do frontend simulam o HTTP e executam sem backend ou banco. Os E2E usam outra preparação e são iniciados na raiz do repositório. Veja o [guia de testes](../docs/testing.md).
