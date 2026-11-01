import type { Meta, StoryObj } from "@storybook/react-vite";
import { userEvent, within } from "storybook/test";
import { ProfileMenu } from "../../../src/components/layout/ProfileMenu";
import { LayoutDemo, type NavigationDemoArgs } from "../../decorators/LayoutDemo";
import { DemoLocation } from "../../decorators/GameDemo";
import { demoProfileUser } from "../../fixtures/profile";
import { demoNavigationPaths } from "../../fixtures/layout";
import { configureProfileLogout } from "../../mocks/profileMutation";

const meta = {
    title: "Componentes/Navegação/ProfileMenu",
    component: ProfileMenu,
    beforeEach: () => configureProfileLogout(),
    args: { user: demoProfileUser, initialPath: "/dashboard" },
    render: (args) => (
        <LayoutDemo {...args}>
            <div className="min-h-100 p-6">
                <div className="flex justify-end">
                    <ProfileMenu />
                </div>
                <div className="mt-10 max-w-xl">
                    <h1 className="font-display text-xl font-bold text-ink">Menu de perfil</h1>
                    <p className="mt-3 text-sm text-ink-dim">
                        Clique nesta área para experimentar o fechamento ao clicar fora do menu.
                    </p>
                    <DemoLocation />
                </div>
            </div>
        </LayoutDemo>
    ),
    parameters: {
        layout: "fullscreen",
        docs: {
            story: { inline: false, iframeHeight: 500 },
            description: {
                component:
                    "Menu do usuário com iniciais, nome truncado, acesso ao perfil e logout. Não recebe propriedades: lê user e signOut do contexto de autenticação. As iniciais usam a primeira e a última palavra do nome; com uma palavra, exibem apenas uma letra. O botão alterna aria-expanded. Perfil navega para /profile e fecha o menu; clique fora também fecha. Escape fecha e devolve o foco ao botão. Durante o logout, Sair mostra Saindo... e fica desabilitado; os outros controles mantêm seu comportamento normal. Falha preserva o menu aberto com aviso e permite nova tentativa. Os exemplos usam a sessão fictícia do catálogo e um serviço simulado. Sucesso mostra um resultado local com opção de reiniciar, sem encerrar sessões reais. user e initialPath são controles da demonstração; alterá-los reinicia o exemplo. Cada story usa iframe próprio para isolar o ID do menu, o foco e os efeitos no documento.",
            },
        },
    },
    argTypes: {
        user: {
            control: "object",
            description:
                "Usuário fictício fornecido ao contexto; não é uma propriedade de ProfileMenu.",
        },
        initialPath: {
            control: "select",
            options: demoNavigationPaths,
            description: "Rota inicial do MemoryRouter da demonstração.",
        },
    },
} satisfies Meta<NavigationDemoArgs>;

export default meta;
type Story = StoryObj<typeof meta>;
export const Fechado: Story = {};
export const Aberto: Story = {
    play: async ({ canvasElement }) => {
        await userEvent.click(
            within(canvasElement).getByRole("button", { name: /Jogador QuestLog/ }),
        );
    },
};
export const NomeCurto: Story = {
    name: "Nome com uma palavra",
    args: { user: { ...demoProfileUser, name: "Lia" } },
};
export const NomeLongo: Story = {
    name: "Nome longo",
    args: { user: { ...demoProfileUser, name: "Alexandre de Almeida e Oliveira da Silva" } },
};
export const SaidaDemorada: Story = {
    name: "Saída demorada",
    beforeEach: () => configureProfileLogout("slow"),
};
export const FalhaAoSair: Story = {
    name: "Falha ao sair",
    beforeEach: () => configureProfileLogout("error"),
};
