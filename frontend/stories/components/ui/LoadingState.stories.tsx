import type { Meta, StoryObj } from "@storybook/react-vite";
import { LoadingState } from "../../../src/components/ui/LoadingState";

const meta = {
    title: "Componentes/UI/LoadingState",
    component: LoadingState,
    parameters: {
        docs: {
            description: {
                component:
                    "Estado de carregamento com spinner decorativo e mensagem anunciada por role=status e aria-live=polite. Não consulta dados nem encerra o carregamento sozinho: quem o utiliza controla sua presença na tela.",
            },
        },
    },
    argTypes: {
        label: {
            control: "text",
            description: "Mensagem durante o carregamento.",
            table: { defaultValue: { summary: "Carregando..." } },
        },
        className: { table: { disable: true } },
    },
} satisfies Meta<typeof LoadingState>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Padrao: Story = { name: "Padrão" };
export const MensagemPersonalizada: Story = {
    name: "Mensagem personalizada",
    args: { label: "Buscando jogos da sua biblioteca..." },
};
