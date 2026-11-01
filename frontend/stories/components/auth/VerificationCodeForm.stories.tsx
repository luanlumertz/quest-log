import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState, type ComponentProps } from "react";
import { fn } from "storybook/test";
import { VerificationCodeForm } from "../../../src/components/auth/VerificationCodeForm";
import { Button } from "../../../src/components/ui/Button";
import { ApiError } from "../../../src/services/api";
import type { VerificationData } from "../../../src/schema/auth.schema";

type Scenario = "success" | "slow" | "verify-error" | "resend-error";
type VerificationArgs = Omit<ComponentProps<typeof VerificationCodeForm>, "resendAvailableAt"> & {
    waitSeconds: number;
};

function VerificationExample({ args, scenario }: { args: VerificationArgs; scenario: Scenario }) {
    const [deadline, setDeadline] = useState(() => Date.now() + args.waitSeconds * 1000);
    const [confirmed, setConfirmed] = useState(false);
    const delay = () =>
        new Promise((resolve) => window.setTimeout(resolve, scenario === "slow" ? 2500 : 350));

    async function verify(data: VerificationData) {
        setConfirmed(false);
        await args.onVerify(data);
        await delay();
        if (scenario === "verify-error")
            throw new ApiError("Código inválido ou expirado. Resposta simulada.", 400);
        setConfirmed(true);
    }

    async function resend() {
        setConfirmed(false);
        await args.onResend();
        await delay();
        if (scenario === "resend-error")
            throw new ApiError(
                "Não foi possível reenviar o código. Tente novamente mais tarde. Resposta simulada.",
                429,
            );
        setDeadline(Date.now() + 10000);
    }

    return (
        <>
            <VerificationCodeForm
                submitLabel={args.submitLabel}
                resendSuccessMessage={args.resendSuccessMessage}
                resendAvailableAt={deadline}
                onVerify={verify}
                onResend={resend}
            />
            {confirmed && (
                <p role="status" className="mt-5 text-sm text-emerald-400">
                    Código confirmado na demonstração. Nenhuma conta ou senha foi alterada.
                </p>
            )}
        </>
    );
}

const meta = {
    title: "Componentes/Autenticação/VerificationCodeForm",
    component: VerificationCodeForm,
    args: {
        submitLabel: "Confirmar e criar conta",
        resendSuccessMessage: "Novo código enviado! Mensagem simulada; nenhum e-mail foi enviado.",
        onVerify: fn(async (_data: VerificationData) => {}),
        onResend: fn(async () => {}),
        waitSeconds: 0,
    },
    render: function Render(args, context) {
        const [generation, setGeneration] = useState(0);
        const scenario: Scenario = context.parameters.verificationScenario ?? "success";
        return (
            <div className="max-w-md">
                <VerificationExample
                    key={`${scenario}-${args.waitSeconds}-${generation}`}
                    args={args}
                    scenario={scenario}
                />
                <Button
                    className="mt-6"
                    variant="secondary"
                    size="sm"
                    onClick={() => setGeneration((current) => current + 1)}
                >
                    Reiniciar demonstração
                </Button>
            </div>
        );
    },
    parameters: {
        verificationScenario: "success",
        docs: {
            story: { inline: false, iframeHeight: 800 },
            description: {
                component:
                    "Formulário real de confirmação de cadastro ou recuperação de senha. Usa verificationSchema para exigir exatamente seis dígitos; inputMode=numeric apenas sugere o teclado, e maxLength limita a digitação. O envio chama onVerify; o reenvio chama onResend. Enquanto um deles está em andamento, o campo e a outra ação ficam bloqueados. A contagem usa resendAvailableAt como instante em milissegundos, atualizado pelo pai depois de um reenvio. Aqui, waitSeconds define a espera inicial e cada reenvio bem-sucedido inicia dez segundos de espera, apenas para facilitar a demonstração. Qualquer código de seis dígitos é aceito nos cenários de sucesso; nos cenários de erro, os callbacks simulam uma rejeição. Confirmar exibe um resultado local e mantém o exemplo aberto. O sucesso de reenvio limpa o campo e mostra SuccessAlert por três segundos. Reiniciar demonstração limpa o estado e reinicia a contagem. Actions registra os callbacks, sem chamadas à API nem envio de e-mail. Os exemplos usam iframes próprios para isolar IDs, timers e estado.",
            },
        },
    },
    argTypes: {
        submitLabel: {
            control: "text",
            description: "Texto de confirmação; durante o envio mostra Confirmando....",
        },
        resendSuccessMessage: {
            control: "text",
            description: "Mensagem temporária após reenvio bem-sucedido.",
        },
        resendAvailableAt: {
            control: false,
            description:
                "Instante absoluto (Date.now em ms) em que o reenvio fica disponível. O pai simulado calcula e atualiza esse valor.",
        },
        waitSeconds: {
            control: { type: "number", min: 0, max: 60, step: 1 },
            description:
                "Espera inicial da story, em segundos. Alterar esse controle reinicia o exemplo; não é uma propriedade do componente.",
        },
        onVerify: {
            control: false,
            description:
                "Recebe { code } após validação. A story registra o evento e simula sucesso ou falha.",
        },
        onResend: {
            control: false,
            description: "Solicita reenvio; sucesso atualiza a espera no pai simulado.",
        },
    },
} satisfies Meta<ComponentProps<typeof VerificationCodeForm> & { waitSeconds: number }>;

export default meta;
type Story = StoryObj<VerificationArgs>;
export const Confirmacao: Story = { name: "Confirmação de cadastro" };
export const AguardandoReenvio: Story = { name: "Aguardando reenvio", args: { waitSeconds: 10 } };
export const OperacoesDemoradas: Story = {
    name: "Confirmação e reenvio demorados",
    parameters: { verificationScenario: "slow" },
};
export const FalhaNaConfirmacao: Story = {
    name: "Falha na confirmação",
    parameters: { verificationScenario: "verify-error" },
};
export const FalhaNoReenvio: Story = {
    name: "Falha no reenvio",
    parameters: { verificationScenario: "resend-error" },
};
export const RecuperacaoDeSenha: Story = {
    name: "Recuperação de senha",
    args: {
        submitLabel: "Confirmar código",
        resendSuccessMessage: "Solicitação recebida. Mensagem simulada; nenhum e-mail foi enviado.",
    },
};
