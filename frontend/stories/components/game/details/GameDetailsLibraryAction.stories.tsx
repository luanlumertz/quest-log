import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";
import { GameDetailsLibraryAction } from "../../../../src/components/game/details/GameDetailsLibraryAction";
import { demoGameDetails } from "../../../fixtures/games";
import { demoLibraryEntry } from "../../../fixtures/library";
import { GameDemo, DemoLocation } from "../../../decorators/GameDemo";
import { configureLibraryMutation } from "../../../mocks/libraryMutation";

const meta = {
    title: "Componentes/Jogos/Detalhes/GameDetailsLibraryAction",
    component: GameDetailsLibraryAction,
    decorators: [
        (Story) => (
            <GameDemo>
                <Story />
            </GameDemo>
        ),
    ],
    beforeEach: () => configureLibraryMutation(),
    args: {
        game: demoGameDetails,
        isLibraryLoading: false,
        isLibraryError: false,
        isLibraryFetching: false,
        onRetryLibrary: fn(),
    },
    render: (args) => (
        <>
            <div className="flex flex-wrap items-center gap-3">
                <GameDetailsLibraryAction {...args} />
            </div>
            <DemoLocation />
        </>
    ),
    parameters: {
        docs: {
            story: { inline: false, iframeHeight: 700 },
            description: {
                component:
                    "Escolhe a ação conforme o estado informado pelo pai: verificando biblioteca, erro com retry, jogo já adicionado ou botão de adição. libraryEntry oferece o ID interno para o link e o status para o badge. Sem entrada, abre o modal real. A adição é simulada no serviço e fecha o modal; o componente pai precisaria atualizar libraryEntry para trocar o botão por Ver na minha biblioteca. O catálogo não mantém uma biblioteca real e usa navegação em memória.",
            },
        },
    },
    argTypes: {
        game: { control: "object", description: "Detalhes do jogo usados no modal." },
        libraryEntry: {
            control: "object",
            description: "Entrada já existente ou undefined quando ainda não adicionado.",
        },
        isLibraryLoading: {
            control: "boolean",
            description: "Mostra a verificação inicial, antes dos outros estados.",
        },
        isLibraryError: {
            control: "boolean",
            description: "Exibe erro com botão de tentar novamente.",
        },
        isLibraryFetching: {
            control: "boolean",
            description: "Desabilita o retry durante nova tentativa.",
        },
        onRetryLibrary: {
            control: false,
            description: "Solicita nova consulta. A story registra o clique em Actions.",
        },
    },
} satisfies Meta<typeof GameDetailsLibraryAction>;

export default meta;
type Story = StoryObj<typeof meta>;
export const Adicionar: Story = {};
export const JaAdicionado: Story = {
    name: "Já adicionado",
    args: { libraryEntry: demoLibraryEntry },
};
export const Verificando: Story = { args: { isLibraryLoading: true } };
export const ErroNaConsulta: Story = { name: "Erro na consulta", args: { isLibraryError: true } };
export const TentandoNovamente: Story = {
    name: "Tentando novamente",
    args: { isLibraryError: true, isLibraryFetching: true },
};
