import { Link, useNavigate } from "react-router";
import { AuthStepLayout } from "../components/auth/AuthStepLayout";
import { VerificationCodeForm } from "../components/auth/VerificationCodeForm";
import { ButtonLink } from "../components/ui/Button";
import { usePasswordRecovery } from "../contexts/PasswordRecoveryContext";
import { useDocumentTitle } from "../hooks/useDocumentTitle";
import type { VerificationData } from "../schema/auth.schema";
import { resendPasswordRecoveryCode, verifyPasswordRecovery } from "../services/auth.service";

export function VerifyPasswordRecovery() {
    useDocumentTitle("Verificar código de recuperação");
    const navigate = useNavigate();
    const { recovery, renewResendCooldown, saveAuthorization } = usePasswordRecovery();

    async function onVerify(data: VerificationData) {
        if (!recovery) return;
        const response = await verifyPasswordRecovery(recovery.email, data);
        if (saveAuthorization(recovery, response)) {
            navigate("/forgot-password/reset", { replace: true });
        }
    }

    async function onResend() {
        if (!recovery) return;
        await resendPasswordRecoveryCode(recovery.email);
        renewResendCooldown(recovery);
    }

    if (!recovery) {
        return (
            <AuthStepLayout
                title="Vamos recuperar seu acesso?"
                onBack={() => navigate("/forgot-password")}
                description={
                    <p>Informe o e-mail da sua conta para solicitar um código de recuperação.</p>
                }
            >
                <ButtonLink to="/forgot-password" size="lg" fullWidth className="mt-6">
                    Solicitar código
                </ButtonLink>
            </AuthStepLayout>
        );
    }

    return (
        <AuthStepLayout
            title="Confira seu e-mail"
            onBack={() => navigate("/forgot-password")}
            description={
                <p>
                    Se houver uma conta com este e-mail, você receberá um código de recuperação:
                    <span className="mt-1 block break-all font-semibold text-ink">
                        {recovery.email}
                    </span>
                </p>
            }
        >
            <VerificationCodeForm
                resendAvailableAt={recovery.resendAvailableAt}
                onVerify={onVerify}
                onResend={onResend}
                submitLabel="Confirmar código"
                resendSuccessMessage="Solicitação recebida. Se houver uma conta com este e-mail, enviaremos um novo código. Confira também a pasta de spam."
            />
            <p className="mt-8 text-center text-sm text-ink-dim">
                E-mail incorreto?{" "}
                <Link to="/forgot-password" className="font-semibold text-brand hover:underline">
                    Alterar e-mail
                </Link>
            </p>
        </AuthStepLayout>
    );
}
