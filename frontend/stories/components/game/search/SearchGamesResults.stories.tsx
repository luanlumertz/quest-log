import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";
import { SearchGamesResults } from "../../../../src/components/game/search/SearchGamesResults";
import { demoSearchGame, demoSearchResults } from "../../../fixtures/games";
import { GameDemo, DemoLocation } from "../../../decorators/GameDemo";

const meta = {
    title: "Componentes/Jogos/Busca/SearchGamesResults",
    component: SearchGamesResults,
    decorators: [
        (Story) => (
            <GameDemo>
                <Story />
            </GameDemo>
        ),
    ],
    render: (args) => (
        <>
            <SearchGamesResults {...args} />
            <DemoLocation />
        </>
    ),
    args: {
        searchedQuery: "aventura",
        games: demoSearchResults,
        isLoading: false,
        isError: false,
        isFetching: false,
        onRetry: fn(),
        isLibraryError: false,
        isLibraryFetching: false,
        onRetryLibrary: fn(),
    },
    parameters: {
        docs: {
            description: {
                component:
                    "Organiza os estados da busca: sem termo, carregamento, erro, sem resultados e grid preenchido, nessa ordem. Uma falha ao verificar a biblioteca exibe aviso sem esconder os resultados. Recebe libraryExternalIds como Set de IDs da RAWG, e não IDs internos; esse conjunto só controla a indicação Na biblioteca. Não consulta dados nem pagina por conta própria. Os exemplos usam imagens locais, navegação em memória e callbacks registrados em Actions.",
            },
        },
    },
    argTypes: {
        searchedQuery: {
            control: "text",
            description: "Termo já pesquisado, separado do texto em edição no formulário.",
        },
        games: { control: "object", description: "Jogos da página atual." },
        isLoading: { control: "boolean", description: "Mostra o carregamento inicial." },
        isError: { control: "boolean", description: "Mostra o erro principal da busca." },
        isFetching: {
            control: "boolean",
            description: "Indica tentativa em andamento no erro da busca.",
        },
        isLibraryError: {
            control: "boolean",
            description: "Exibe aviso sobre a consulta da biblioteca, preservando o grid.",
        },
        isLibraryFetching: {
            control: "boolean",
            description: "Bloqueia o retry do aviso da biblioteca enquanto tenta novamente.",
        },
        libraryExternalIds: {
            control: false,
            description:
                "Set<number> opcional. O exemplo Com indicação de biblioteca fornece o conjunto; JSON comum não representa Set.",
        },
        onRetry: {
            control: false,
            description: "Repete a busca; a story apenas registra o evento.",
        },
        onRetryLibrary: {
            control: false,
            description: "Repete a consulta da biblioteca; a story apenas registra o evento.",
        },
    },
} satisfies Meta<typeof SearchGamesResults>;

export default meta;
type Story = StoryObj<typeof meta>;
export const Resultados: Story = {};
export const AntesDaBusca: Story = {
    name: "Antes da busca",
    args: { searchedQuery: "", games: [] },
};
export const Carregando: Story = { args: { isLoading: true, games: [] } };
export const ErroNaBusca: Story = { name: "Erro na busca", args: { isError: true } };
export const NovaTentativa: Story = {
    name: "Tentando buscar novamente",
    args: { isError: true, isFetching: true },
};
export const SemResultados: Story = { name: "Sem resultados", args: { games: [] } };
export const ComBiblioteca: Story = {
    name: "Com indicação de biblioteca",
    args: { libraryExternalIds: new Set([demoSearchGame.externalId]) },
};
export const FalhaNaBiblioteca: Story = {
    name: "Resultados com falha na biblioteca",
    args: { isLibraryError: true },
};
export const ConsultandoBiblioteca: Story = {
    name: "Tentando consultar a biblioteca",
    args: { isLibraryError: true, isLibraryFetching: true },
};
