import type { Meta, StoryObj } from "@storybook/react-vite";
import { MemoryRouter } from "react-router";
import { DashboardStats } from "../../../src/components/dashboard/DashboardStats";
import { DemoLocation } from "../../decorators/GameDemo";
import { demoDashboardStatusCounts, emptyDashboardStatusCounts } from "../../fixtures/dashboard";

const meta = {
    title: "Componentes/Dashboard/DashboardStats",
    component: DashboardStats,
    decorators: [
        (Story) => (
            <MemoryRouter initialEntries={["/dashboard-demo"]}>
                <Story />
            </MemoryRouter>
        ),
    ],
    render: (args) => (
        <>
            <DashboardStats {...args} />
            <DemoLocation />
        </>
    ),
    args: { totalGames: 8, byStatus: demoDashboardStatusCounts, totalPlaytime: "892,3 h" },
    parameters: {
        docs: {
            description: {
                component:
                    "Conjunto dos sete cartões: total de jogos, contagens dos cinco status e tempo jogado. Recebe valores prontos, sem somar contagens, formatar horas ou consultar dados. Ao editar os controles, mantenha totalGames igual à soma de byStatus. Sem byStatus, as contagens por status aparecem como zero. O grid usa subgrid para alinhar rótulos e valores: uma coluna abaixo de 320px; duas a partir de 320px, com o tempo ocupando a linha inteira; de 640px a 1279px, três cartões na primeira linha e quatro na segunda; a partir de 1280px, os sete ficam na mesma linha. Total de jogos leva à biblioteca e os cinco status aplicam seus filtros. Tempo jogado é informativo, sem link. Redimensione o Canvas para explorar a composição. A navegação permanece em memória, sem acessar a API.",
            },
        },
    },
    argTypes: {
        totalGames: {
            control: { type: "number", min: 0, step: 1 },
            description: "Quantidade total de jogos da biblioteca, coerente com byStatus.",
        },
        byStatus: {
            control: "object",
            description:
                "Contagens inteiras não negativas dos cinco status. Ausência usa zero em cada cartão.",
        },
        totalPlaytime: {
            control: "text",
            description:
                "Tempo já formatado, como 892,3 h. O componente recebe texto, não minutos.",
        },
    },
} satisfies Meta<typeof DashboardStats>;

export default meta;
type Story = StoryObj<typeof meta>;
export const ComJogos: Story = { name: "Com jogos" };
export const BibliotecaVazia: Story = {
    name: "Biblioteca vazia",
    args: { totalGames: 0, byStatus: emptyDashboardStatusCounts, totalPlaytime: "0 h" },
};
export const SemContagens: Story = {
    name: "Sem contagens por status",
    args: { totalGames: 0, byStatus: undefined, totalPlaytime: "0 h" },
};
export const ValoresLongos: Story = {
    name: "Valores longos",
    args: {
        totalGames: 123456,
        byStatus: {
            WANT_TO_PLAY: 100000,
            PLAYING: 20000,
            PAUSED: 3000,
            COMPLETED: 400,
            ABANDONED: 56,
        },
        totalPlaytime: "123.456,7 h",
    },
};
