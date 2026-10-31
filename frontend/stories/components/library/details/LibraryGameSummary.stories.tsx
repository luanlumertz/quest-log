import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";
import { LibraryGameSummary } from "../../../../src/components/library/details/LibraryGameSummary";
import { demoLibraryEntryDetails } from "../../../fixtures/library";

const meta = {
    title: "Componentes/Biblioteca/Detalhes/LibraryGameSummary",
    component: LibraryGameSummary,
    args: {
        entry: demoLibraryEntryDetails,
        developers: "FromSoftware",
        genres: "Ação, RPG",
        publishers: "Bandai Namco Entertainment",
        hasGameDetailsError: false,
        isGameDetailsFetching: false,
        onRetryGameDetails: fn(),
    },
    decorators: [
        (Story) => (
            <div className="mx-auto grid max-w-4xl lg:grid-cols-[190px_minmax(0,1fr)]">
                <Story />
            </div>
        ),
    ],
    parameters: {
        docs: {
            description: {
                component:
                    "Resumo com capa, desenvolvedor, gêneros, publicadora e data de adição. O pai prepara os textos dos metadados; o componente não usa a API. A data vem de entry.createdAt e é formatada em UTC. coverUrl=null usa a imagem padrão local. A disposição passa de coluna para linha em sm e volta à coluna em lg; a story reproduz a coluna lateral da página nessa largura. Um erro parcial mostra aviso e retry sem remover a capa ou os metadados. Imagens locais e callbacks registrados em Actions.",
            },
        },
    },
    argTypes: {
        entry: {
            control: "object",
            description: "Detalhes da entrada, incluindo game e createdAt válido.",
        },
        developers: { control: "text", description: "Desenvolvedores já formatados pelo pai." },
        genres: { control: "text", description: "Gêneros já formatados pelo pai." },
        publishers: { control: "text", description: "Publicadoras já formatadas pelo pai." },
        hasGameDetailsError: { control: "boolean", description: "Exibe o aviso de falha parcial." },
        isGameDetailsFetching: {
            control: "boolean",
            description: "Desabilita retry durante a consulta.",
        },
        onRetryGameDetails: {
            control: false,
            description: "Solicita nova consulta dos detalhes externos.",
        },
    },
} satisfies Meta<typeof LibraryGameSummary>;

export default meta;
type Story = StoryObj<typeof meta>;
export const Padrao: Story = { name: "Padrão" };
export const SemCapa: Story = {
    name: "Sem capa",
    args: {
        entry: {
            ...demoLibraryEntryDetails,
            game: { ...demoLibraryEntryDetails.game, coverUrl: null },
        },
    },
};
export const MetadadosAusentes: Story = {
    name: "Metadados ausentes",
    args: { developers: "Não informado", genres: "Não informado", publishers: "Não informado" },
};
export const ErroParcial: Story = {
    name: "Erro parcial",
    args: {
        hasGameDetailsError: true,
        developers: "Indisponível no momento",
        genres: "Indisponível no momento",
        publishers: "Indisponível no momento",
    },
};
export const TentandoNovamente: Story = {
    name: "Tentando novamente",
    args: { hasGameDetailsError: true, isGameDetailsFetching: true },
};
