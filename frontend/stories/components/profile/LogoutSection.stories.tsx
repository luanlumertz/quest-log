import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState, type ComponentProps } from "react";
import { fn } from "storybook/test";
import { LogoutSection } from "../../../src/components/profile/LogoutSection";
import { useAuth } from "../../../src/contexts/AuthContext";
import { getErrorMessage } from "../../../src/utils/getErrorMessage";
import { Button } from "../../../src/components/ui/Button";
import { StateView } from "../../../src/components/ui/StateView";
import { ProfileDemo } from "../../decorators/ProfileDemo";
import { demoProfileUser } from "../../fixtures/profile";
import { configureProfileLogout } from "../../mocks/profileMutation";

function LogoutExample(args: ComponentProps<typeof LogoutSection>) {
    const { user, setUser, signOut } = useAuth();
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState("");

    async function handleLogout() {
        args.onLogout();
        setError("");
        setBusy(true);
        try {
            await signOut();
        } catch (cause) {
            setError(getErrorMessage(cause, "Não foi possível encerrar a sessão."));
        } finally {
            setBusy(false);
        }
    }

    if (!user)
        return (
            <StateView
                icon="check_circle"
                title="Sessão fictícia encerrada"
                description="Nenhuma sessão real foi alterada."
                action={
                    <Button onClick={() => setUser({ ...demoProfileUser })}>
                        Reiniciar demonstração
                    </Button>
                }
            />
        );
    return (
        <LogoutSection
            {...args}
            isLoggingOut={args.isLoggingOut || busy}
            logoutError={args.logoutError || error}
            onLogout={() => void handleLogout()}
        />
    );
}

const meta = {
    title: "Componentes/Perfil/LogoutSection",
    component: LogoutSection,
    decorators: [
        (Story) => (
            <ProfileDemo>
                <div className="w-full max-w-142.5">
                    <Story />
                </div>
            </ProfileDemo>
        ),
    ],
    beforeEach: () => configureProfileLogout(),
    args: { isLoggingOut: false, logoutError: "", disabled: false, onLogout: fn() },
    render: (args) => <LogoutExample {...args} />,
    parameters: {
        docs: {
            story: { inline: false, iframeHeight: 440 },
            description: {
                component:
                    "Seção de saída com estado ocupado, bloqueio externo e erro. O componente recebe isLoggingOut e logoutError do pai; clicar em Sair apenas chama onLogout. Aqui, o pai simulado controla esses estados e encerra somente a sessão fictícia do exemplo, mostrando um resultado local com opção de reiniciar. Durante a operação, o botão exibe Saindo... e impede novos cliques. Em caso de erro, mantém a seção e permite nova tentativa. Os controles permitem forçar o estado ocupado e um erro fixo para inspeção. A disposição passa de coluna para linha a partir de 420px. Nenhuma API é acessada e a sessão da aplicação não é afetada.",
            },
        },
    },
    argTypes: {
        isLoggingOut: {
            control: "boolean",
            description:
                "Estado ocupado recebido do pai. A story também o ativa durante a operação simulada.",
        },
        logoutError: {
            control: "text",
            description: "Erro fixo opcional. Sem ele, aparece a falha da simulação.",
        },
        disabled: {
            control: "boolean",
            description: "Impede iniciar o logout durante outra operação do perfil.",
        },
        onLogout: {
            control: false,
            description: "Solicita o encerramento da sessão; registrado em Actions.",
        },
    },
} satisfies Meta<typeof LogoutSection>;

export default meta;
type Story = StoryObj<typeof meta>;
export const Interativo: Story = {};
export const SaidaDemorada: Story = {
    name: "Saída demorada",
    beforeEach: () => configureProfileLogout("slow"),
};
export const FalhaAoSair: Story = {
    name: "Falha ao sair",
    beforeEach: () => configureProfileLogout("error"),
};
export const Desabilitado: Story = { args: { disabled: true } };
