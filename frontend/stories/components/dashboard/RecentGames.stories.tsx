import type { Meta, StoryObj } from "@storybook/react-vite";
import { MemoryRouter } from "react-router";
import { RecentGames } from "../../../src/components/dashboard/RecentGames";
import { DemoLocation } from "../../decorators/GameDemo";
import { demoRecentGames } from "../../fixtures/dashboard";

const meta = {
    title: "Componentes/Dashboard/RecentGames",
    component: RecentGames,
    decorators: [
        (Story) => (
            <MemoryRouter initialEntries={["/dashboard-demo"]}>
                <Story />
            </MemoryRouter>
        ),
    ],
    render: (args) => (
        <div className="w-full max-w-3xl">
            <RecentGames {...args} />
            <DemoLocation />
        </div>
    ),
    args: { games: demoRecentGames, totalGames: 8 },
    parameters: {
        docs: {
            description: {
                component:
                    "Seção de atividade recente que compõe RecentGameItem e os estados vazios. Recebe a lista já selecionada e ordenada pelo pai; não busca, filtra, limita nem ordena as entradas. Com itens, exibe Ver todos e os links dos jogos. Sem itens e com totalGames=0, mostra biblioteca vazia e a ação Procurar jogos. Sem itens e com totalGames>0, mostra Nenhuma atividade recente, sem ação. totalGames representa toda a biblioteca, não apenas os itens desta lista. Os cartões mantêm o comportamento responsivo de RecentGameItem: abaixo de 640px, plataformas, nota e data ficam ocultas. Redimensione o Canvas para comparar as apresentações. Todos os destinos são demonstrados em memória, com capas locais e sem acessar a API.",
            },
        },
    },
    argTypes: {
        games: {
            control: "object",
            description:
                "Atividades em ordem de exibição, com game.id únicos e updatedAt válido. O exemplo inclui entradas com e sem capa, sem nota e com nota zero.",
        },
        totalGames: {
            control: { type: "number", min: 0, step: 1 },
            description:
                "Total de jogos da biblioteca. Diferencia biblioteca vazia de ausência de atividade recente quando games está vazio.",
        },
    },
} satisfies Meta<typeof RecentGames>;

export default meta;
type Story = StoryObj<typeof meta>;
export const Preenchida: Story = {};
export const UmJogo: Story = {
    name: "Uma atividade",
    args: { games: demoRecentGames.slice(0, 1) },
};
export const BibliotecaVazia: Story = {
    name: "Biblioteca vazia",
    args: { games: [], totalGames: 0 },
};
export const SemAtividade: Story = {
    name: "Biblioteca com jogos, sem atividade recente",
    args: { games: [] },
};
