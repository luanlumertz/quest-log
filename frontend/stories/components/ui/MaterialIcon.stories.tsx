import type { Meta, StoryObj } from "@storybook/react-vite";
import { MaterialIcon } from "../../../src/components/ui/MaterialIcon";
import { MATERIAL_ICON_NAMES } from "../../../src/components/ui/materialIcon.config";

const meta = {
    title: "Componentes/UI/MaterialIcon",
    component: MaterialIcon,
    args: { name: "stadia_controller", className: "text-3xl! text-brand" },
    parameters: {
        docs: {
            description: {
                component:
                    "Ícone da fonte Material Symbols Rounded. Os nomes disponíveis são definidos em MATERIAL_ICON_NAMES, também usado pela galeria abaixo e pela configuração que carrega a fonte. O ícone tem aria-hidden=true: botões e outros controles precisam fornecer seu próprio nome acessível. A fonte é carregada do Google Fonts e depende de conexão para seu primeiro carregamento.",
            },
        },
    },
    argTypes: {
        name: {
            control: "select",
            options: MATERIAL_ICON_NAMES,
            description: "Nome de um ícone disponível no QuestLog.",
        },
        className: {
            control: "select",
            options: ["text-xl! text-ink", "text-3xl! text-brand", "text-5xl! text-danger"],
            description:
                "Classes de tamanho e cor. O controle oferece estilos de exemplo compilados pelo Tailwind.",
        },
    },
} satisfies Meta<typeof MaterialIcon>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Interativo: Story = {};
export const Galeria: Story = {
    render: () => (
        <ul className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {MATERIAL_ICON_NAMES.map((name) => (
                <li
                    key={name}
                    className="flex flex-col items-center gap-3 rounded-xl border border-divider bg-surface p-4"
                >
                    <MaterialIcon name={name} className="text-3xl! text-brand" />
                    <code className="break-all text-center text-xs text-ink-dim">{name}</code>
                </li>
            ))}
        </ul>
    ),
    parameters: {
        controls: { disable: true },
        docs: {
            description: {
                story: "Referência dos ícones disponíveis, gerada a partir da lista do projeto. Não duplica nem mantém uma lista manual de símbolos.",
            },
        },
    },
};
