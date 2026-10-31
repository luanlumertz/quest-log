import type { Meta, StoryObj } from "@storybook/react-vite";
import { useArgs } from "storybook/preview-api";
import { fn } from "storybook/test";
import { SearchGamesForm } from "../../../../src/components/game/search/SearchGamesForm";

const meta = {
    title: "Componentes/Jogos/Busca/SearchGamesForm",
    component: SearchGamesForm,
    args: { inputValue: "", onInputChange: fn(), onSubmit: fn() },
    render: function Render(args) {
        const [, updateArgs] = useArgs();
        return (
            <SearchGamesForm
                {...args}
                onInputChange={(inputValue) => {
                    args.onInputChange(inputValue);
                    updateArgs({ inputValue });
                }}
                onSubmit={(event) => {
                    event.preventDefault();
                    args.onSubmit(event);
                }}
            />
        );
    },
    parameters: {
        docs: {
            description: {
                component:
                    "Formulário controlado de busca. Atualiza inputValue por onInputChange e envia por Enter ou pelo botão. O botão fica desabilitado se o texto estiver vazio ou contiver apenas espaços. Limpar pesquisa envia uma string vazia ao pai. A partir de 400px, campo e botão ficam lado a lado. A story sincroniza o texto com Controls, impede a navegação nativa do formulário e registra o envio em Actions, sem buscar jogos.",
            },
        },
    },
    argTypes: {
        inputValue: { control: "text", description: "Texto atual do campo, controlado pelo pai." },
        onInputChange: { control: false, description: "Recebe o novo texto ao digitar ou limpar." },
        onSubmit: {
            control: false,
            description:
                "Recebe o evento do formulário. O pai decide como normalizar e realizar a busca.",
        },
    },
} satisfies Meta<typeof SearchGamesForm>;

export default meta;
type Story = StoryObj<typeof meta>;
export const Vazio: Story = {};
export const Preenchido: Story = { args: { inputValue: "Elden Ring" } };
export const SomenteEspacos: Story = { name: "Somente espaços", args: { inputValue: "   " } };
