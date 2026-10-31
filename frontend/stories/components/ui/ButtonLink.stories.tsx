import type { Meta, StoryObj } from "@storybook/react-vite";
import { MemoryRouter, useLocation } from "react-router";
import { ButtonLink } from "../../../src/components/ui/Button";
import type { ComponentProps } from "react";

function LinkExample(args: ComponentProps<typeof ButtonLink>) {
    const location = useLocation();
    return (
        <div className="space-y-4">
            <ButtonLink {...args} />
            <p role="status" className="text-sm text-ink-dim">
                Rota da demonstração: {location.pathname}
            </p>
        </div>
    );
}

const meta = {
    title: "Componentes/UI/ButtonLink",
    component: ButtonLink,
    decorators: [
        (Story) => (
            <MemoryRouter initialEntries={["/inicio"]}>
                <Story />
            </MemoryRouter>
        ),
    ],
    render: (args) => <LinkExample {...args} />,
    args: {
        children: "Ir para a biblioteca",
        to: "/biblioteca-demo",
        variant: "primary",
        size: "md",
        fullWidth: false,
    },
    parameters: {
        docs: {
            description: {
                component:
                    "Link do React Router com a aparência do Button, exportado pelo mesmo arquivo. Use para navegação, enquanto Button executa ações. Exige um Router e não oferece isLoading ou disabled. Neste catálogo, MemoryRouter mantém a navegação somente em memória: o clique atualiza o caminho exibido, sem sair do Storybook ou abrir a aplicação.",
            },
        },
        controls: { include: ["children", "to", "variant", "size", "fullWidth"] },
    },
    argTypes: {
        children: { control: "text", description: "Conteúdo do link." },
        to: {
            control: "select",
            options: ["/biblioteca-demo", "/busca-demo"],
            description: "Destino no Router. O controle oferece rotas locais de demonstração.",
        },
        variant: {
            control: "select",
            options: ["primary", "secondary", "danger"],
            description: "Variante visual compartilhada com Button.",
            table: { defaultValue: { summary: "primary" } },
        },
        size: {
            control: "select",
            options: ["sm", "md", "lg"],
            description: "Tamanho compartilhado com Button.",
            table: { defaultValue: { summary: "md" } },
        },
        fullWidth: {
            control: "boolean",
            description: "Ocupa a largura disponível.",
            table: { defaultValue: { summary: "false" } },
        },
        className: { table: { disable: true } },
    },
} satisfies Meta<typeof ButtonLink>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primario: Story = { name: "Primário" };
export const Secundario: Story = { name: "Secundário", args: { variant: "secondary" } };
export const LarguraTotal: Story = { name: "Largura total", args: { fullWidth: true } };
