# Decisões técnicas

[Voltar ao índice dos guias](../README.md)

Estes registros explicam o contexto, as escolhas e as consequências de decisões de arquitetura já em uso no QuestLog. São registros retrospectivos; a numeração indica a ordem de documentação, sem representar a cronologia original da implementação.

| Registro                                                                      | Assunto                                                                               |
| ----------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| [0001 — Proxy da API e cookies](0001-proxy-api-e-cookies.md)                  | Comunicação pela mesma origem na produção e autenticação por cookies.                 |
| [0002 — Sandbox público da API](0002-sandbox-publico-da-api.md)               | Demonstração interativa com operações reais e dados separados da aplicação principal. |
| [0003 — Catálogo e biblioteca pessoal](0003-catalogo-e-biblioteca-pessoal.md) | Separação dos dados compartilhados do jogo e dos registros de cada usuário.           |
| [0004 — Storybook isolado](0004-storybook-isolado.md)                         | Componentes reais, stories em estrutura própria e operações simuladas.                |

## Como manter os registros

Cada arquivo reúne **contexto**, **decisão**, **consequências** e **referências**. Os guias técnicos concentram os comandos e detalhes operacionais; os registros apontam para eles e para a implementação.

Ao documentar uma nova decisão, descreva o problema e os efeitos que podem ser sustentados pelo projeto. Registre alternativas e razões históricas quando elas forem conhecidas. Se uma decisão for substituída, acrescente um novo registro e indique a relação entre os dois, preservando o contexto da escolha anterior.
