import type { Meta, StoryObj } from "@storybook/react-vite";
import { useArgs } from "storybook/preview-api";
import { fn } from "storybook/test";
import { LibraryFilters } from "../../../../src/components/library/list/LibraryFilters";
import { GAME_STATUSES } from "../../../../src/types/game.types";

const meta = {
    title: "Componentes/Biblioteca/Listagem/LibraryFilters",
    component: LibraryFilters,
    args: {
        search: "",
        counts: { all: 8, WANT_TO_PLAY: 1, PLAYING: 4, PAUSED: 1, COMPLETED: 1, ABANDONED: 1 },
        onSearchChange: fn(),
        onStatusChange: fn(),
    },
    render: function Render(args) {
        const [, updateArgs] = useArgs();
        return (
            <LibraryFilters
                {...args}
                onSearchChange={(search) => {
                    args.onSearchChange(search);
                    updateArgs({ search });
                }}
                onStatusChange={(status) => {
                    args.onStatusChange(status);
                    updateArgs({ status });
                }}
            />
        );
    },
    parameters: {
        docs: {
            description: {
                component:
                    "Filtros controlados por título e status. Todos corresponde a status=undefined; o botão selecionado usa aria-pressed. counts fornece contagens da biblioteca inteira, não do resultado filtrado; sem counts, os números ficam ocultos. O componente não aplica debounce, altera a URL ou consulta dados: essas responsabilidades ficam na página Library. As stories sincronizam os controles e registram as mudanças em Actions. A disposição muda a partir de lg.",
            },
        },
    },
    argTypes: {
        search: { control: "text", description: "Texto do filtro por título." },
        status: {
            control: "select",
            options: [undefined, ...GAME_STATUSES],
            description:
                "Status selecionado ou undefined para Todos. Também pode ser alterado clicando nos botões.",
        },
        counts: {
            control: "object",
            description: "Contagens por status e total all. Mantenha o total coerente com a soma.",
        },
        onSearchChange: { control: false, description: "Recebe o texto digitado." },
        onStatusChange: { control: false, description: "Recebe o status ou undefined para Todos." },
    },
} satisfies Meta<typeof LibraryFilters>;

export default meta;
type Story = StoryObj<typeof meta>;
export const Interativo: Story = {};
export const Filtrado: Story = { args: { search: "Elden", status: "PLAYING" } };
export const SemContadores: Story = { name: "Sem contadores", args: { counts: undefined } };
export const BibliotecaVazia: Story = {
    name: "Biblioteca vazia",
    args: {
        counts: { all: 0, WANT_TO_PLAY: 0, PLAYING: 0, PAUSED: 0, COMPLETED: 0, ABANDONED: 0 },
    },
};
