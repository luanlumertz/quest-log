import type { Meta, StoryObj } from "@storybook/react-vite";
import { useArgs } from "storybook/preview-api";
import { fn } from "storybook/test";
import { AddGameToLibraryModal } from "../../../../src/components/game/add-game-modal/AddGameToLibraryModal";
import { Button } from "../../../../src/components/ui/Button";
import { demoGameDetails } from "../../../fixtures/games";
import { GameDemo } from "../../../decorators/GameDemo";
import { configureLibraryMutation } from "../../../mocks/libraryMutation";

const meta = {
    title: "Componentes/Jogos/Adicionar/AddGameToLibraryModal",
    component: AddGameToLibraryModal,
    decorators: [
        (Story) => (
            <GameDemo>
                <Story />
            </GameDemo>
        ),
    ],
    beforeEach: () => configureLibraryMutation(),
    args: { game: demoGameDetails, isOpen: false, onClose: fn() },
    render: function Render(args) {
        const [, updateArgs] = useArgs();
        return (
            <div className="p-4">
                <Button disabled={args.isOpen} onClick={() => updateArgs({ isOpen: true })}>
                    Abrir modal de adição
                </Button>
                <AddGameToLibraryModal
                    {...args}
                    onClose={() => {
                        args.onClose();
                        updateArgs({ isOpen: false });
                    }}
                />
            </div>
        );
    },
    parameters: {
        docs: {
            story: { inline: false, iframeHeight: 700 },
            description: {
                component:
                    "Formulário real de adição, com React Hook Form, validação Zod e mutation do React Query. Abre com WANT_TO_PLAY e nenhuma plataforma selecionada; selecionar plataforma é opcional. Remove nomes duplicados da lista de opções. Fechar e concluir com sucesso restauram os valores iniciais. Durante o envio, confirmação, cancelamento, botão Fechar, Escape e clique no fundo ficam bloqueados; os seletores não são desabilitados pelo componente. Falhas aparecem no Alert sem fechar o modal. No catálogo, o serviço da biblioteca é substituído por um mock: sucesso após uma pequena espera, demora de 2,5 segundos ou erro simulado. Nenhuma requisição real é enviada. Cada exemplo usa um iframe e QueryClient próprios.",
            },
        },
    },
    argTypes: {
        game: {
            control: "object",
            description: "Detalhes do jogo da RAWG, incluindo externalId e nomes de plataformas.",
        },
        isOpen: {
            control: "boolean",
            description:
                "Visibilidade controlada pelo pai. O botão Abrir e onClose atualizam esse valor na story.",
        },
        onClose: {
            control: false,
            description:
                "Notifica fechamento ou sucesso; o exemplo oculta o modal e registra o evento.",
        },
    },
} satisfies Meta<typeof AddGameToLibraryModal>;

export default meta;
type Story = StoryObj<typeof meta>;
export const Sucesso: Story = {};
export const SemCapa: Story = {
    name: "Sem capa",
    args: { game: { ...demoGameDetails, coverUrl: null } },
};
export const SemPlataformas: Story = {
    name: "Sem plataformas",
    args: { game: { ...demoGameDetails, platforms: [] } },
};
export const PlataformasRepetidas: Story = {
    name: "Plataformas repetidas na origem",
    args: { game: { ...demoGameDetails, platforms: ["PC", "PC", "PlayStation 5"] } },
};
export const EnvioLento: Story = {
    name: "Envio demorado",
    beforeEach: () => configureLibraryMutation("slow"),
};
export const FalhaNoEnvio: Story = {
    name: "Falha no envio",
    beforeEach: () => configureLibraryMutation("error"),
};
