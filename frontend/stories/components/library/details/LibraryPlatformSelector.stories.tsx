import type { Meta, StoryObj } from "@storybook/react-vite";
import { useArgs } from "storybook/preview-api";
import { fn } from "storybook/test";
import { LibraryPlatformSelector } from "../../../../src/components/library/details/LibraryPlatformSelector";
import { demoPlatforms } from "../../../fixtures/library";

const meta = {
    title: "Componentes/Biblioteca/Detalhes/LibraryPlatformSelector",
    component: LibraryPlatformSelector,
    args: { platforms: demoPlatforms, selectedPlatforms: [1], disabled: false, onToggle: fn() },
    render: function Render(args) {
        const [, updateArgs] = useArgs();
        return (
            <div className="max-w-lg">
                <LibraryPlatformSelector
                    {...args}
                    onToggle={(id) => {
                        args.onToggle(id);
                        updateArgs({
                            selectedPlatforms: args.selectedPlatforms.includes(id)
                                ? args.selectedPlatforms.filter((value) => value !== id)
                                : [...args.selectedPlatforms, id],
                        });
                    }}
                />
            </div>
        );
    },
    parameters: {
        docs: {
            description: {
                component:
                    "Seleção múltipla controlada das plataformas jogadas. Diferente do seletor de adição, usa IDs numéricos em selectedPlatforms e onToggle. A seleção ganha marca de confirmação e aria-pressed. disabled bloqueia o grupo; error associa uma mensagem de validação. Nenhuma seleção é obrigatória. As stories atualizam os controles sem salvar dados.",
            },
        },
    },
    argTypes: {
        platforms: {
            control: "object",
            description: "Plataformas disponíveis, com id único e name.",
        },
        selectedPlatforms: {
            control: "object",
            description: "IDs selecionados, pertencentes às opções disponíveis.",
        },
        disabled: { control: "boolean", description: "Desabilita o fieldset e seus botões." },
        error: { control: "text", description: "Mensagem opcional do formulário." },
        onToggle: { control: false, description: "Recebe o ID clicado." },
    },
} satisfies Meta<typeof LibraryPlatformSelector>;

export default meta;
type Story = StoryObj<typeof meta>;
export const Interativo: Story = {};
export const SemSelecao: Story = { name: "Sem seleção", args: { selectedPlatforms: [] } };
export const SemOpcoes: Story = {
    name: "Sem opções",
    args: { platforms: [], selectedPlatforms: [] },
};
export const ComErro: Story = {
    name: "Com erro",
    args: { error: "Verifique as plataformas selecionadas." },
};
export const Desabilitado: Story = { args: { disabled: true } };
