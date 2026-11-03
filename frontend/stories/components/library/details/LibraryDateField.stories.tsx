import type { Meta, StoryObj } from "@storybook/react-vite";
import { useArgs } from "storybook/preview-api";
import { fn } from "storybook/test";
import { LibraryDateField } from "../../../../src/components/library/details/LibraryDateField";
import { getTodayInputValue } from "../../../../src/components/library/details/libraryGameDetailsForm.utils";

const meta = {
    title: "Componentes/Biblioteca/Detalhes/LibraryDateField",
    component: LibraryDateField,
    args: {
        id: "storybook-library-date",
        label: "Data de início",
        value: "",
        max: getTodayInputValue(),
        disabled: false,
        onChange: fn(),
        onClear: fn(),
    },
    render: function Render(args) {
        const [, updateArgs] = useArgs();
        return (
            <div className="max-w-sm">
                <LibraryDateField
                    {...args}
                    onChange={(value) => {
                        args.onChange(value);
                        updateArgs({ value });
                    }}
                    onClear={() => {
                        args.onClear();
                        updateArgs({ value: "" });
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
                    "Campo controlado de data com seletor nativo do navegador, limites min/max, limpeza e mensagem de erro. Os valores usam YYYY-MM-DD; vazio representa ausência de data. Os limites são atributos HTML, enquanto a validação de negócio pertence ao formulário. O clique solicita showPicker, cuja apresentação depende do navegador. Erros fixos são fornecidos por error; a story não os recalcula. Cada exemplo usa iframe próprio para isolar o ID do campo.",
            },
        },
    },
    argTypes: {
        id: {
            control: false,
            description: "ID único que associa label, input e mensagem de erro.",
        },
        label: { control: "text", description: "Rótulo do campo." },
        value: { control: "text", description: "Data em YYYY-MM-DD ou string vazia." },
        min: { control: "text", description: "Data mínima opcional." },
        max: { control: "text", description: "Data máxima. O exemplo usa o dia atual." },
        disabled: {
            control: "boolean",
            description: "Desabilita o campo e oculta o botão de limpar.",
        },
        error: { control: "text", description: "Mensagem e indicação acessível de erro." },
        onChange: { control: false, description: "Recebe a data selecionada." },
        onClear: { control: false, description: "Solicita remoção da data." },
    },
} satisfies Meta<typeof LibraryDateField>;

export default meta;
type Story = StoryObj<typeof meta>;
export const Vazio: Story = {};
export const Preenchido: Story = { args: { value: "2026-10-01" } };
export const ComLimiteMinimo: Story = {
    name: "Com limite mínimo",
    args: { label: "Data de conclusão", min: "2026-10-01", value: "2026-10-20" },
};
export const ComErro: Story = {
    name: "Com erro",
    args: { error: "A data de conclusão não pode ser anterior à data de início." },
};
export const Desabilitado: Story = { args: { value: "2026-10-01", disabled: true } };
