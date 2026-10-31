import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";
import { BackButton } from "../../../src/components/ui/BackButton";

const meta = {
    title: "Componentes/UI/BackButton",
    component: BackButton,
    args: { children: "Voltar", onClick: fn() },
    parameters: {
        docs: {
            description: {
                component:
                    "Botão com seta de retorno, estados de foco e hover. Não navega por conta própria: o comportamento depende de onClick. Neste catálogo, o clique apenas registra o evento em Actions, sem alterar o histórico do navegador.",
            },
        },
    },
    argTypes: {
        children: {
            control: "text",
            description: "Conteúdo do botão. O controle permite editar o texto.",
        },
        onClick: {
            control: false,
            description:
                "Ação executada ao clicar; normalmente definida por quem controla a navegação.",
        },
    },
} satisfies Meta<typeof BackButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Padrao: Story = { name: "Padrão" };
export const TextoPersonalizado: Story = {
    name: "Texto personalizado",
    args: { children: "Voltar para a biblioteca" },
};
