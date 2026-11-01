import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";
import { AuthStepLayout } from "../../../src/components/auth/AuthStepLayout";
import { MATERIAL_ICON_NAMES } from "../../../src/components/ui/materialIcon.config";
import { AuthDemoContent } from "../../decorators/AuthDemo";

const meta = {
    title: "Componentes/Autenticação/AuthStepLayout",
    component: AuthStepLayout,
    args: {
        title: "Recupere seu acesso",
        description:
            "Conteúdo ilustrativo de uma etapa de autenticação. Informe um e-mail fictício para explorar o layout.",
        icon: "mail",
        onBack: fn(),
        children: <AuthDemoContent />,
    },
    parameters: {
        layout: "fullscreen",
        docs: {
            story: { inline: false, iframeHeight: 800 },
            description: {
                component:
                    "Composição de AuthLayout para etapas de cadastro e recuperação de senha. Acrescenta título, descrição, ícone e botão Voltar. No desktop (lg, a partir de 1024px), retorno e ícone aparecem acima do título; no mobile, o retorno é passado para mobileNavigation e aparece antes da marca, enquanto o ícone fica oculto. onBack define o comportamento: a story apenas registra o clique em Actions, sem alterar o histórico. description e children aceitam conteúdo React. Os exemplos usam um campo real e uma ação local para demonstrar composição e rolagem, sem executar recuperação de senha ou acessar a API. Cada exemplo é isolado em um iframe; redimensione o Canvas para comparar as larguras.",
            },
        },
    },
    argTypes: {
        title: { control: "text", description: "Título da etapa, renderizado como h1." },
        description: {
            control: "text",
            description: "Explicação da etapa; aceita ReactNode. O controle edita texto.",
        },
        icon: {
            control: "select",
            options: MATERIAL_ICON_NAMES,
            description: "Ícone decorativo do desktop; o padrão é mail.",
        },
        onBack: {
            control: false,
            description:
                "Ação de retorno fornecida pela tela, registrada em Actions neste catálogo.",
        },
        children: { control: false, description: "Formulário ou conteúdo da etapa." },
    },
} satisfies Meta<typeof AuthStepLayout>;

export default meta;
type Story = StoryObj<typeof meta>;
export const Padrao: Story = { name: "Padrão responsivo" };
export const DescricaoRica: Story = {
    name: "Descrição com destaque",
    args: {
        title: "Confira seus dados",
        description: (
            <p>
                Esta etapa usa o e-mail fictício{" "}
                <span className="mt-1 block break-all font-semibold text-ink">
                    jogador.com.nome.muito.longo@exemplo.com
                </span>
            </p>
        ),
    },
    parameters: { controls: { exclude: ["description"] } },
};
export const ConteudoLongo: Story = {
    name: "Conteúdo longo",
    args: { children: <AuthDemoContent long /> },
};
