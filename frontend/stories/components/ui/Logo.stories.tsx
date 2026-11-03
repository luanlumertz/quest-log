import type { Meta, StoryObj } from "@storybook/react-vite";
import { Logo } from "../../../src/components/ui/Logo";

const meta = {
    title: "Componentes/UI/Logo",
    component: Logo,
    parameters: {
        controls: { disable: true },
        docs: {
            description: {
                component:
                    "Identidade visual do QuestLog: símbolo de controle sobre o gradiente da marca e nome com a fonte Rajdhani. O componente não recebe propriedades, não é um link e não tem estados interativos. Esta referência mostra sua aparência sobre o fundo escuro usado na aplicação.",
            },
        },
    },
} satisfies Meta<typeof Logo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Padrao: Story = { name: "Padrão" };
