import type { Meta, StoryObj } from "@storybook/react-vite";
import { useArgs } from "storybook/preview-api";
import { fn } from "storybook/test";
import { SearchGamesPagination } from "../../../../src/components/game/search/SearchGamesPagination";

const meta = {
    title: "Componentes/Jogos/Busca/SearchGamesPagination",
    component: SearchGamesPagination,
    args: { page: 1, hasPrevious: false, hasNext: true, isFetching: false, onPageChange: fn() },
    render: function Render(args) {
        const [, updateArgs] = useArgs();
        return (
            <SearchGamesPagination
                {...args}
                onPageChange={(page) => {
                    args.onPageChange(page);
                    updateArgs({ page, hasPrevious: page > 1, hasNext: page < 3 });
                }}
            />
        );
    },
    parameters: {
        docs: {
            description: {
                component:
                    "Navegação entre páginas. O pai fornece page e os indicadores hasPrevious/hasNext; o componente não conhece o total de resultados. isFetching desabilita ambos os botões. As stories simulam três páginas e atualizam os controles a cada clique, sem rede. Ao editar propriedades manualmente, mantenha seus valores coerentes.",
            },
        },
    },
    argTypes: {
        page: {
            control: { type: "number", min: 1, step: 1 },
            description: "Página atual, começando em 1.",
        },
        hasPrevious: {
            control: "boolean",
            description: "Habilita Anterior quando não há busca em andamento.",
        },
        hasNext: {
            control: "boolean",
            description: "Habilita Próxima quando não há busca em andamento.",
        },
        isFetching: { control: "boolean", description: "Bloqueia navegação durante uma consulta." },
        onPageChange: { control: false, description: "Recebe a página anterior ou seguinte." },
    },
} satisfies Meta<typeof SearchGamesPagination>;

export default meta;
type Story = StoryObj<typeof meta>;
export const PrimeiraPagina: Story = { name: "Primeira página" };
export const Intermediaria: Story = {
    name: "Página intermediária",
    args: { page: 2, hasPrevious: true },
};
export const UltimaPagina: Story = {
    name: "Última página",
    args: { page: 3, hasPrevious: true, hasNext: false },
};
export const Buscando: Story = { args: { page: 2, hasPrevious: true, isFetching: true } };
export const PaginaUnica: Story = { name: "Página única", args: { hasNext: false } };
