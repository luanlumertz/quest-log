import type { Meta, StoryObj } from "@storybook/react-vite";
import { Alert } from "../../../src/components/ui/Alert";

const meta = {
    title: "Componentes/UI/Alert",
    component: Alert,
    args: { variant: "error", children: "Não foi possível salvar as alterações. Tente novamente." },
    parameters: {
        docs: {
            description: {
                component:
                    "Mensagem de erro ou sucesso com ícone e cor correspondentes. Erros usam role=alert; sucessos usam role=status. O componente não desaparece automaticamente e não tem botão de fechar. Aceita ReactNode em children; o controle de texto serve aos exemplos simples.",
            },
        },
        controls: { include: ["variant", "children"] },
    },
    argTypes: {
        variant: {
            control: "select",
            options: ["error", "success"],
            description: "Define a aparência, o ícone e o papel acessível da mensagem.",
            table: { defaultValue: { summary: "error" } },
        },
        children: {
            control: "text",
            description: "Conteúdo da mensagem: texto ou elementos React.",
        },
        className: { table: { disable: true } },
    },
} satisfies Meta<typeof Alert>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Erro: Story = {};
export const Sucesso: Story = {
    args: { variant: "success", children: "Alterações salvas com sucesso." },
};
export const ConteudoRico: Story = {
    name: "Conteúdo com formatação",
    args: {
        children: (
            <>
                <strong>Verifique os dados informados.</strong>
                <p>O e-mail deve ser válido e a senha não pode conter apenas espaços.</p>
            </>
        ),
    },
    parameters: { controls: { exclude: ["children"] } },
};
