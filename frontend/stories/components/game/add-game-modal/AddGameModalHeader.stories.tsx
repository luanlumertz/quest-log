import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";
import { AddGameModalHeader } from "../../../../src/components/game/add-game-modal/AddGameModalHeader";
import { demoGameDetails } from "../../../fixtures/games";

const meta = {
    title: "Componentes/Jogos/Adicionar/AddGameModalHeader",
    component: AddGameModalHeader,
    args: {
        title: demoGameDetails.title,
        coverUrl: demoGameDetails.coverUrl,
        isSubmitting: false,
        onClose: fn(),
    },
    decorators: [
        (Story) => (
            <div className="max-w-md overflow-hidden rounded-2xl border border-divider">
                <Story />
            </div>
        ),
    ],
    parameters: {
        docs: {
            story: { inline: false, iframeHeight: 200 },
            description: {
                component:
                    "Cabeçalho do modal com imagem de fundo, título em até duas linhas e botão Fechar. coverUrl=null usa a capa padrão local. Durante isSubmitting, o botão fica desabilitado. O título fornece o ID add-game-title usado pelo diálogo completo; as stories ficam em iframes separados para não repetir esse ID na mesma página. O clique apenas registra onClose em Actions.",
            },
        },
    },
    argTypes: {
        title: { control: "text", description: "Nome do jogo." },
        coverUrl: {
            control: "text",
            description: "URL da imagem de fundo ou null. As imagens de exemplo são locais.",
        },
        isSubmitting: { control: "boolean", description: "Desabilita Fechar durante o envio." },
        onClose: { control: false, description: "Solicita fechamento ao componente pai." },
    },
} satisfies Meta<typeof AddGameModalHeader>;

export default meta;
type Story = StoryObj<typeof meta>;
export const Padrao: Story = { name: "Padrão" };
export const SemCapa: Story = { name: "Sem capa", args: { coverUrl: null } };
export const Enviando: Story = { args: { isSubmitting: true } };
export const TituloLongo: Story = {
    name: "Título longo",
    args: {
        title: "Uma jornada extraordinária por mundos distantes: edição completa com todas as expansões",
    },
};
