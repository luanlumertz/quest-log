# 0002 — Sandbox público da API

[Índice das decisões](README.md)

**Situação:** em uso, documentada retrospectivamente.

## Contexto

O Swagger permite consultar a documentação e executar requisições. Algumas rotas criam ou alteram dados, e outras removem registros ou a própria conta autenticada.

Para demonstrar a API publicamente, essas operações precisam de um ambiente separado das contas e bibliotecas da aplicação principal. A demonstração também deve permitir experimentar autenticação, validações e persistência reais.

## Decisão

Disponibilizar o Swagger em uma instalação própria da API no Render, usando o mesmo código do backend e um banco Neon separado, chamado `quest_log_sandbox`. Essa instalação usa credenciais próprias e é identificada por `NODE_ENV=production` e `APP_ENV=sandbox`.

O navegador acessa a documentação e a API diretamente na origem do sandbox. O visitante cria e confirma uma conta nesse ambiente e faz login para executar as rotas protegidas. Autenticação, proteção CSRF e limites continuam ativos.

Registrar a atividade das contas e executar uma limpeza semanal das contas criadas há mais de 30 dias e sem atividade nesse período. A rotina valida o ambiente e o nome do banco conectado antes de excluir.

## Consequências

- As operações demonstram o comportamento real da API, incluindo gravação e exclusão de dados no sandbox.
- As contas da aplicação principal e do sandbox são independentes; o visitante se autentica no ambiente de demonstração.
- O isolamento depende de configurar corretamente conexões e credenciais de cada serviço. A identificação `APP_ENV` não substitui essa separação.
- A demonstração exige manutenção de outro serviço, outro banco, configuração de e-mail e acompanhamento dos deploys.
- O sandbox usa integrações reais de jogos e e-mail, sujeitas à disponibilidade e aos limites dos provedores.
- As contas de demonstração são temporárias. A limpeza limita sua retenção e remove os registros pessoais relacionados pelas cascatas do banco.

## Referências

- [Identificação dos ambientes](../../backend/src/lib/appEnvironment.ts) e [documentação OpenAPI](../../backend/src/openapi.ts).
- [Serviço de limpeza](../../backend/src/services/sandboxCleanup.service.ts) e [proteções da rotina](../../backend/src/lib/sandboxCleanup.ts).
- [Workflow semanal](../../.github/workflows/sandbox-cleanup.yml).
- [Arquitetura do sandbox](../architecture.md#sandbox-público) e [guia de deploy](../deployment.md).
