import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";
import { RetryErrorState } from "../../../src/components/ui/RetryErrorState";

const meta = {
    title: "Componentes/UI/RetryErrorState",
    component: RetryErrorState,
    args: {
        title: "Não foi possível carregar os dados",
        isRetrying: false,
        onRetry: fn(),
    },
    parameters: {
        docs: {
            description: {
                component:
                    "Composição de StateView e Button para erros que permitem nova tentativa. Centraliza o ícone de erro, o tom danger e os textos Tentar novamente e Tentando.... Não consulta dados nem controla a tentativa: a tela fornece onRetry e atualiza isRetrying. Durante a tentativa, o botão fica desabilitado. Os cliques desta demonstração são registrados em Actions e não fazem chamadas à API.",
            },
        },
        controls: {
            include: ["title", "description", "isRetrying", "buttonVariant", "buttonSize"],
        },
    },
    argTypes: {
        title: { control: "text", description: "Título do erro." },
        description: {
            control: "text",
            description: "Descrição opcional; aceita ReactNode. O controle permite editar texto.",
            table: { defaultValue: { summary: "Tente novamente em alguns instantes." } },
        },
        isRetrying: {
            control: "boolean",
            description: "Indica uma tentativa em andamento e impede novos cliques.",
            table: { defaultValue: { summary: "false" } },
        },
        onRetry: {
            control: false,
            description:
                "Callback fornecido pela tela. O componente não escolhe qual consulta repetir.",
        },
        buttonVariant: {
            control: "select",
            options: ["primary", "secondary", "danger"],
            description: "Variante visual do botão.",
            table: { defaultValue: { summary: "primary" } },
        },
        buttonSize: {
            control: "select",
            options: ["sm", "md", "lg"],
            description: "Tamanho do botão.",
            table: { defaultValue: { summary: "md" } },
        },
        className: { table: { disable: true } },
    },
} satisfies Meta<typeof RetryErrorState>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Padrao: Story = { name: "Padrão" };
export const TentandoNovamente: Story = {
    name: "Tentativa em andamento",
    args: { isRetrying: true },
};
export const ErroParcial: Story = {
    name: "Erro parcial em uma seção",
    args: {
        title: "Não foi possível carregar os jogos em andamento",
        description: "O restante do Dashboard continua disponível.",
        className: "min-h-0! rounded-[20px] border border-divider bg-surface py-8",
        buttonVariant: "secondary",
        buttonSize: "sm",
    },
};
