import type { Meta, StoryObj } from "@storybook/react-vite";
import { useArgs } from "storybook/preview-api";
import { fn } from "storybook/test";
import { LibraryPlaytimeField } from "../../../../src/components/library/details/LibraryPlaytimeField";

const meta = {
    title: "Componentes/Biblioteca/Detalhes/LibraryPlaytimeField",
    component: LibraryPlaytimeField,
    args: { value: "", disabled: false, onChange: fn(), onClear: fn() },
    render: function Render(args) {
        const [, updateArgs] = useArgs();
        return (
            <div className="max-w-sm">
                <LibraryPlaytimeField
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
            story: { inline: false, iframeHeight: 200 },
            description: {
                component:
                    "Entrada controlada de horas. Ao digitar, normaliza ponto para vírgula, remove caracteres que não sejam dígitos ou vírgula e mantém uma casa decimal. O componente não converte para minutos nem salva dados; a conversão ocorre no formulário. A limpeza envia string vazia. disabled bloqueia a edição e oculta a limpeza. Erros são fornecidos pelo pai. Os exemplos ficam em iframes separados porque o campo usa um ID fixo.",
            },
        },
    },
    argTypes: {
        value: {
            control: "text",
            description:
                "Horas como texto, por exemplo 12,3. A normalização ocorre na digitação, não no valor recebido diretamente.",
        },
        disabled: { control: "boolean", description: "Desabilita edição e limpeza." },
        error: { control: "text", description: "Mensagem de erro fornecida pelo formulário." },
        onChange: { control: false, description: "Recebe o texto normalizado." },
        onClear: { control: false, description: "Solicita limpeza do campo." },
    },
} satisfies Meta<typeof LibraryPlaytimeField>;

export default meta;
type Story = StoryObj<typeof meta>;
export const Vazio: Story = {};
export const Fracionado: Story = { args: { value: "12,3" } };
export const Zero: Story = { args: { value: "0" } };
export const ComErro: Story = {
    name: "Com erro",
    args: { value: "12,3", error: "Verifique o tempo jogado informado." },
};
export const Desabilitado: Story = { args: { value: "12,3", disabled: true } };
