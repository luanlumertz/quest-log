import type { Meta, StoryObj } from "@storybook/react-vite";
import { RatingStars } from "../../../src/components/ui/RatingStars";

const meta = {
    title: "Componentes/UI/RatingStars",
    component: RatingStars,
    args: { rating: 4.2 },
    parameters: {
        docs: {
            description: {
                component:
                    "Exibe uma nota numérica e cinco estrelas com preenchimento parcial. É somente leitura: clicar nas estrelas não altera a nota. O preenchimento visual é limitado entre 0 e 5, mas o texto e o aria-label usam o valor recebido; por isso, forneça uma nota válida. Inteiros aparecem sem casa decimal e valores fracionários com uma casa decimal. O componente exige um número; a indicação de jogo sem nota (null) fica a cargo de quem o utiliza.",
            },
        },
    },
    decorators: [
        (Story) => (
            <div className="w-full max-w-xs">
                <Story />
            </div>
        ),
    ],
    argTypes: {
        rating: {
            control: { type: "range", min: 0, max: 5, step: 0.1 },
            description:
                "Nota de 0 a 5. No QuestLog, as avaliações aceitam no máximo uma casa decimal.",
        },
    },
} satisfies Meta<typeof RatingStars>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Fracionada: Story = {};
export const Inteira: Story = { args: { rating: 3 } };
export const Zero: Story = { args: { rating: 0 } };
export const Maxima: Story = { name: "Máxima", args: { rating: 5 } };
