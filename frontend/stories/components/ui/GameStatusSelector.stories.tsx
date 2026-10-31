import type { Meta, StoryObj } from "@storybook/react-vite";
import { useArgs } from "storybook/preview-api";
import { fn } from "storybook/test";
import { GameStatusSelector } from "../../../src/components/ui/GameStatusSelector";
import { GAME_STATUSES } from "../../../src/types/game.types";

const meta = {
    title: "Componentes/UI/GameStatusSelector",
    component: GameStatusSelector,
    args: { value: "WANT_TO_PLAY", disabled: false, onChange: fn() },
    render: function Render(args) {
        const [, updateArgs] = useArgs();
        return (
            <div className="w-full max-w-md">
                <GameStatusSelector
                    {...args}
                    onChange={(value) => {
                        args.onChange(value);
                        updateArgs({ value });
                    }}
                />
            </div>
        );
    },
    parameters: {
        docs: {
            description: {
                component:
                    "Seletor controlado dos cinco status da biblioteca. O botão selecionado recebe aria-pressed=true; disabled desabilita o fieldset inteiro. error marca o grupo como inválido e associa a mensagem por aria-describedby, mas não desabilita a seleção. A story atualiza value a cada clique e sincroniza o painel Controls, sem salvar no banco.",
            },
        },
    },
    argTypes: {
        value: {
            control: "select",
            options: GAME_STATUSES,
            description:
                "Status selecionado. O componente precisa receber o novo value após onChange.",
        },
        disabled: { control: "boolean", description: "Impede a interação com todos os botões." },
        error: { control: "text", description: "Mensagem opcional de erro do grupo." },
        onChange: {
            control: false,
            description:
                "Recebe o status clicado. O exemplo atualiza o controle e registra o evento em Actions.",
        },
    },
} satisfies Meta<typeof GameStatusSelector>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Interativo: Story = {};
export const Desabilitado: Story = { args: { value: "PLAYING", disabled: true } };
export const ComErro: Story = {
    name: "Com erro",
    args: { error: "Não foi possível salvar o status. Selecione novamente." },
};
