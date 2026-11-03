import type { Meta, StoryObj } from "@storybook/react-vite";
import { action } from "storybook/actions";
import { StateView } from "../../../src/components/ui/StateView";
import { Button } from "../../../src/components/ui/Button";
import { MATERIAL_ICON_NAMES } from "../../../src/components/ui/materialIcon.config";

const onAction = action("Ação de demonstração");

const meta = {
    title: "Componentes/UI/StateView",
    component: StateView,
    args: {
        icon: "library_books",
        title: "Sua biblioteca está vazia",
        description: "Procure jogos e adicione os que você quer acompanhar.",
        tone: "neutral",
    },
    parameters: {
        docs: {
            description: {
                component:
                    "Apresenta estados vazios, buscas sem resultados e falhas, combinando ícone, título e conteúdo opcional. tone altera a cor do ícone. description e action aceitam ReactNode; as ações destes exemplos apenas registram cliques no painel Actions, sem navegar, limpar filtros ou consultar a API.",
            },
        },
        controls: { include: ["icon", "title", "description", "tone"] },
    },
    argTypes: {
        icon: {
            control: "select",
            options: MATERIAL_ICON_NAMES,
            description: "Nome de um ícone disponível no projeto.",
        },
        title: {
            control: "text",
            description: "Título obrigatório do estado, renderizado como h2.",
        },
        description: {
            control: "text",
            description: "Descrição opcional. Neste catálogo, pode ser editada como texto.",
        },
        tone: {
            control: "select",
            options: ["neutral", "danger"],
            description: "Tom do ícone: neutro ou erro.",
            table: { defaultValue: { summary: "neutral" } },
        },
        action: {
            control: false,
            description: "Conteúdo opcional abaixo da descrição, como um botão.",
        },
        className: { table: { disable: true } },
    },
} satisfies Meta<typeof StateView>;

export default meta;
type Story = StoryObj<typeof meta>;

export const BibliotecaVazia: Story = { name: "Biblioteca vazia" };
export const SemResultados: Story = {
    name: "Sem resultados",
    args: {
        icon: "search_off",
        title: "Nenhum jogo encontrado",
        description: "Nenhum jogo corresponde aos filtros atuais.",
        action: (
            <Button variant="secondary" onClick={onAction}>
                Limpar filtros
            </Button>
        ),
    },
};
export const Erro: Story = {
    args: {
        icon: "error",
        title: "Não foi possível carregar sua biblioteca",
        description: "Ocorreu um problema ao buscar os jogos. Tente novamente.",
        tone: "danger",
        action: <Button onClick={onAction}>Tentar novamente</Button>,
    },
};
export const SomenteTitulo: Story = {
    name: "Somente ícone e título",
    args: { description: undefined },
};
