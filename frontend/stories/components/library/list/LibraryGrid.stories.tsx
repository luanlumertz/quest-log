import type { Meta, StoryObj } from "@storybook/react-vite";
import { MemoryRouter } from "react-router";
import { LibraryGrid } from "../../../../src/components/library/list/LibraryGrid";
import { demoLibraryEntries } from "../../../fixtures/library";
import { DemoLocation } from "../../../decorators/GameDemo";

const meta = {
    title: "Componentes/Biblioteca/Listagem/LibraryGrid",
    component: LibraryGrid,
    decorators: [
        (Story) => (
            <MemoryRouter initialEntries={["/biblioteca-demo"]}>
                <Story />
            </MemoryRouter>
        ),
    ],
    render: (args) => (
        <>
            <LibraryGrid {...args} />
            <DemoLocation />
        </>
    ),
    args: { entries: demoLibraryEntries },
    parameters: {
        docs: {
            description: {
                component:
                    "Composição responsiva dos cartões da biblioteca: uma coluna abaixo de 320px, duas a partir de 320px, três em sm, quatro em lg e cinco em xl. Não filtra nem ordena as entradas. Uma lista vazia deixa o grid vazio; a mensagem de biblioteca vazia pertence à página. Os exemplos demonstram os cinco status e variações de capa e nota com dados locais. Os links funcionam apenas em memória.",
            },
        },
    },
    argTypes: {
        entries: {
            control: "object",
            description: "Entradas com game.id únicos, na ordem desejada.",
        },
    },
} satisfies Meta<typeof LibraryGrid>;

export default meta;
type Story = StoryObj<typeof meta>;
export const Preenchida: Story = {};
export const UmJogo: Story = { name: "Um jogo", args: { entries: demoLibraryEntries.slice(0, 1) } };
export const Vazia: Story = { args: { entries: [] } };
