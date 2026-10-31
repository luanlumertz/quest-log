import type { Meta, StoryObj } from "@storybook/react-vite";
import type { ComponentProps } from "react";
import { MemoryRouter, useLocation } from "react-router";
import { LibraryGameCard } from "../../../../src/components/library/list/LibraryGameCard";
import { demoLibraryEntry, demoPlatforms } from "../../../fixtures/library";

function LibraryCardExample(args: ComponentProps<typeof LibraryGameCard>) {
    const location = useLocation();

    return (
        <div className="space-y-4">
            <div className="grid w-full max-w-60 grid-cols-1">
                <LibraryGameCard {...args} />
            </div>
            <p role="status" className="text-sm text-ink-dim">
                Rota da demonstração: {location.pathname}
            </p>
        </div>
    );
}

const meta = {
    title: "Componentes/Biblioteca/Listagem/LibraryGameCard",
    component: LibraryGameCard,
    decorators: [
        (Story) => (
            <MemoryRouter initialEntries={["/biblioteca-demo"]}>
                <Story />
            </MemoryRouter>
        ),
    ],
    render: (args) => <LibraryCardExample {...args} />,
    args: { entry: demoLibraryEntry },
    parameters: {
        docs: {
            description: {
                component:
                    "Cartão da listagem da biblioteca. Recebe uma entrada completa e não consulta dados nem altera o jogo. O link usa /library/{game.id}, com o ID interno, diferente do externalId da RAWG. Mostra capa, status, título truncado com atributo title, tempo em horas e plataformas selecionadas. A nota usa uma estrela e uma casa decimal: rating=null omite a avaliação, enquanto zero aparece como 0.0. O tempo é recebido em minutos inteiros não negativos e formatado em pt-BR. PlatformBadges mede a largura disponível, exibe as plataformas que cabem e agrupa as demais em +N; o atributo title da área contém a lista completa. coverUrl=null usa a capa padrão local; URLs quebradas não são substituídas automaticamente. Os exemplos preservam o contêiner grid da aplicação, usam imagens locais ilustrativas e navegação em memória, sem chamadas à API.",
            },
        },
    },
    argTypes: {
        entry: {
            control: "object",
            description:
                "Entrada da biblioteca. Edite o objeto para variar jogo, status, rating (0 a 5 ou null), playtimeMinutes e plataformas com id e name.",
        },
    },
} satisfies Meta<typeof LibraryGameCard>;

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
export const NotaZero: Story = {
    name: "Nota zero",
    args: { entry: { ...demoLibraryEntry, rating: 0 } },
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
    name: "Plataformas com contador",
    args: { entry: { ...demoLibraryEntry, platforms: demoPlatforms } },
};
export const SemPlataformas: Story = {
    name: "Sem plataformas e sem tempo jogado",
    args: { entry: { ...demoLibraryEntry, platforms: [], playtimeMinutes: 0 } },
};
