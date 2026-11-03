import type { Meta, StoryObj } from "@storybook/react-vite";
import { useArgs } from "storybook/preview-api";
import { fn } from "storybook/test";
import { SuccessAlert } from "../../../src/components/ui/SuccessAlert";
import { Button } from "../../../src/components/ui/Button";

const meta = {
    title: "Componentes/UI/SuccessAlert",
    component: SuccessAlert,
    args: { visible: false, children: "Alterações salvas com sucesso.", onVisibleChange: fn() },
    render: function Render(args) {
        const [, updateArgs] = useArgs();
        return (
            <div className="space-y-4">
                <Button disabled={args.visible} onClick={() => updateArgs({ visible: true })}>
                    Exibir mensagem
                </Button>
                <SuccessAlert
                    {...args}
                    onVisibleChange={(visible) => {
                        args.onVisibleChange(visible);
                        updateArgs({ visible });
                    }}
                />
            </div>
        );
    },
    parameters: {
        docs: {
            description: {
                component:
                    "Alerta de sucesso controlado com animação de entrada e saída. Quando visible=true, agenda onVisibleChange(false) após três segundos; quem o utiliza precisa atualizar visible. O exemplo sincroniza esse estado com Controls e permite exibir a mensagem novamente após ela desaparecer. Oculto, usa aria-hidden e bloqueia eventos de ponteiro. A transição respeita a preferência por movimento reduzido. Nenhum dado é salvo nesta demonstração.",
            },
        },
    },
    argTypes: {
        visible: {
            control: "boolean",
            description: "Controla a exibição e inicia a contagem de três segundos quando ativado.",
        },
        children: {
            control: "text",
            description: "Conteúdo da mensagem, editável como texto neste catálogo.",
        },
        onVisibleChange: {
            control: false,
            description:
                "Solicita atualização da visibilidade. O exemplo aplica o valor recebido e registra o evento em Actions.",
        },
        className: { table: { disable: true } },
    },
} satisfies Meta<typeof SuccessAlert>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Interativo: Story = {};
export const InicialmenteVisivel: Story = {
    name: "Inicialmente visível",
    args: { visible: true },
    parameters: {
        docs: {
            description: {
                story: "A contagem começa ao montar o exemplo. Se a mensagem já tiver desaparecido ao chegar aqui, clique em Exibir mensagem.",
            },
        },
    },
};
