import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";
import { AuthLayout } from "../../../src/components/auth/AuthLayout";
import { BackButton } from "../../../src/components/ui/BackButton";
import { AuthDemoContent } from "../../decorators/AuthDemo";

const meta = {
    title: "Componentes/Autenticação/AuthLayout",
    component: AuthLayout,
    args: {
        children: (
            <>
                <h1 className="font-display text-3xl font-bold text-white">Acesse sua jornada</h1>
                <p className="mt-2 text-ink-dim">
                    Conteúdo ilustrativo para explorar o layout de autenticação.
                </p>
                <AuthDemoContent />
            </>
        ),
    },
    parameters: {
        layout: "fullscreen",
        docs: {
            story: { inline: false, iframeHeight: 760 },
            description: {
                component:
                    "Estrutura visual das telas de autenticação. A partir de lg (1024px), usa duas colunas na proporção 3:2, com imagem, marca e mensagem à esquerda; o painel de marca permanece visível durante a rolagem de conteúdo longo. Abaixo dessa largura, oculta o painel lateral, exibe a marca sobre o conteúdo e usa a imagem como fundo. mobileNavigation aparece somente abaixo de lg, antes da marca. children contém o formulário ou outro conteúdo, com largura máxima definida pelo layout. As stories usam um campo real e conteúdo ilustrativo; Experimentar ação mostra apenas uma mensagem local, sem autenticar, validar um fluxo completo ou consultar a API. Redimensione o Canvas para comparar as apresentações. Cada exemplo usa iframe próprio para isolar os IDs e a altura da janela.",
            },
        },
    },
    argTypes: {
        children: {
            control: false,
            description: "Conteúdo da área principal; não é criado pelo layout.",
        },
        mobileNavigation: {
            control: false,
            description: "Navegação opcional, exibida apenas abaixo de 1024px.",
        },
    },
} satisfies Meta<typeof AuthLayout>;

export default meta;
type Story = StoryObj<typeof meta>;
export const Padrao: Story = { name: "Padrão responsivo" };
export const ComNavegacaoMobile: Story = {
    name: "Com navegação mobile",
    args: { mobileNavigation: <BackButton onClick={fn()}>Voltar</BackButton> },
};
export const ConteudoLongo: Story = {
    name: "Conteúdo longo",
    args: {
        children: (
            <>
                <h1 className="font-display text-3xl font-bold text-white">
                    Uma etapa com mais conteúdo
                </h1>
                <AuthDemoContent long />
            </>
        ),
    },
};
