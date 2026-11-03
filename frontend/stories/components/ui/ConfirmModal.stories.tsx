import type { Meta, StoryObj } from "@storybook/react-vite";
import { useEffect, useState, type ComponentProps } from "react";
import { fn } from "storybook/test";
import { ConfirmModal } from "../../../src/components/ui/ConfirmModal";
import { Button } from "../../../src/components/ui/Button";
import { MATERIAL_ICON_NAMES } from "../../../src/components/ui/materialIcon.config";

function ConfirmExample(args: ComponentProps<typeof ConfirmModal>) {
    const { isLoading, onConfirm } = args;
    const [isOpen, setIsOpen] = useState(false);
    const [result, setResult] = useState("");

    useEffect(() => {
        if (!isOpen || !isLoading) return;
        const timer = window.setTimeout(() => {
            onConfirm();
            setIsOpen(false);
            setResult("Simulação concluída. Nenhum dado foi alterado.");
        }, 3000);
        return () => window.clearTimeout(timer);
    }, [isOpen, isLoading, onConfirm]);

    return (
        <div className="space-y-4 p-6">
            <Button
                onClick={() => {
                    setResult("");
                    setIsOpen(true);
                }}
            >
                Abrir confirmação
            </Button>
            <p role="status" className="text-sm text-ink-dim">
                {result}
            </p>
            {isOpen && (
                <ConfirmModal
                    {...args}
                    onConfirm={() => {
                        args.onConfirm();
                        setIsOpen(false);
                        setResult("Confirmação simulada. Nenhum dado foi alterado.");
                    }}
                    onCancel={() => {
                        args.onCancel();
                        setIsOpen(false);
                        setResult("Demonstração cancelada.");
                    }}
                />
            )}
        </div>
    );
}

const meta = {
    title: "Componentes/UI/ConfirmModal",
    component: ConfirmModal,
    render: (args) => <ConfirmExample {...args} />,
    args: {
        icon: "check_circle",
        title: "Confirmar ação",
        description: "Deseja concluir esta ação de demonstração?",
        confirmText: "Confirmar",
        cancelText: "Cancelar",
        variant: "primary",
        isLoading: false,
        loadingText: "Processando...",
        onConfirm: fn(),
        onCancel: fn(),
    },
    parameters: {
        layout: "fullscreen",
        docs: {
            story: { inline: false, iframeHeight: 520 },
            description: {
                component:
                    "Diálogo de confirmação composto por Modal, Button e Alert. Pode apresentar ação principal ou destrutiva, conteúdo adicional e mensagem de erro. Durante isLoading, desabilita confirmação e cancelamento e bloqueia Escape e clique no fundo. O componente não executa requisições nem controla sua própria abertura. Os exemplos começam fechados; confirmação e cancelamento apenas registram eventos e encerram a demonstração. No exemplo de carregamento, uma simulação local termina após três segundos para não deixar o diálogo preso.",
            },
        },
        controls: {
            include: [
                "icon",
                "title",
                "description",
                "confirmText",
                "cancelText",
                "variant",
                "error",
                "isLoading",
                "loadingText",
            ],
        },
    },
    argTypes: {
        icon: {
            control: "select",
            options: MATERIAL_ICON_NAMES,
            description: "Ícone no cabeçalho.",
        },
        title: { control: "text", description: "Título e nome acessível do diálogo." },
        description: {
            control: "text",
            description: "Descrição opcional, usada também como descrição acessível.",
        },
        confirmText: { control: "text", description: "Texto da ação de confirmação." },
        cancelText: {
            control: "text",
            description: "Texto da ação de cancelamento.",
            table: { defaultValue: { summary: "Cancelar" } },
        },
        variant: {
            control: "select",
            options: ["primary", "danger"],
            description: "Aparência do ícone e do botão de confirmação.",
            table: { defaultValue: { summary: "primary" } },
        },
        isLoading: {
            control: "boolean",
            description:
                "Bloqueia ações e fechamento. A demonstração se encerra após três segundos nesse estado.",
            table: { defaultValue: { summary: "false" } },
        },
        loadingText: {
            control: "text",
            description: "Texto opcional do botão de confirmação durante o carregamento.",
        },
        error: {
            control: "text",
            description: "Mensagem opcional exibida em um Alert dentro do diálogo.",
        },
        children: {
            control: false,
            description: "Conteúdo adicional entre o cabeçalho e as ações.",
        },
        onConfirm: {
            control: false,
            description: "Callback de confirmação, registrado em Actions neste catálogo.",
        },
        onCancel: {
            control: false,
            description: "Callback de cancelamento, também usado por Escape e clique no fundo.",
        },
    },
} satisfies Meta<typeof ConfirmModal>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Padrao: Story = { name: "Padrão" };
export const Destrutivo: Story = {
    args: {
        icon: "delete",
        title: "Remover jogo",
        description: "Deseja remover este jogo da biblioteca? Esta é apenas uma demonstração.",
        variant: "danger",
        confirmText: "Remover",
    },
};
export const ComErro: Story = {
    name: "Com erro",
    args: { error: "Não foi possível concluir a ação. Tente novamente." },
};
export const Carregando: Story = {
    args: {
        isLoading: true,
        children: (
            <p className="text-sm text-ink-dim">
                A simulação será concluída em três segundos. Nenhuma requisição será enviada.
            </p>
        ),
    },
};
export const ConteudoAdicional: Story = {
    name: "Conteúdo adicional",
    args: {
        children: (
            <p className="rounded-lg border border-divider bg-backdrop p-3 text-sm text-ink-dim">
                O espaço de children permite apresentar informações adicionais antes da confirmação.
            </p>
        ),
    },
};
