import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState, type ComponentProps } from "react";
import { fn, userEvent, within } from "storybook/test";
import { DangerZone } from "../../../src/components/profile/DangerZone";
import { ConfirmDeleteAccountModal } from "../../../src/components/profile/ConfirmDeleteAccountModal";
import { useDeleteCurrentUser } from "../../../src/hooks/auth.hook";
import { useAuth } from "../../../src/contexts/AuthContext";
import { getErrorMessage } from "../../../src/utils/getErrorMessage";
import { Button } from "../../../src/components/ui/Button";
import { StateView } from "../../../src/components/ui/StateView";
import { ProfileDemo } from "../../decorators/ProfileDemo";
import { demoProfileUser } from "../../fixtures/profile";
import { configureAccountDeletion } from "../../mocks/profileMutation";

function DeletionExample(args: ComponentProps<typeof DangerZone>) {
    const { user, setUser } = useAuth();
    const [open, setOpen] = useState(false);
    const { mutateAsync: deleteUser, isPending, error, reset } = useDeleteCurrentUser();

    async function confirm() {
        try {
            await deleteUser();
            setOpen(false);
        } catch {
            /* A mutation fornece a mensagem ao modal. */
        }
    }

    if (!user)
        return (
            <StateView
                icon="check_circle"
                title="Conta fictícia excluída"
                description="Nenhum dado real foi alterado."
                action={
                    <Button
                        onClick={() => {
                            reset();
                            setOpen(false);
                            setUser({ ...demoProfileUser });
                        }}
                    >
                        Reiniciar demonstração
                    </Button>
                }
            />
        );
    return (
        <>
            <DangerZone
                {...args}
                disabled={args.disabled || isPending}
                onDelete={() => {
                    args.onDelete();
                    reset();
                    setOpen(true);
                }}
            />
            {open && (
                <ConfirmDeleteAccountModal
                    isDeleting={isPending}
                    error={
                        error
                            ? getErrorMessage(error, "Não foi possível excluir sua conta.")
                            : undefined
                    }
                    onConfirm={() => void confirm()}
                    onCancel={() => {
                        if (!isPending) {
                            reset();
                            setOpen(false);
                        }
                    }}
                />
            )}
        </>
    );
}

const meta = {
    title: "Componentes/Perfil/DangerZone",
    component: DangerZone,
    decorators: [
        (Story) => (
            <ProfileDemo>
                <div className="w-full max-w-142.5">
                    <Story />
                </div>
            </ProfileDemo>
        ),
    ],
    beforeEach: () => configureAccountDeletion(),
    args: { disabled: false, onDelete: fn() },
    render: (args) => <DeletionExample {...args} />,
    parameters: {
        docs: {
            story: { inline: false, iframeHeight: 620 },
            description: {
                component:
                    "Zona de perigo com fluxo integrado ao ConfirmDeleteAccountModal real. DangerZone apenas exibe a ação e chama onDelete; o pai abre o modal, inicia a mutation e controla o erro. Antes da confirmação, Cancelar, Escape e clique no fundo fecham o diálogo. Durante a exclusão, o modal bloqueia esses caminhos e os botões, exibindo Excluindo.... A mutation real limpa o cache e a sessão fictícia ao concluir. No catálogo, isso mostra um resultado local com opção de reiniciar, sem excluir nenhuma conta real ou acessar a API. Falhas mantêm o modal aberto e permitem repetir ou cancelar. disabled representa bloqueio por outra operação do perfil. A seção reorganiza o botão a partir de 420px. Cada exemplo usa iframe e QueryClient próprios para isolar foco, rolagem e estado.",
            },
        },
    },
    argTypes: {
        disabled: { control: "boolean", description: "Bloqueia a abertura da confirmação." },
        onDelete: {
            control: false,
            description: "Solicita a abertura do modal; registrado em Actions.",
        },
    },
} satisfies Meta<typeof DangerZone>;

export default meta;
type Story = StoryObj<typeof meta>;
export const Disponivel: Story = { name: "Disponível" };
export const Confirmacao: Story = {
    name: "Confirmação de exclusão",
    play: async ({ canvasElement }) => {
        await userEvent.click(within(canvasElement).getByRole("button", { name: "Excluir conta" }));
    },
};
export const ExclusaoDemorada: Story = {
    name: "Exclusão demorada",
    beforeEach: () => configureAccountDeletion("slow"),
};
export const FalhaNaExclusao: Story = {
    name: "Falha na exclusão",
    beforeEach: () => configureAccountDeletion("error"),
};
export const Desabilitada: Story = { args: { disabled: true } };
