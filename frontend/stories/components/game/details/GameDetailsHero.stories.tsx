import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";
import { GameDetailsHero } from "../../../../src/components/game/details/GameDetailsHero";
import { DEFAULT_GAME_COVER_URL } from "../../../../src/config/game.config";
import { demoGameDetails } from "../../../fixtures/games";
import { demoLibraryEntry } from "../../../fixtures/library";
import { GameDemo, DemoLocation } from "../../../decorators/GameDemo";
import { configureLibraryMutation } from "../../../mocks/libraryMutation";

const meta = {
    title: "Componentes/Jogos/Detalhes/GameDetailsHero",
    component: GameDetailsHero,
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
        coverUrl: demoGameDetails.coverUrl,
        releaseYear: "2022",
        developers: "FromSoftware",
        isLibraryLoading: false,
        isLibraryError: false,
        isLibraryFetching: false,
        onRetryLibrary: fn(),
        onBack: fn(),
    },
    render: (args) => (
        <div className="overflow-x-clip px-4">
            <GameDetailsHero {...args} />
            <DemoLocation />
        </div>
    ),
    parameters: {
        layout: "fullscreen",
        docs: {
            story: { inline: false, iframeHeight: 760 },
            description: {
                component:
                    "Cabeçalho da página de detalhes com fundo de largura total, capa, título, gêneros, plataformas e ação de biblioteca. O pai prepara coverUrl, releaseYear e developers; o hero não calcula esses valores nem consulta a API. A capa lateral aparece a partir de md (768px), e o fundo permanece no celular. A URL padrão de capa deve ser fornecida pelo pai quando não houver imagem. O exemplo sem metadados também fornece o texto Não informado para o desenvolvedor. Usa o fluxo real de abertura do modal, com serviço de adição simulado e destinos em memória. Voltar e retry são registrados em Actions.",
            },
        },
    },
    argTypes: {
        game: {
            control: "object",
            description: "Título, gêneros, plataformas e dados para o modal.",
        },
        coverUrl: {
            control: "text",
            description: "URL já resolvida para a capa e o fundo. Não é nullable.",
        },
        releaseYear: { control: "text", description: "Ano opcional, já preparado pelo pai." },
        developers: {
            control: "text",
            description: "Texto de desenvolvedores pronto para exibição.",
        },
        libraryEntry: {
            control: "object",
            description: "Entrada existente ou undefined. Controla a ação da biblioteca.",
        },
        isLibraryLoading: {
            control: "boolean",
            description: "Estado inicial da consulta da biblioteca.",
        },
        isLibraryError: {
            control: "boolean",
            description: "Erro parcial: mantém os detalhes e oferece retry da biblioteca.",
        },
        isLibraryFetching: {
            control: "boolean",
            description: "Desabilita retry durante a consulta.",
        },
        onRetryLibrary: { control: false, description: "Solicita nova consulta da biblioteca." },
        onBack: { control: false, description: "Ação do botão Voltar para busca." },
    },
} satisfies Meta<typeof GameDetailsHero>;

export default meta;
type Story = StoryObj<typeof meta>;
export const Padrao: Story = { name: "Padrão" };
export const JaNaBiblioteca: Story = {
    name: "Já na biblioteca",
    args: { libraryEntry: demoLibraryEntry },
};
export const SemCapa: Story = {
    name: "Sem capa original",
    args: { coverUrl: DEFAULT_GAME_COVER_URL, game: { ...demoGameDetails, coverUrl: null } },
};
export const SemMetadados: Story = {
    name: "Sem metadados",
    args: {
        releaseYear: null,
        developers: "Não informado",
        game: { ...demoGameDetails, genres: [], platforms: [], developers: [] },
    },
};
export const TituloLongo: Story = {
    name: "Título longo",
    args: {
        game: {
            ...demoGameDetails,
            title: "Uma jornada extraordinária por mundos distantes: edição completa com todas as expansões",
        },
    },
};
export const ErroNaBiblioteca: Story = {
    name: "Erro parcial na biblioteca",
    args: { isLibraryError: true },
};
