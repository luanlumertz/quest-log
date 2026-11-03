import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";
import { RetryAlert } from "../../../src/components/ui/RetryAlert";

const meta = {
    title: "Componentes/UI/RetryAlert",
    component: RetryAlert,
    args: {
        children: "Não foi possível atualizar os dados desta seção.",
        isRetrying: false,
        onRetry: fn(),
    },
    parameters: {
        docs: {
            description: {
                component:
                    "Aviso compacto com botão Tentar novamente. Compõe Alert e Button para falhas parciais, mantendo o restante do conteúdo disponível. O pai fornece o conteúdo, executa onRetry e controla isRetrying; durante a tentativa o botão exibe Tentando... e impede novos cliques. Para erros que ocupam uma seção inteira, use RetryErrorState. Os exemplos registram cliques em Actions, sem acessar a API.",
            },
        },
    },
    argTypes: {
        children: {
            control: "text",
            description: "Mensagem ou conteúdo do aviso; aceita ReactNode.",
        },
        isRetrying: { control: "boolean", description: "Desabilita o botão durante a tentativa." },
        onRetry: { control: false, description: "Solicita nova tentativa ao pai." },
        className: { table: { disable: true } },
    },
} satisfies Meta<typeof RetryAlert>;

export default meta;
type Story = StoryObj<typeof meta>;
export const Padrao: Story = { name: "Padrão" };
export const TentandoNovamente: Story = {
    name: "Tentativa em andamento",
    args: { isRetrying: true },
};
export const ComDescricao: Story = {
    name: "Com descrição adicional",
    args: {
        children: (
            <>
                <p>Não foi possível verificar sua biblioteca.</p>
                <p className="mt-1 text-xs opacity-80">
                    Os resultados da busca continuam disponíveis normalmente.
                </p>
            </>
        ),
    },
    parameters: { controls: { exclude: ["children"] } },
};
