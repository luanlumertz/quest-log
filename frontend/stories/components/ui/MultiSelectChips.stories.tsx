import type { Meta, StoryObj } from "@storybook/react-vite";
import { useArgs } from "storybook/preview-api";
import { fn } from "storybook/test";
import { MultiSelectChips } from "../../../src/components/ui/MultiSelectChips";

const meta = {
    title: "Componentes/UI/MultiSelectChips",
    component: MultiSelectChips<string | number>,
    args: {
        label: "Opções da demonstração",
        options: [
            { value: "pc", label: "PC" },
            { value: "ps5", label: "PlayStation 5" },
            { value: "xbox", label: "Xbox Series S/X" },
        ],
        selectedValues: ["pc"],
        onToggle: fn(),
        disabled: false,
        showCheck: false,
        surface: "default",
        emptyMessage: "Nenhuma opção disponível.",
    },
    render: function Render(args) {
        const [, updateArgs] = useArgs();
        return (
            <div className="max-w-lg">
                <MultiSelectChips
                    {...args}
                    onToggle={(value) => {
                        args.onToggle(value);
                        updateArgs({
                            selectedValues: args.selectedValues.includes(value)
                                ? args.selectedValues.filter((selected) => selected !== value)
                                : [...args.selectedValues, value],
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
                    "Seleção múltipla controlada por botões com aria-pressed. Cada opção tem value único e label; valores podem ser strings ou números e onToggle preserva o tipo recebido, sem conversões. O pai atualiza selectedValues. disabled bloqueia o grupo e error associa uma mensagem acessível. showCheck e surface preservam as apresentações dos seletores de plataformas de adição e edição. O componente não exige seleção, não valida regras de negócio e não consulta a API. As stories sincronizam os cliques com Controls e Actions.",
            },
        },
    },
    argTypes: {
        label: { control: "text", description: "Legenda acessível do grupo; aceita ReactNode." },
        options: {
            control: "object",
            description: "Opções com value único e label. Use o mesmo tipo em selectedValues.",
        },
        selectedValues: {
            control: "object",
            description: "Valores selecionados, pertencentes às opções disponíveis.",
        },
        onToggle: {
            control: false,
            description: "Recebe o valor clicado; o pai adiciona ou remove a seleção.",
        },
        disabled: { control: "boolean", description: "Desabilita o fieldset e seus botões." },
        error: { control: "text", description: "Mensagem de validação fornecida pelo pai." },
        emptyMessage: { control: "text", description: "Texto quando não existem opções." },
        showCheck: {
            control: "boolean",
            description: "Mostra o ícone de confirmação nas opções selecionadas.",
        },
        surface: {
            control: "select",
            options: ["default", "raised"],
            description: "Fundo das opções desmarcadas.",
        },
        className: { table: { disable: true } },
    },
} satisfies Meta<typeof MultiSelectChips<string | number>>;

export default meta;
type Story = StoryObj<typeof meta>;
export const Interativo: Story = {};
export const ValoresNumericos: Story = {
    name: "Valores numéricos e confirmação",
    args: {
        options: [
            { value: 1, label: "PC" },
            { value: 2, label: "PlayStation 5" },
        ],
        selectedValues: [1],
        showCheck: true,
    },
};
export const SuperficieElevada: Story = { name: "Superfície elevada", args: { surface: "raised" } };
export const SemSelecao: Story = { name: "Sem seleção", args: { selectedValues: [] } };
export const SemOpcoes: Story = { name: "Sem opções", args: { options: [], selectedValues: [] } };
export const ComErro: Story = {
    name: "Com erro",
    args: { error: "Verifique as opções selecionadas." },
};
export const Desabilitado: Story = { args: { disabled: true } };
