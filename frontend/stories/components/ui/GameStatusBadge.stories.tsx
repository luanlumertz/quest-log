import type { Meta, StoryObj } from "@storybook/react-vite";
import { GameStatusBadge } from "../../../src/components/ui/GameStatusBadge";
import { GAME_STATUSES } from "../../../src/types/game.types";

const meta = {
    title: "Componentes/UI/GameStatusBadge",
    component: GameStatusBadge,
    args: { status: "WANT_TO_PLAY", backgroundOpacity: "1A" },
    parameters: {
        docs: {
            description: {
                component:
                    "Etiqueta visual para o status de um jogo na biblioteca. O texto e a cor vêm de GAME_STATUS_CONFIG. Não é um botão e não altera o status. backgroundOpacity é um sufixo hexadecimal de dois dígitos (00 a FF), acrescentado à cor do fundo; não é uma porcentagem. textColor altera somente a cor do texto, preservando a borda e o fundo associados ao status.",
            },
        },
    },
    decorators: [
        (Story) => (
            <div className="flex items-center p-2">
                <Story />
            </div>
        ),
    ],
    argTypes: {
        status: {
            control: "select",
            options: GAME_STATUSES,
            description: "Um dos cinco status da biblioteca.",
        },
        backgroundOpacity: {
            control: "select",
            options: ["00", "1A", "33", "66", "FF"],
            description:
                "Opacidade hexadecimal do fundo. O controle apresenta alguns exemplos válidos.",
            table: { defaultValue: { summary: "1A" } },
        },
        textColor: {
            control: "color",
            description: "Cor CSS opcional para o texto. Sem definição, usa a cor do status.",
        },
    },
} satisfies Meta<typeof GameStatusBadge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const QueroJogar: Story = { name: "Quero jogar" };
export const Jogando: Story = { args: { status: "PLAYING" } };
export const Pausado: Story = { args: { status: "PAUSED" } };
export const Abandonado: Story = { args: { status: "ABANDONED" } };
export const Zerado: Story = { args: { status: "COMPLETED" } };
export const Personalizado: Story = {
    args: { status: "PLAYING", backgroundOpacity: "66", textColor: "#ffffff" },
};
