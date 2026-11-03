# Componentes e Storybook

[Voltar ao índice dos guias](../../docs/README.md) · [Arquitetura do frontend](architecture.md)

Os componentes do QuestLog ficam em `src/components/`, agrupados por responsabilidade. O Storybook apresenta esses mesmos componentes com dados fictícios, estados controlados e operações simuladas, permitindo explorar a interface sem iniciar a API ou o banco.

Este guia explica como organizar e manter componentes e exemplos. Para explorar o catálogo, comece por [ComecePorAqui.mdx](../stories/ComecePorAqui.mdx); os comandos de instalação e execução estão no [README](../../README.md#catálogo-de-componentes).

## Organização dos componentes

| Pasta em `src/components/` | Responsabilidade                                                                     | Exemplo documentado                                                                                                                                                                  |
| -------------------------- | ------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `ui/`                      | Elementos compartilhados, estados de interface e controles reutilizados entre áreas. | [Button](../src/components/ui/Button.tsx) e sua [story](../stories/components/ui/Button.stories.tsx).                                                                                |
| `auth/`                    | Campos, confirmação de código e layouts dos fluxos de acesso.                        | [VerificationCodeForm](../src/components/auth/VerificationCodeForm.tsx) e sua [story](../stories/components/auth/VerificationCodeForm.stories.tsx).                                  |
| `dashboard/`               | Estatísticas e composições da visão geral da biblioteca.                             | [NowPlaying](../src/components/dashboard/NowPlaying.tsx) e sua [story](../stories/components/dashboard/NowPlaying.stories.tsx).                                                      |
| `game/`                    | Busca, detalhes externos e adição à biblioteca, com subpastas próprias.              | [AddGameToLibraryModal](../src/components/game/add-game-modal/AddGameToLibraryModal.tsx) e sua [story](../stories/components/game/add-game-modal/AddGameToLibraryModal.stories.tsx). |
| `library/`                 | Listagem, filtros e edição dos registros pessoais.                                   | [LibraryGameDetailsForm](../src/components/library/details/LibraryGameDetailsForm.tsx) e sua [story](../stories/components/library/details/LibraryGameDetailsForm.stories.tsx).      |
| `profile/`                 | Edição da conta, senha, logout e confirmação de exclusão.                            | [AccountInformation](../src/components/profile/AccountInformation.tsx) e sua [story](../stories/components/profile/AccountInformation.stories.tsx).                                  |
| `layout/`                  | Cabeçalho, navegação mobile, menu de perfil e composição da área autenticada.        | [AppLayout](../src/components/layout/AppLayout.tsx) e sua [story](../stories/components/layout/AppLayout.stories.tsx).                                                               |

A pasta `ui/` inclui elementos ligados ao domínio que são compartilhados, como `GameStatusBadge` e `GameStatusSelector`. Componentes específicos de um fluxo ficam próximos dos demais componentes desse fluxo.

### Quando separar um componente

A separação deve ajudar a compreender ou reutilizar uma responsabilidade. Alguns exemplos do projeto:

- [StateView](../src/components/ui/StateView.tsx) reúne a apresentação de ícone, título, descrição e ação para diferentes estados de tela.
- [RetryErrorState](../src/components/ui/RetryErrorState.tsx) combina essa apresentação com uma ação de nova tentativa, padronizando um comportamento repetido.
- [SuccessAlert](../src/components/ui/SuccessAlert.tsx) acrescenta controle de visibilidade e temporizador ao alerta de sucesso.
- Os campos de edição da biblioteca dividem a apresentação, enquanto [useLibraryGameDetailsForm](../src/components/library/details/useLibraryGameDetailsForm.ts) coordena o formulário. Suas [regras](../src/components/library/details/libraryGameDetailsForm.rules.ts) e [conversões](../src/components/library/details/libraryGameDetailsForm.utils.ts) ficam no mesmo grupo.

Uma composição curta usada em apenas uma tela pode permanecer no pai. Em [Library.tsx](../src/pages/Library.tsx), por exemplo, os estados de biblioteca vazia e de filtro sem resultados são combinações locais de `StateView`, mensagens e ações.

A semelhança visual, sozinha, não exige uma abstração compartilhada. [SearchGameCard](../src/components/game/search/SearchGameCard.tsx) apresenta um resultado do catálogo externo, enquanto [LibraryGameCard](../src/components/library/list/LibraryGameCard.tsx) apresenta um registro pessoal, com status e outros dados. Ao avaliar uma extração, considere também os dados, a navegação e os comportamentos que realmente se repetem.

## Estrutura do catálogo

As stories ficam fora de `src/` e espelham o caminho dos componentes:

```text
frontend/
├── .storybook/
│   ├── main.ts
│   ├── preview.ts
│   └── DocsPage.tsx
├── src/
│   └── components/
│       ├── ui/Button.tsx
│       └── game/add-game-modal/AddGameToLibraryModal.tsx
└── stories/
    ├── ComecePorAqui.mdx
    ├── components/
    │   ├── ui/Button.stories.tsx
    │   └── game/add-game-modal/AddGameToLibraryModal.stories.tsx
    ├── fixtures/
    ├── decorators/
    └── mocks/
```

Os arquivos `.stories.tsx` importam a implementação real de `src/components/`. Quando um componente muda de pasta ou de interface, seus exemplos e imports também precisam acompanhar a alteração.

Os títulos do catálogo agrupam os exemplos pela área apresentada ao leitor: `Componentes/UI`, `Componentes/Autenticação`, `Componentes/Dashboard`, `Componentes/Jogos`, `Componentes/Biblioteca`, `Componentes/Perfil` e `Componentes/Navegação`. Por isso, o título visível pode usar português, enquanto o caminho físico mantém `auth/`, `game/` ou `layout/`.

### Configuração compartilhada

| Arquivo                                           | Responsabilidade                                                                                                                                                |
| ------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [main.ts](../.storybook/main.ts)                  | Define React com Vite, descobre stories e MDX, habilita a documentação, serve `public/` e carrega a fonte de ícones usada pelo catálogo.                        |
| [preview.ts](../.storybook/preview.ts)            | Importa os estilos reais, habilita `autodocs`, configura fundo, ordem de navegação e página de Docs e declara as simulações dos serviços de conta e biblioteca. |
| [DocsPage.tsx](../.storybook/DocsPage.tsx)        | Compõe título, descrição, exemplo principal, propriedades e demais stories, adaptando a documentação ao isolamento por iframe.                                  |
| [ComecePorAqui.mdx](../stories/ComecePorAqui.mdx) | Orienta a exploração do catálogo e explica dados fictícios, controles, responsividade e links do projeto.                                                       |

## O que uma story descreve

Uma story representa um estado ou uma interação relevante do componente: um botão carregando, um cartão sem capa, um formulário com erro ou uma navegação em tela pequena.

O padrão usa `Meta` e `StoryObj` de `@storybook/react-vite`, com `satisfies` para conferir a definição contra as propriedades do componente. Esta é uma versão reduzida da [story de Button](../stories/components/ui/Button.stories.tsx):

```tsx
import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";
import { Button } from "../../../src/components/ui/Button";

const meta = {
    title: "Componentes/UI/Button",
    component: Button,
    args: {
        children: "Salvar alterações",
        variant: "primary",
        onClick: fn(),
    },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primario: Story = {};
export const Carregando: Story = {
    args: { isLoading: true, loadingText: "Salvando…" },
};
```

O arquivo completo acrescenta descrições, controles e outros cenários. Cada parte tem uma função:

| Campo ou recurso | Uso                                                                                    |
| ---------------- | -------------------------------------------------------------------------------------- |
| `title`          | Caminho na navegação do catálogo.                                                      |
| `component`      | Implementação que está sendo documentada.                                              |
| `args`           | Propriedades iniciais compartilhadas ou específicas de um cenário.                     |
| `argTypes`       | Descrições das propriedades, opções e tipos de controles.                              |
| `parameters`     | Configurações de documentação, layout e cenários da demonstração.                      |
| `render`         | Composição necessária para experimentar o componente.                                  |
| `decorators`     | Ambiente visual ou providers que envolvem o exemplo.                                   |
| `beforeEach`     | Preparação do cenário, como configurar uma resposta simulada.                          |
| `play`           | Interações executadas ao carregar a story, como abrir uma edição e preencher um valor. |

## Controles e comportamento interativo

Use controles para propriedades que ajudem a explorar o componente: texto, variante, tamanho, nota ou objeto de dados. Callbacks como `onClick` e `onClose` podem usar `fn()` de `storybook/test` para registrar chamadas no painel **Actions**.

Um componente controlado também precisa receber o valor atualizado após uma interação. A story de [AddGameToLibraryModal](../stories/components/game/add-game-modal/AddGameToLibraryModal.stories.tsx) usa `useArgs` para abrir e fechar o modal, mantendo o valor de `isOpen` alinhado aos controles. Outros exemplos usam estado local para representar o componente pai.

Controles auxiliares devem ser identificados como parte da demonstração. Na story de [VerificationCodeForm](../stories/components/auth/VerificationCodeForm.stories.tsx), `waitSeconds` configura a espera inicial e não é uma propriedade do componente real. A story transforma esse valor no prazo recebido pelo formulário.

Os controles devem respeitar os valores aceitos. Em [RatingStars](../stories/components/ui/RatingStars.stories.tsx), por exemplo, a nota usa uma régua de 0 a 5 com passo de 0,1. A descrição também explica que o componente apenas exibe a nota; a edição pertence a outro controle.

### Docs, Canvas e isolamento

**Docs** reúne a explicação, a referência de propriedades e os exemplos. **Canvas** abre uma story isoladamente e permite explorar seus controles e ações.

Alguns componentes alteram foco, usam identificadores de campos, temporizadores ou contextos próprios. Esses exemplos configuram `docs.story.inline: false` e uma altura de iframe adequada. Isso mantém cada prévia em um documento separado e evita interferências entre exemplos mostrados na mesma página.

Na [página personalizada de Docs](../.storybook/DocsPage.tsx), exemplos isolados mostram uma tabela de propriedades com `ArgTypes` e o link **Canvas deste componente** para editar os controles. Nos exemplos renderizados diretamente em Docs, a página usa `Controls`, permitindo editar as propriedades ali mesmo.

O iframe isola o documento da prévia; o estado do React Query e da sessão também precisa ser criado pelos wrappers da demonstração quando necessário.

## Dados fictícios, providers e operações simuladas

### Fixtures

[stories/fixtures](../stories/fixtures) reúne jogos, plataformas, entradas da biblioteca, usuários e dados de navegação. Os objetos usam tipos reais do frontend; o exemplo de [biblioteca](../stories/fixtures/library.ts) também fornece uma capa ilustrativa de `public/images/`.

Crie os cenários a partir desses dados, copiando os objetos que serão modificados. Os exemplos atuais usam combinações como `{ ...demoLibraryEntry, rating: null }` para manter uma base comum e mostrar a diferença daquele estado. Títulos longos, listas vazias e campos opcionais ausentes ajudam a observar comportamentos que os dados padrão não mostram.

### Ambiente da demonstração

| Recurso                                               | Uso no catálogo                                                                                              |
| ----------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| `MemoryRouter`                                        | Navegação em memória para links e páginas ilustrativas. Alguns exemplos exibem a rota atual da demonstração. |
| [GameDemo](../stories/decorators/GameDemo.tsx)        | Router e `QueryClient` próprios, com repetição de consultas e mutações desabilitada.                         |
| [ProfileDemo](../stories/decorators/ProfileDemo.tsx)  | Usuário fictício, contexto de autenticação, cache e router próprios; simula o encerramento dessa sessão.     |
| [LayoutDemo](../stories/decorators/LayoutDemo.tsx)    | Compõe a sessão fictícia e o conteúdo ilustrativo usado pelos componentes de navegação.                      |
| [AuthDemoContent](../stories/decorators/AuthDemo.tsx) | Conteúdo de formulário e ação local para observar os layouts de autenticação.                                |

Os exemplos de navegação usam páginas ilustrativas para observar rota selecionada, filtros, rolagem e layout. Links externos, como a atribuição à RAWG, podem continuar abrindo seus destinos reais, conforme explicado na story.

### Simulações de serviços e callbacks

Há duas formas de simulação no catálogo:

1. **Componentes que recebem callbacks:** a story implementa o pai e fornece uma operação local. Em [LibraryGameDetailsForm](../stories/components/library/details/LibraryGameDetailsForm.stories.tsx), salvar atualiza uma entrada em memória; remover usa o modal real e altera somente a demonstração.
2. **Componentes que chamam hooks de dados:** a declaração `sb.mock` em `preview.ts` substitui os serviços usados pelo catálogo. As funções de [libraryMutation.ts](../stories/mocks/libraryMutation.ts) e [profileMutation.ts](../stories/mocks/profileMutation.ts) configuram sucesso, demora e falha, permitindo usar os hooks e formulários reais.

Configure o comportamento do serviço em `beforeEach` nos cenários que precisam dele, seguindo os exemplos de adição e perfil. A simulação deve retornar o formato esperado pelo componente ou lançar o erro necessário para observar o tratamento da interface.

Alguns parâmetros diferem da aplicação para facilitar a demonstração. No formulário de código, por exemplo, o reenvio bem-sucedido inicia uma espera de dez segundos no exemplo; os prazos reais da autenticação são definidos no backend. A descrição da story identifica essa diferença.

As operações simuladas ficam restritas ao catálogo e não alteram contas ou bibliotecas reais. Imagens, estilos e fontes ainda podem exigir carregamento de recursos pelo navegador; executar sem backend não significa que todos os recursos sejam disponíveis offline.

## Quais componentes e estados documentar

Priorize componentes com propriedades relevantes, reutilização, comportamento próprio ou estados que ajudem a compreender a interface. O catálogo atual inclui elementos de UI e composições de domínio, como carrossel, formulário de edição e layout da aplicação.

Uma composição pode demonstrar também os componentes que usa. A confirmação de exclusão da biblioteca, por exemplo, aparece no fluxo de `LibraryGameDetailsForm`. Uma story separada faz sentido quando há propriedades ou comportamentos próprios que ainda precisam ser apresentados.

Ao escolher cenários, considere os que existem naquele componente:

- Estado padrão e variações de apresentação.
- Dados opcionais ausentes, listas vazias, textos longos e muitas plataformas.
- Carregamento, bloqueio de ações, sucesso e falha com nova tentativa.
- Navegação, abertura e fechamento de modais e descarte de alterações.
- Comportamento responsivo e interação por teclado.

As stories de [AppLayout](../stories/components/layout/AppLayout.stories.tsx) têm presets de mobile e desktop definidos em [fixtures/layout.ts](../stories/fixtures/layout.ts). O cenário **Responsivo** permite variar livremente a largura. Nos modais, confira foco inicial, navegação por Tab, Escape, clique no fundo e bloqueio durante uma operação, conforme o comportamento de cada componente.

## Como manter os exemplos

Ao criar ou alterar um componente:

1. Confira os usos na aplicação e defina quais propriedades e comportamentos fazem parte da sua responsabilidade.
2. Crie ou atualize o arquivo em `stories/components/`, espelhando o caminho do componente. Componentes exportados do mesmo arquivo podem ter stories próprias, como `Button` e `ButtonLink`.
3. Reutilize fixtures e providers existentes. Acrescente suporte compartilhado quando ele servir a mais de um exemplo; uma composição específica pode ficar no próprio arquivo da story.
4. Atualize descrições, controles e cenários, incluindo diferenças intencionais entre a simulação e a aplicação.
5. Configure os serviços simulados ou callbacks locais necessários ao fluxo.
6. Confira em Docs e Canvas as interações, os tamanhos de tela e os estados que a mudança afeta.

Dentro de `frontend/`, as verificações disponíveis incluem:

```sh
npm run lint
npm run typecheck
npm run build-storybook
```

O [tsconfig do Storybook](../tsconfig.storybook.json) inclui a configuração e os arquivos TypeScript das stories, e está referenciado pelo projeto principal. O build do catálogo também verifica a compilação de MDX e dos exemplos para publicação; a saída vai para `storybook-static/`, ignorada pelo Git.

Na [CI](../../.github/workflows/ci.yml), lint, tipos e build do Storybook fazem parte do job existente do frontend. O build valida a geração do catálogo. A apresentação e as interações precisam ser conferidas no navegador; os testes automatizados de comportamento ficam nas suítes de componentes, integração e E2E descritas no [guia de testes](../../docs/testing.md).
