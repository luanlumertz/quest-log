import type { Meta, StoryObj } from "@storybook/react-vite";
import { PlatformBadges } from "../../../../src/components/library/list/PlatformBadges";
import { demoPlatforms } from "../../../fixtures/library";

const meta = {
    title: "Componentes/Biblioteca/Listagem/PlatformBadges",
    component: PlatformBadges,
    args: { platforms: demoPlatforms },
    decorators: [
        (Story) => (
            <div className="flex w-full max-w-72 rounded-xl border border-divider p-3">
                <Story />
            </div>
        ),
    ],
    parameters: {
        docs: {
            description: {
                component:
                    "Mostra os nomes das plataformas que cabem na largura disponível e um contador +N para as restantes. Mede as badges e acompanha mudanças de tamanho com ResizeObserver. O atributo title contém a lista completa. Elementos auxiliares de medição ficam invisíveis e fora da árvore acessível. Uma lista vazia não renderiza conteúdo. Precisa de um contêiner flex com largura definida, como o usado no rodapé do LibraryGameCard.",
            },
        },
    },
    argTypes: {
        platforms: { control: "object", description: "Plataformas com IDs únicos e nomes." },
    },
} satisfies Meta<typeof PlatformBadges>;

export default meta;
type Story = StoryObj<typeof meta>;
export const Adaptavel: Story = { name: "Adaptável ao espaço" };
export const UmaPlataforma: Story = {
    name: "Uma plataforma",
    args: { platforms: [demoPlatforms[0]] },
};
export const SemPlataformas: Story = { name: "Sem plataformas", args: { platforms: [] } };
export const EspacoReduzido: Story = {
    name: "Espaço reduzido",
    decorators: [
        (Story) => (
            <div className="w-24">
                <Story />
            </div>
        ),
    ],
};
