import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";
import { Button } from "../../../src/components/ui/Button";

const meta = {
    title: "Componentes/UI/Button",
    component: Button,
    args: {
        children: "Salvar alterações",
        variant: "primary",
        size: "md",
        fullWidth: false,
        disabled: false,
        isLoading: false,
        loadingText: "Salvando…",
        type: "button",
        onClick: fn(),
    },
    parameters: {
        docs: {
            description: {
                component:
                    "Botão de ação do QuestLog. Use primary para a ação principal, secondary para ações de apoio e danger para ações destrutivas. Durante o carregamento, o botão fica desabilitado e recebe aria-busy. loadingText substitui o conteúdo somente quando isLoading está ativo e o texto não está vazio; sem ele, o conteúdo original permanece visível. O tipo padrão é button, evitando envio acidental de formulários. Para navegação, o projeto oferece ButtonLink no mesmo arquivo. Os cliques nesta demonstração são registrados no painel Actions e não salvam dados.",
            },
        },
        controls: {
            include: [
                "children",
                "variant",
                "size",
                "fullWidth",
                "disabled",
                "isLoading",
                "loadingText",
                "type",
            ],
        },
    },
    argTypes: {
        children: {
            control: "text",
            description:
                "Conteúdo do botão. O componente aceita ReactNode; neste catálogo, o controle permite editar o texto.",
        },
        variant: {
            control: "select",
            options: ["primary", "secondary", "danger"],
            description: "Aparência conforme a finalidade da ação.",
            table: { defaultValue: { summary: "primary" } },
        },
        size: {
            control: "select",
            options: ["sm", "md", "lg"],
            description: "Tamanho do botão.",
            table: { defaultValue: { summary: "md" } },
        },
        fullWidth: {
            control: "boolean",
            description: "Ocupa toda a largura disponível no contêiner.",
            table: { defaultValue: { summary: "false" } },
        },
        disabled: {
            control: "boolean",
            description:
                "Desabilita o botão. isLoading também o desabilita, mesmo com disabled=false.",
            table: { defaultValue: { summary: "false" } },
        },
        isLoading: {
            control: "boolean",
            description: "Ativa o estado ocupado e impede novos cliques. Não adiciona um spinner.",
            table: { defaultValue: { summary: "false" } },
        },
        loadingText: {
            control: "text",
            description: "Texto opcional durante o carregamento; sem texto, mantém children.",
        },
        type: {
            control: "select",
            options: ["button", "submit", "reset"],
            description: "Tipo HTML do botão. Esta demonstração não está dentro de um formulário.",
            table: { defaultValue: { summary: "button" } },
        },
        onClick: {
            control: false,
            description: "Evento de clique, registrado no painel Actions nesta demonstração.",
        },
        className: { table: { disable: true } },
    },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primario: Story = { name: "Primário" };

export const Secundario: Story = {
    name: "Secundário",
    args: { variant: "secondary", children: "Cancelar" },
};

export const Perigo: Story = {
    args: { variant: "danger", children: "Excluir jogo" },
};

export const Pequeno: Story = { args: { size: "sm" } };
export const Medio: Story = { name: "Médio", args: { size: "md" } };
export const Grande: Story = { args: { size: "lg" } };

export const Desabilitado: Story = { args: { disabled: true } };

export const Carregando: Story = { args: { isLoading: true } };

export const CarregandoSemTexto: Story = {
    name: "Carregando sem texto alternativo",
    args: { isLoading: true, loadingText: undefined },
    parameters: {
        docs: {
            description: {
                story: "Sem loadingText, o botão mantém seu conteúdo original e continua desabilitado, com aria-busy=true.",
            },
        },
    },
};

export const LarguraTotal: Story = {
    name: "Largura total",
    args: { fullWidth: true },
};
