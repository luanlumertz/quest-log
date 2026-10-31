import type { Meta, StoryObj } from "@storybook/react-vite";
import type { ComponentProps } from "react";
import { MemoryRouter, useLocation } from "react-router";
import { NowPlayingCard } from "../../../src/components/dashboard/NowPlayingCard";
import { demoLibraryEntry, demoPlatforms } from "../../fixtures/library";

function CardExample(args: ComponentProps<typeof NowPlayingCard>) {
    const location = useLocation();
    return (
        <div className="space-y-4">
            <div className="w-full max-w-sm">
                <NowPlayingCard {...args} />
            </div>
            <p role="status" className="text-sm text-ink-dim">
                Rota da demonstração: {location.pathname}
            </p>
        </div>
    );
}

const meta = {
    title: "Componentes/Dashboard/NowPlayingCard",
    component: NowPlayingCard,
    decorators: [
        (Story) => (
            <MemoryRouter initialEntries={["/dashboard-demo"]}>
                <Story />
            </MemoryRouter>
        ),
    ],
    render: (args) => <CardExample {...args} />,
    args: { entry: demoLibraryEntry },
    parameters: {
        docs: {
            description: {
                component:
                    "Cartão da seção Jogando agora. Recebe uma entrada completa da biblioteca; não filtra o status nem consulta dados sozinho. Exibe capa, status, título limitado a duas linhas, ano de lançamento, até três plataformas e +N para as demais. A linha de metadados é truncada quando não cabe. coverUrl=null usa a capa padrão local; não há recuperação automática para uma URL de imagem quebrada. Nota null mostra Sem nota, enquanto zero continua sendo uma avaliação. O tempo é recebido em minutos e exibido em horas com formatação pt-BR. O link aponta para /library/{game.id}, usando o ID interno. Neste catálogo, o destino fica no MemoryRouter e a capa ilustrativa reutiliza uma imagem local da aplicação, sem chamadas à API ou à RAWG.",
            },
        },
        controls: { include: ["entry", "tabIndex"] },
    },
    argTypes: {
        entry: {
            control: "object",
            description:
                "Entrada da biblioteca. Edite os campos do objeto para explorar título, capa, nota, status, tempo e plataformas.",
        },
        tabIndex: {
            control: "select",
            options: [0, -1],
            description:
                "Opcional. 0 mantém o link na ordem de Tab e -1 o retira dessa sequência, sem impedir clique ou foco programático. Sem definição, segue o comportamento nativo do link.",
        },
    },
} satisfies Meta<typeof NowPlayingCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Padrao: Story = { name: "Padrão" };
export const SemCapa: Story = {
    name: "Sem capa",
    args: { entry: { ...demoLibraryEntry, game: { ...demoLibraryEntry.game, coverUrl: null } } },
};
export const SemNota: Story = {
    name: "Sem nota",
    args: { entry: { ...demoLibraryEntry, rating: null } },
};
export const TituloLongo: Story = {
    name: "Título longo",
    args: {
        entry: {
            ...demoLibraryEntry,
            game: {
                ...demoLibraryEntry.game,
                title: "Uma jornada extraordinária por mundos distantes: edição completa com todas as expansões",
            },
        },
    },
};
export const MuitasPlataformas: Story = {
    name: "Mais de três plataformas",
    args: { entry: { ...demoLibraryEntry, platforms: demoPlatforms } },
};
export const SemMetadados: Story = {
    name: "Sem ano ou plataformas",
    args: {
        entry: {
            ...demoLibraryEntry,
            platforms: [],
            playtimeMinutes: 0,
            game: { ...demoLibraryEntry.game, releaseDate: null },
        },
    },
};
