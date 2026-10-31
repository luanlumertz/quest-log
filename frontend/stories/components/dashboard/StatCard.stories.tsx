import type { Meta, StoryObj } from "@storybook/react-vite";
import type { ComponentProps } from "react";
import { MemoryRouter, useLocation } from "react-router";
import { StatCard } from "../../../src/components/dashboard/StatCard";
import { GAME_STATUS_CONFIG } from "../../../src/config/gameStatus.config";

function StatCardExample(args: ComponentProps<typeof StatCard>) {
    const location = useLocation();

    return (
        <div className="space-y-4">
            <div className="grid w-full max-w-60 grid-cols-1 gap-y-4">
                <StatCard {...args} />
            </div>
            {args.to && (
                <p role="status" className="text-sm text-ink-dim">
                    Rota da demonstração: {location.pathname}
                    {location.search}
                </p>
            )}
        </div>
    );
}

const meta = {
    title: "Componentes/Dashboard/StatCard",
    component: StatCard,
    decorators: [
        (Story) => (
            <MemoryRouter initialEntries={["/dashboard-demo"]}>
                <Story />
            </MemoryRouter>
        ),
    ],
    render: (args) => <StatCardExample {...args} />,
    args: { label: "Total de jogos", content: 8, to: "/library" },
    parameters: {
        docs: {
            description: {
                component:
                    "Cartão de estatística do dashboard. Exibe label e content, que pode ser número ou texto já formatado. Não calcula totais nem formata horas. Com to, renderiza um Link do React Router e oferece hover e foco; sem destino, renderiza uma section informativa. color altera apenas a cor do valor, cujo padrão visual é a cor da marca. O layout usa subgrid para alinhar rótulo e valor entre cartões do dashboard; os exemplos preservam um contêiner grid e limitam a largura para facilitar a visualização isolada. A navegação é mantida em memória e não abre a aplicação nem consulta a API.",
            },
        },
        controls: { include: ["label", "content", "color", "to"] },
    },
    argTypes: {
        label: {
            control: "text",
            description:
                "Título da estatística, renderizado como h2 e apresentado em maiúsculas pelo CSS.",
        },
        content: {
            control: "text",
            description:
                "Valor numérico ou texto. O controle permite editar sua representação textual; o componente aceita string ou number.",
        },
        color: {
            control: "color",
            description: "Cor CSS opcional do valor. Sem definição, usa a cor da marca.",
        },
        to: {
            control: "select",
            options: ["", "/library", "/library?status=PLAYING", "/library?status=COMPLETED"],
            description:
                "Destino opcional. Escolha o valor vazio para um cartão sem link. Neste catálogo, as rotas funcionam apenas no MemoryRouter.",
        },
        className: { table: { disable: true } },
    },
} satisfies Meta<typeof StatCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const TotalDeJogos: Story = { name: "Total de jogos" };
export const PorStatus: Story = {
    name: "Contagem por status",
    args: {
        label: GAME_STATUS_CONFIG.PLAYING.label,
        content: 4,
        color: GAME_STATUS_CONFIG.PLAYING.color,
        to: "/library?status=PLAYING",
    },
};
export const SemJogos: Story = { name: "Sem jogos", args: { content: 0 } };
export const TempoJogado: Story = {
    name: "Tempo jogado sem link",
    args: { label: "Tempo jogado", content: "892,3 h", to: undefined },
};
export const ValorLongo: Story = {
    name: "Valor longo",
    args: { label: "Tempo jogado", content: "123.456,7 h", to: undefined },
    parameters: {
        docs: {
            description: {
                story: "Demonstra a quebra de valores longos na largura disponível. O texto é fornecido pronto pela story; não há cálculo ou formatação dentro do cartão.",
            },
        },
    },
};
