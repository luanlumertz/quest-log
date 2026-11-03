import type { Meta, StoryObj } from "@storybook/react-vite";
import type { ComponentProps } from "react";
import { MemoryRouter, useLocation } from "react-router";
import { StatusBreakdown } from "../../../src/components/dashboard/StatusBreakdown";
import type { GameStatus } from "../../../src/types/game.types";

const emptyStatusCounts: Record<GameStatus, number> = {
    WANT_TO_PLAY: 0,
    PLAYING: 0,
    PAUSED: 0,
    COMPLETED: 0,
    ABANDONED: 0,
};

function BreakdownExample(args: ComponentProps<typeof StatusBreakdown>) {
    const location = useLocation();
    return (
        <div className="space-y-4">
            <div className="h-140 w-full max-w-sm">
                <StatusBreakdown {...args} />
            </div>
            <p role="status" className="text-sm text-ink-dim">
                Rota da demonstração: {location.pathname}
                {location.search}
            </p>
        </div>
    );
}

const meta = {
    title: "Componentes/Dashboard/StatusBreakdown",
    component: StatusBreakdown,
    decorators: [
        (Story) => (
            <MemoryRouter initialEntries={["/dashboard-demo"]}>
                <Story />
            </MemoryRouter>
        ),
    ],
    render: (args) => <BreakdownExample {...args} />,
    args: {
        totalGames: 8,
        byStatus: { WANT_TO_PLAY: 1, PLAYING: 4, PAUSED: 1, COMPLETED: 1, ABANDONED: 1 },
    },
    parameters: {
        docs: {
            description: {
                component:
                    "Resumo da biblioteca com gráfico de rosca e contagem dos cinco status. Recebe totais prontos; não consulta dados, recalcula o total ou valida a consistência entre as propriedades. Ao editar os controles, mantenha totalGames igual à soma de byStatus e use inteiros não negativos. Sem jogos, o gráfico fica neutro. Com pelo menos cinco jogos, o círculo cresce em telas lg. O centro leva à biblioteca completa e cada linha aplica o filtro de status. A demonstração fornece altura ao contêiner, como ocorre no dashboard, e mantém todos os destinos em memória, sem chamadas à API.",
            },
        },
    },
    argTypes: {
        totalGames: {
            control: { type: "number", min: 0, step: 1 },
            description: "Total de jogos. Deve corresponder à soma das contagens.",
            table: { defaultValue: { summary: "0" } },
        },
        byStatus: {
            control: "object",
            description:
                "Contagem por status. Ausência de dados resulta em contagens zero na legenda; use também totalGames=0 nesse caso.",
        },
    },
} satisfies Meta<typeof StatusBreakdown>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Distribuido: Story = { name: "Distribuição entre status" };
export const Vazio: Story = {
    name: "Biblioteca vazia",
    args: { totalGames: 0, byStatus: emptyStatusCounts },
};
export const StatusUnico: Story = {
    name: "Todos no mesmo status",
    args: { totalGames: 5, byStatus: { ...emptyStatusCounts, PLAYING: 5 } },
};
export const PoucosJogos: Story = {
    name: "Poucos jogos",
    args: {
        totalGames: 3,
        byStatus: { ...emptyStatusCounts, WANT_TO_PLAY: 1, PLAYING: 1, COMPLETED: 1 },
    },
};
