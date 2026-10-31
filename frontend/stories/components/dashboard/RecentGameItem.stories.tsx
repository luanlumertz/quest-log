import type { Meta, StoryObj } from "@storybook/react-vite";
import type { ComponentProps } from "react";
import { MemoryRouter, useLocation } from "react-router";
import { RecentGameItem } from "../../../src/components/dashboard/RecentGameItem";
import { GAME_STATUSES } from "../../../src/types/game.types";
import { demoRecentGame, demoPlatforms } from "../../fixtures/library";

function ItemExample(args: ComponentProps<typeof RecentGameItem>) {
    const location = useLocation();
    return (
        <div className="space-y-4">
            <div className="w-full max-w-3xl px-2">
                <RecentGameItem {...args} />
            </div>
            <p role="status" className="text-sm text-ink-dim">
                Rota da demonstração: {location.pathname}
            </p>
        </div>
    );
}

const meta = {
    title: "Componentes/Dashboard/RecentGameItem",
    component: RecentGameItem,
    decorators: [
        (Story) => (
            <MemoryRouter initialEntries={["/dashboard-demo"]}>
                <Story />
            </MemoryRouter>
        ),
    ],
    render: (args) => <ItemExample {...args} />,
    args: demoRecentGame,
    parameters: {
        docs: {
            description: {
                component:
                    "Entrada da lista de jogos atualizados recentemente. Recebe dados já selecionados e ordenados pelo componente pai. O título pode quebrar linhas; coverUrl=null usa a capa padrão local. O tempo chega em minutos e é apresentado em horas. Em telas abaixo de sm (640px no tema atual), esconde plataformas, nota e data, mantendo título, status e tempo. A data usa UTC e formatação pt-BR; deve ser uma string de data válida. Nota null mostra Sem nota em telas maiores, diferente de uma avaliação zero. O link usa game.id interno. Os exemplos usam MemoryRouter e uma capa ilustrativa local, sem backend ou RAWG. Redimensione a janela ou use o controle de viewport para explorar o comportamento responsivo.",
            },
        },
    },
    argTypes: {
        game: {
            control: "object",
            description: "ID interno, título e URL da capa. null indica ausência de capa.",
        },
        platforms: {
            control: "object",
            description:
                "Plataformas selecionadas pelo usuário, com id e name. Ocultas em telas pequenas.",
        },
        status: {
            control: "select",
            options: GAME_STATUSES,
            description: "Status atual do jogo na biblioteca.",
        },
        rating: {
            control: { type: "number", min: 0, max: 5, step: 0.1 },
            description: "Nota de 0 a 5 ou null. O exemplo Sem nota demonstra o valor nulo.",
        },
        playtimeMinutes: {
            control: { type: "number", min: 0, step: 1 },
            description: "Tempo jogado em minutos inteiros não negativos.",
        },
        updatedAt: {
            control: "text",
            description:
                "Data válida da última atualização, normalmente ISO 8601. A exibição usa UTC.",
        },
    },
} satisfies Meta<typeof RecentGameItem>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Padrao: Story = { name: "Padrão" };
export const SemCapa: Story = {
    name: "Sem capa",
    args: { game: { ...demoRecentGame.game, coverUrl: null } },
};
export const SemNota: Story = { name: "Sem nota", args: { rating: null } };
export const TituloLongo: Story = {
    name: "Título longo",
    args: {
        game: {
            ...demoRecentGame.game,
            title: "Uma jornada extraordinária por mundos distantes: edição completa com todas as expansões",
        },
    },
};
export const MuitasPlataformas: Story = {
    name: "Muitas plataformas",
    args: { platforms: demoPlatforms },
};
export const SemPlataformas: Story = {
    name: "Sem plataformas e sem tempo jogado",
    args: { platforms: [], playtimeMinutes: 0 },
};
