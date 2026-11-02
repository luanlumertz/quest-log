# Guias técnicos do QuestLog

Esta documentação explica a arquitetura, os fluxos e a manutenção do QuestLog. Para conhecer o projeto, suas funcionalidades e tecnologias, comece pelo [README principal](../README.md).

## Documentação disponível

| Assunto                                                | Onde consultar                                              |
| ------------------------------------------------------ | ----------------------------------------------------------- |
| Arquitetura, integrações e ambientes                   | [Arquitetura do QuestLog](architecture.md)                  |
| Modelo de dados, persistência e migrations             | [Banco de dados](../backend/docs/database.md)               |
| Cadastro, sessão e recuperação de acesso               | [Autenticação e sessão](../backend/docs/authentication.md)  |
| Eventos da API e investigação de falhas                | [Logs e investigação de falhas](../backend/docs/logging.md) |
| Organização, navegação e dados do frontend             | [Arquitetura do frontend](../frontend/docs/architecture.md) |
| Organização dos componentes, stories e simulações      | [Componentes e Storybook](../frontend/docs/components.md)   |
| Instalação, configuração e comandos locais             | [Desenvolvimento local](development.md)                     |
| Testes e verificações automatizadas                    | [Testes e verificações](testing.md)                         |
| Publicação, hospedagem e manutenção dos ambientes      | [Deploy e operação dos ambientes](deployment.md)            |
| Endpoints, parâmetros, respostas e autenticação da API | [OpenAPI e Swagger UI](../README.md#documentação-da-api)    |
| Componentes, propriedades e exemplos de interface      | [Storybook](../README.md#catálogo-de-componentes)           |

## Organização dos guias

Os guias são acrescentados por etapas. Os arquivos disponíveis aparecem como links; os demais caminhos indicam os próximos guias planejados.

| Local                                                               | Responsabilidade                                                                                               |
| ------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| [docs/architecture.md](architecture.md)                             | Visão do sistema, integrações, fluxo das requisições e diferenças entre desenvolvimento, produção e sandbox.   |
| [docs/development.md](development.md)                               | Preparação do ambiente local, variáveis, infraestrutura e comandos de desenvolvimento.                         |
| [docs/testing.md](testing.md)                                       | Suítes de testes, bancos isolados, simulações, cobertura e verificações na CI.                                 |
| [docs/deployment.md](deployment.md)                                 | Hospedagem, variáveis por ambiente, migrations, pipeline de deploy e manutenção do sandbox.                    |
| `docs/decisions/`                                                   | Registros de decisões técnicas que mereçam uma explicação própria, com contexto e consequências.               |
| [backend/docs/database.md](../backend/docs/database.md)             | Modelo de dados, relacionamentos, regras de persistência e migrations.                                         |
| [backend/docs/authentication.md](../backend/docs/authentication.md) | Cadastro, confirmação, sessão por cookies, renovação, recuperação de acesso e proteções das requisições.       |
| [backend/docs/logging.md](../backend/docs/logging.md)               | Configuração dos logs, níveis, identificação de requisições e consulta durante o desenvolvimento e a operação. |
| [frontend/docs/architecture.md](../frontend/docs/architecture.md)   | Organização da aplicação React, navegação, estado da sessão, consultas, mutações e comunicação com a API.      |
| [frontend/docs/components.md](../frontend/docs/components.md)       | Organização dos componentes e critérios para criar e manter stories, exemplos e simulações.                    |

Os futuros `backend/README.md` e `frontend/README.md` servirão como entradas rápidas para cada aplicação, encaminhando para os guias correspondentes. O README da raiz continuará apresentando o projeto e oferecendo um caminho rápido para executá-lo.

## Como manter a documentação

- Coloque assuntos que envolvem o sistema inteiro em `docs/`; mantenha detalhes específicos em `backend/docs/` ou `frontend/docs/`.
- Mantenha as instruções completas em um guia por assunto e use links nos demais arquivos para evitar cópias que possam ficar desatualizadas.
- Use Markdown para as explicações e Mermaid quando um diagrama ajudar a entender a arquitetura, os relacionamentos ou a sequência de um fluxo.
- Mantenha contratos de endpoints no OpenAPI e exemplos interativos de componentes no Storybook. Os guias explicam como essas partes se conectam.
- Documente o comportamento conferido no código e nas configurações. Identifique separadamente o que ainda depende de configuração externa ou publicação.
