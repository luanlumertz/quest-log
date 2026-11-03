import type { Meta, StoryObj } from "@storybook/react-vite";
import { MemoryRouter } from "react-router";
import { MobileNavigation } from "../../../src/components/layout/MobileNavigation";
import { NavigationDemoPage } from "../../decorators/LayoutDemo";
import { DemoLocation } from "../../decorators/GameDemo";
import { demoNavigationPaths, layoutViewports } from "../../fixtures/layout";

type MobileArgs = { initialPath: string; longContent: boolean };

const meta = {
    title: "Componentes/Navegação/MobileNavigation",
    component: MobileNavigation,
    args: { initialPath: "/dashboard", longContent: false },
    globals: { viewport: { value: "mobile", isRotated: false } },
    render: (args) => (
        <MemoryRouter key={args.initialPath} initialEntries={[args.initialPath]}>
            <div className="min-h-dvh bg-backdrop px-6 pb-24">
                <NavigationDemoPage longContent={args.longContent} />
                <DemoLocation />
            </div>
            <MobileNavigation />
        </MemoryRouter>
    ),
    parameters: {
        layout: "fullscreen",
        viewport: { options: layoutViewports },
        docs: {
            story: { inline: false, iframeHeight: 620 },
            description: {
                component:
                    "Barra inferior com Visão Geral, Biblioteca, Pesquisar e Perfil. Compartilha navigationItems com o cabeçalho e acrescenta o destino do perfil. Cada NavLink indica a rota ativa com aria-current=page e cor da marca; rotas filhas e filtros da biblioteca mantêm Biblioteca ativa. A barra fica fixa no rodapé e aparece somente abaixo de lg (1024px). O pai deve reservar espaço para que ela não cubra o fim do conteúdo; a demonstração faz essa reserva. No Canvas, os exemplos usam o preset mobile de 390px, exceto Oculta no desktop. Em Docs, vale a largura real de cada iframe. As páginas são ilustrativas, sem sessão, chamadas à API ou abertura das telas reais. initialPath e longContent são controles apenas da demonstração. Cada exemplo usa iframe próprio para conter a barra fixa.",
            },
        },
    },
    argTypes: {
        initialPath: {
            control: "select",
            options: demoNavigationPaths,
            description: "Rota inicial do exemplo. Alterar reinicia o MemoryRouter.",
        },
        longContent: {
            control: "boolean",
            description: "Acrescenta conteúdo para experimentar a rolagem e a barra fixa.",
        },
    },
} satisfies Meta<MobileArgs>;

export default meta;
type Story = StoryObj<typeof meta>;
export const VisaoGeral: Story = { name: "Visão Geral selecionada" };
export const Biblioteca: Story = {
    name: "Biblioteca selecionada",
    args: { initialPath: "/library" },
};
export const Pesquisa: Story = {
    name: "Pesquisa selecionada",
    args: { initialPath: "/games/search" },
};
export const Perfil: Story = { name: "Perfil selecionado", args: { initialPath: "/profile" } };
export const ConteudoLongo: Story = {
    name: "Barra fixa durante a rolagem",
    args: { longContent: true },
};
export const OcultaNoDesktop: Story = {
    name: "Oculta no desktop",
    globals: { viewport: { value: "desktop", isRotated: false } },
};
