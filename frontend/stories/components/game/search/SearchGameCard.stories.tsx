import type { Meta, StoryObj } from "@storybook/react-vite";
import type { ComponentProps } from "react";
import { MemoryRouter, useLocation } from "react-router";
import { SearchGameCard } from "../../../../src/components/game/search/SearchGameCard";
import { demoSearchGame } from "../../../fixtures/games";

function SearchCardExample(args: ComponentProps<typeof SearchGameCard>) {
    const location = useLocation();

    return (
        <div className="space-y-4">
            <div className="grid w-full max-w-60 grid-cols-1">
                <SearchGameCard {...args} />
            </div>
            <p role="status" className="text-sm text-ink-dim">
                Rota da demonstração: {location.pathname}
            </p>
        </div>
    );
}

const meta = {
    title: "Componentes/Jogos/Busca/SearchGameCard",
    component: SearchGameCard,
    decorators: [
        (Story) => (
            <MemoryRouter initialEntries={["/busca-demo"]}>
                <Story />
            </MemoryRouter>
        ),
    ],
    render: (args) => <SearchCardExample {...args} />,
    args: { game: { ...demoSearchGame, platforms: ["PC"] }, isInLibrary: false },
    parameters: {
        docs: {
            description: {
                component:
                    "Cartão de um resultado da busca de jogos. Recebe os dados prontos e não consulta a RAWG nem verifica a biblioteca. isInLibrary=true exibe Na biblioteca, sem impedir navegação. O link usa /games/{externalId}, com o ID da RAWG. Mostra capa, título em uma linha, ano de lançamento quando disponível e até dois nomes de plataformas; as demais são omitidas, sem contador. O atributo title permite consultar o título completo. coverUrl=null usa a imagem padrão local; uma URL quebrada não é substituída automaticamente. O contêiner da story mantém o grid usado na aplicação. As imagens são locais e ilustrativas; os destinos ficam no MemoryRouter, sem abrir a aplicação nem acessar a API.",
            },
        },
    },
    argTypes: {
        game: {
            control: "object",
            description:
                "Resultado da busca: externalId, título, capa, data de lançamento (normalmente YYYY-MM-DD ou null) e nomes das plataformas. Edite o objeto para explorar outros dados.",
        },
        isInLibrary: {
            control: "boolean",
            description:
                "Indicação fornecida pelo componente pai. true mostra Na biblioteca; false ou ausência não exibe a indicação.",
        },
    },
} satisfies Meta<typeof SearchGameCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Padrao: Story = { name: "Padrão" };
export const NaBiblioteca: Story = { name: "Já está na biblioteca", args: { isInLibrary: true } };
export const SemCapa: Story = {
    name: "Sem capa",
    args: { game: { ...demoSearchGame, coverUrl: null } },
};
export const SemData: Story = {
    name: "Sem data de lançamento",
    args: { game: { ...demoSearchGame, releaseDate: null } },
};
export const SemPlataformas: Story = {
    name: "Sem plataformas",
    args: { game: { ...demoSearchGame, platforms: [] } },
};
export const MuitasPlataformas: Story = {
    name: "Mais de duas plataformas",
    args: { game: demoSearchGame },
    parameters: {
        docs: {
            description: {
                story: "O exemplo fornece cinco plataformas, mas somente PC e PlayStation 5 são exibidas. O cartão não acrescenta +N para as plataformas restantes.",
            },
        },
    },
};
export const TituloLongo: Story = {
    name: "Título longo",
    args: {
        game: {
            ...demoSearchGame,
            title: "Uma jornada extraordinária por mundos distantes: edição completa com todas as expansões",
        },
    },
};
