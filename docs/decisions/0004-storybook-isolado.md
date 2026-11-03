# 0004 — Storybook isolado da aplicação

[Índice das decisões](README.md)

**Situação:** em uso, documentada retrospectivamente. O [catálogo público](https://questlog-storybook.vercel.app/) é hospedado na Vercel em um projeto separado da aplicação.

## Contexto

O catálogo de componentes precisa permitir observar propriedades, estados e interações sem exigir cadastro, login ou preparação do backend. Alguns componentes dependem de navegação, contexto de sessão, React Query ou ações que alteram dados.

A organização das stories também precisa permitir localizar os exemplos de um componente mantendo os arquivos de documentação em uma estrutura própria.

## Decisão

Manter a configuração em `frontend/.storybook/` e os exemplos em `frontend/stories/components/`, espelhando o caminho dos componentes de `src/components/`. As stories importam as implementações reais.

Usar fixtures, wrappers com providers e serviços ou callbacks simulados para representar os estados. As simulações de conta e biblioteca são declaradas na configuração do catálogo; exemplos com formulários mantêm as validações reais e recebem o comportamento simulado necessário à demonstração.

Isolar em iframes as prévias que precisam separar foco, identificadores, temporizadores e estado. Nesses casos, a página de Docs apresenta a referência das propriedades e encaminha ao Canvas para os controles interativos.

## Consequências

- O catálogo pode executar sem API, banco, Docker ou uma sessão real. Suas operações alteram apenas os dados da demonstração.
- Os exemplos usam os componentes da aplicação, permitindo observar o efeito de mudanças na implementação real.
- A estrutura espelhada facilita localizar os exemplos, mas mudanças de caminhos e propriedades precisam ser acompanhadas nas stories.
- Fixtures, providers e simulações exigem manutenção para continuar representando estados coerentes com a aplicação.
- Diferenças intencionais, como tempos menores de espera, precisam ser explicadas na descrição do exemplo.
- A compilação do catálogo é verificada na CI. Os fluxos reais de autenticação e persistência continuam sendo conferidos nas suítes de integração e E2E.

## Referências

- [Descoberta dos exemplos](../../frontend/.storybook/main.ts) e [configuração compartilhada](../../frontend/.storybook/preview.ts).
- [Página de Docs](../../frontend/.storybook/DocsPage.tsx).
- [Fixtures](../../frontend/stories/fixtures), [providers da demonstração](../../frontend/stories/decorators) e [simulações](../../frontend/stories/mocks).
- [Guia de componentes e Storybook](../../frontend/docs/components.md) e [guia de testes](../testing.md).
