import type { Meta, StoryObj } from "@storybook/react-vite";
import { RatingStars } from "../../../src/components/ui/RatingStars";

const meta = {
    title: "Componentes/UI/RatingStars",
    component: RatingStars,
    args: { rating: 4.2, showValue: true, size: "md", tone: "amber" },
    parameters: {
        docs: {
            description: {
                component:
                    "Exibe cinco estrelas com preenchimento parcial e número opcional. É somente leitura: clicar nas estrelas não altera a nota. O preenchimento visual é limitado entre 0 e 5, mas o texto e o aria-label usam o valor recebido; forneça uma nota válida. Inteiros aparecem sem casa decimal e valores fracionários com uma casa decimal. showValue=false mantém apenas as estrelas e o rótulo acessível, como no LibraryRatingField. size controla o tamanho das estrelas e tone sua cor. Por padrão preserva a apresentação dos cartões. A indicação de jogo sem nota (null) pertence a quem o utiliza.",
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
        showValue: {
            control: "boolean",
            description:
                "Exibe o número com largura reservada de 3ch. Sem ele, o grupo ocupa apenas a largura das estrelas.",
        },
        size: {
            control: "select",
            options: ["md", "lg"],
            description: "Estrelas de 18px ou 20px; não altera o tamanho do número.",
        },
        tone: {
            control: "select",
            options: ["amber", "gold"],
            description: "Cor das estrelas preenchidas e do número.",
        },
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
export const SemNumero: Story = { name: "Sem número", args: { showValue: false } };
export const NoCampoDeNota: Story = {
    name: "Apresentação do campo de nota",
    args: { showValue: false, size: "lg", tone: "gold" },
};
