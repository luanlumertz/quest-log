import type { Meta, StoryObj } from "@storybook/react-vite";
import { Route, Routes } from "react-router";
import { AppLayout } from "../../../src/components/layout/AppLayout";
import {
    LayoutDemo,
    NavigationDemoPage,
    type NavigationDemoArgs,
} from "../../decorators/LayoutDemo";
import { DemoLocation } from "../../decorators/GameDemo";
import { demoProfileUser } from "../../fixtures/profile";
import { demoNavigationPaths, layoutViewports } from "../../fixtures/layout";
import { configureProfileLogout } from "../../mocks/profileMutation";

type AppLayoutArgs = NavigationDemoArgs & { longContent: boolean };

const meta = {
    title: "Componentes/Navegação/AppLayout",
    component: AppLayout,
    beforeEach: () => configureProfileLogout(),
    args: { user: demoProfileUser, initialPath: "/dashboard", longContent: false },
    render: (args) => (
        <LayoutDemo user={args.user} initialPath={args.initialPath}>
            <Routes>
                <Route element={<AppLayout />}>
                    <Route
                        path="*"
                        element={
                            <>
                                <NavigationDemoPage longContent={args.longContent} />
                                <DemoLocation />
                            </>
                        }
                    />
                </Route>
            </Routes>
        </LayoutDemo>
    ),
    parameters: {
        layout: "fullscreen",
        viewport: { options: layoutViewports },
        docs: {
            story: { inline: false, iframeHeight: 800 },
            description: {
                component:
                    "Composição completa da área autenticada: DesktopHeader, conteúdo das rotas em Outlet, atribuição da RAWG e MobileNavigation. O layout não verifica a sessão; essa responsabilidade pertence às rotas da aplicação. A partir de 1024px, mostra o cabeçalho desktop; abaixo disso, mostra a barra inferior. O conteúdo principal cresce para manter o rodapé no fim da tela quando há pouco conteúdo. No mobile, o rodapé reserva espaço acima da barra fixa; com conteúdo longo, acompanhe esse comportamento até o final da página. As rotas filhas deste exemplo são páginas ilustrativas, sem carregar dados ou renderizar as telas reais. Links de navegação funcionam em memória, incluindo filtros na query. O link RAWG é o link externo real de atribuição, aberto em outra aba. A sessão e o logout são fictícios. A story Responsivo permite mudar o tamanho pelo controle de viewport ou redimensionando o Canvas; os exemplos Mobile e Desktop usam presets fixos. Cada exemplo fica em iframe próprio.",
            },
        },
    },
    argTypes: {
        user: {
            control: "object",
            description:
                "Usuário fictício para a sessão e o menu. Alterar reinicia a demonstração.",
        },
        initialPath: {
            control: "select",
            options: demoNavigationPaths,
            description:
                "Destino inicial das rotas ilustrativas; não é uma propriedade de AppLayout.",
        },
        longContent: {
            control: "boolean",
            description: "Mostra conteúdo longo para conferir rolagem e espaço do rodapé.",
        },
    },
} satisfies Meta<AppLayoutArgs>;

export default meta;
type Story = StoryObj<typeof meta>;
export const Responsivo: Story = {};
export const Mobile: Story = { globals: { viewport: { value: "mobile", isRotated: false } } };
export const Desktop: Story = { globals: { viewport: { value: "desktop", isRotated: false } } };
export const ConteudoLongo: Story = { name: "Conteúdo longo", args: { longContent: true } };
export const BibliotecaFiltrada: Story = {
    name: "Biblioteca com filtro de status",
    args: { initialPath: "/library?status=PLAYING" },
};
