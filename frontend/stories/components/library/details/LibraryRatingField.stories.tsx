import type { Meta, StoryObj } from "@storybook/react-vite";
import { useArgs } from "storybook/preview-api";
import { fn } from "storybook/test";
import { LibraryRatingField } from "../../../../src/components/library/details/LibraryRatingField";

const meta = {
    title: "Componentes/Biblioteca/Detalhes/LibraryRatingField",
    component: LibraryRatingField,
    args: { value: "4,5", disabled: false, onChange: fn() },
    render: function Render(args) {
        const [, updateArgs] = useArgs();
        return (
            <div className="max-w-sm">
                <LibraryRatingField
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
            story: { inline: false, iframeHeight: 220 },
            description: {
                component:
                    "Campo editável de nota, diferente do RatingStars somente leitura. Aceita digitação e controles de 0,1, limitados entre 0 e 5. Segurar um botão inicia repetição após uma pausa; ativação por teclado também funciona. Os controles formatam o resultado com vírgula, mas a digitação é validada pelo formulário pai. String vazia representa ausência de avaliação, diferente de zero; visualmente ambas deixam as estrelas vazias. error é fornecido pelo pai. Os exemplos isolam o ID fixo do campo em iframes.",
            },
        },
    },
    argTypes: {
        value: {
            control: "text",
            description:
                "Nota em texto: 0 a 5 ou string vazia. O controle aceita vírgula ou ponto para calcular as estrelas.",
        },
        disabled: { control: "boolean", description: "Bloqueia campo e botões de incremento." },
        error: { control: "text", description: "Mensagem de validação do formulário." },
        onChange: { control: false, description: "Recebe o novo valor após digitação ou ajuste." },
    },
} satisfies Meta<typeof LibraryRatingField>;

export default meta;
type Story = StoryObj<typeof meta>;
export const Interativo: Story = {};
export const SemNota: Story = { name: "Sem nota", args: { value: "" } };
export const Zero: Story = { args: { value: "0" } };
export const Maxima: Story = { name: "Máxima", args: { value: "5" } };
export const ComErro: Story = {
    name: "Com erro",
    args: { value: "6", error: "A nota deve estar entre 0 e 5." },
};
export const Desabilitado: Story = { args: { disabled: true } };
