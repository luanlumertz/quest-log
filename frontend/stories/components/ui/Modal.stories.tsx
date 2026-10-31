import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState, type ComponentProps } from "react";
import { fn } from "storybook/test";
import { Modal } from "../../../src/components/ui/Modal";
import { Button } from "../../../src/components/ui/Button";

function ModalExample(args: ComponentProps<typeof Modal>) {
    const [isOpen, setIsOpen] = useState(false);

    function closeModal() {
        args.onClose();
        setIsOpen(false);
    }

    return (
        <div className="p-6">
            <Button onClick={() => setIsOpen(true)}>Abrir modal</Button>
            {isOpen && (
                <Modal {...args} onClose={closeModal}>
                    <div className="space-y-4 p-6">
                        <h2
                            id={args.ariaLabelledBy}
                            className="font-display text-xl font-semibold text-ink"
                        >
                            Exemplo de modal
                        </h2>
                        <p id={args.ariaDescribedBy} className="text-sm text-ink-dim">
                            {args.preventClose
                                ? "Escape e clique no fundo estão bloqueados. Use o botão para concluir esta demonstração."
                                : "Experimente Tab, Shift+Tab, Escape e clique no fundo. Nenhum dado será salvo."}
                        </p>
                        {args.children}
                        <Button variant="secondary" onClick={closeModal}>
                            {args.preventClose ? "Concluir demonstração" : "Fechar modal"}
                        </Button>
                    </div>
                </Modal>
            )}
        </div>
    );
}

const meta = {
    title: "Componentes/UI/Modal",
    component: Modal,
    render: (args) => <ModalExample {...args} />,
    args: {
        onClose: fn(),
        ariaLabelledBy: "storybook-modal-title",
        ariaDescribedBy: "storybook-modal-description",
        preventClose: false,
        children: (
            <label className="flex flex-col gap-2 text-sm text-ink">
                Nome de exibição
                <input
                    className="rounded-lg border border-divider-bright bg-backdrop px-3 py-2 text-ink"
                    defaultValue="Jogador"
                />
            </label>
        ),
    },
    parameters: {
        layout: "fullscreen",
        docs: {
            story: { inline: false, iframeHeight: 480 },
            description: {
                component:
                    "Contêiner de diálogo acessível. Ao montar, bloqueia a rolagem, foca o primeiro controle e mantém Tab e Shift+Tab dentro do diálogo. Ao desmontar, restaura a rolagem e o foco anteriores. O componente não tem uma propriedade open: quem o usa controla sua montagem. Escape e clique no fundo chamam onClose, exceto com preventClose=true. Essa opção não desabilita botões fornecidos em children. Cada exemplo começa fechado e é exibido em um iframe próprio na documentação para isolar os efeitos de foco e rolagem.",
            },
        },
        controls: { include: ["preventClose"] },
    },
    argTypes: {
        preventClose: {
            control: "boolean",
            description:
                "Impede fechamento por Escape e pelo fundo; não bloqueia os botões do conteúdo.",
            table: { defaultValue: { summary: "false" } },
        },
        children: {
            control: false,
            description: "Conteúdo do diálogo, incluindo seus controles e ações.",
        },
        onClose: {
            control: false,
            description:
                "Callback de fechamento. O exemplo desmonta o modal e registra o evento em Actions.",
        },
        ariaLabelledBy: {
            control: false,
            description: "ID do elemento que fornece o nome acessível do diálogo. Obrigatório.",
        },
        ariaDescribedBy: {
            control: false,
            description: "ID opcional do elemento que descreve o diálogo.",
        },
    },
} satisfies Meta<typeof Modal>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Interativo: Story = {};
export const FechamentoBloqueado: Story = {
    name: "Fechamento pelo fundo e Escape bloqueado",
    args: { preventClose: true },
};
export const ConteudoLongo: Story = {
    name: "Conteúdo com rolagem",
    args: {
        children: (
            <div className="space-y-4 text-sm text-ink-dim">
                {Array.from({ length: 10 }, (_, index) => (
                    <p key={index}>
                        Seção {index + 1}: este conteúdo de demonstração mostra a rolagem interna do
                        diálogo quando sua altura ultrapassa o espaço disponível na tela.
                    </p>
                ))}
            </div>
        ),
    },
};
