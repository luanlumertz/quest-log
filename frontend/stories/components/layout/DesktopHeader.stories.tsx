import type { Meta, StoryObj } from "@storybook/react-vite";
import { DesktopHeader } from "../../../src/components/layout/DesktopHeader";
import {
    LayoutDemo,
    NavigationDemoPage,
    type NavigationDemoArgs,
} from "../../decorators/LayoutDemo";
import { DemoLocation } from "../../decorators/GameDemo";
import { demoProfileUser } from "../../fixtures/profile";
import { demoNavigationPaths, layoutViewports } from "../../fixtures/layout";
import { configureProfileLogout } from "../../mocks/profileMutation";

const meta = {
    title: "Componentes/Navegação/DesktopHeader",
    component: DesktopHeader,
    beforeEach: () => configureProfileLogout(),
    args: { user: demoProfileUser, initialPath: "/dashboard" },
    globals: { viewport: { value: "desktop", isRotated: false } },
    render: (args) => (
        <LayoutDemo {...args}>
            <DesktopHeader />
            <div className="mx-auto max-w-6xl px-6">
                <NavigationDemoPage />
                <DemoLocation />
            </div>
        </LayoutDemo>
    ),
    parameters: {
        layout: "fullscreen",
        viewport: { options: layoutViewports },
        docs: {
            story: { inline: false, iframeHeight: 540 },
            description: {
                component:
                    "Cabeçalho desktop com marca, três destinos e ProfileMenu. Usa a configuração compartilhada navigationItems. Os NavLink indicam a rota ativa com aria-current=page e aparência destacada; a biblioteca também permanece ativa em suas rotas filhas e com filtros na query. Na rota /profile, nenhum dos três links principais fica ativo: o acesso ao perfil está no menu. O logo leva a /dashboard. O cabeçalho aparece a partir de lg (1024px) e fica oculto abaixo disso; não é fixo durante a rolagem. No Canvas, os exemplos começam no preset desktop de 1440px, exceto Oculto no mobile. Na página Docs, a visibilidade depende da largura efetiva do iframe. As rotas são mantidas em memória e a página abaixo é ilustrativa. O logout usa uma sessão fictícia, sem acessar a API.",
            },
        },
    },
    argTypes: {
        user: {
            control: "object",
            description:
                "Usuário fictício do contexto, utilizado pelo menu. Alterar reinicia o exemplo.",
        },
        initialPath: {
            control: "select",
            options: demoNavigationPaths,
            description:
                "Rota inicial do exemplo. Os cliques posteriores atualizam apenas o MemoryRouter.",
        },
    },
} satisfies Meta<NavigationDemoArgs>;

export default meta;
type Story = StoryObj<typeof meta>;
export const VisaoGeral: Story = { name: "Visão Geral selecionada" };
export const Biblioteca: Story = {
    name: "Biblioteca selecionada",
    args: { initialPath: "/library" },
};
export const Busca: Story = { name: "Busca selecionada", args: { initialPath: "/games/search" } };
export const Perfil: Story = { name: "Na página de perfil", args: { initialPath: "/profile" } };
export const OcultoNoMobile: Story = {
    name: "Oculto no mobile",
    globals: { viewport: { value: "mobile", isRotated: false } },
};
