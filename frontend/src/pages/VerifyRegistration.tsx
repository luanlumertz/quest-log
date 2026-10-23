import { Link, useNavigate } from "react-router";
import { AuthStepLayout } from "../components/auth/AuthStepLayout";
import { VerificationCodeForm } from "../components/auth/VerificationCodeForm";
import { ButtonLink } from "../components/ui/Button";
import { useRegistration } from "../contexts/RegistrationContext";
import { useCountdown } from "../hooks/useCountdown";
import { useDocumentTitle } from "../hooks/useDocumentTitle";
import type { VerificationData } from "../schema/auth.schema";
import { verifyRegistration, resendRegistrationCode } from "../services/auth.service";
import { ApiError } from "../services/api";

export function VerifyRegistration() {
    useDocumentTitle("Verificar e-mail");
    const navigate = useNavigate();
    const { pending, renewResendCooldown, discardPendingRegistration, clearRegistration } =
        useRegistration();
    const expiresIn = useCountdown(pending?.expiresAt ?? 0);

    async function onVerify(data: VerificationData) {
        if (!pending) return;
        await verifyRegistration(pending.pendingRegistrationId, data);
        clearRegistration();
        navigate("/login", { replace: true, state: { registrationSuccess: true } });
    }

    async function onResend() {
        if (!pending) return;

        try {
            await resendRegistrationCode(pending.pendingRegistrationId);
            renewResendCooldown(pending.pendingRegistrationId);
        } catch (error) {
            if (error instanceof ApiError && error.status === 400) {
                discardPendingRegistration(pending.pendingRegistrationId);
            }
            throw error;
        }
    }

    if (!pending || expiresIn === 0) {
        return (
            <AuthStepLayout
                title={pending ? "Seu cadastro expirou" : "Vamos começar de novo?"}
                onBack={() => navigate(-1)}
                description={
                    <p>
                        Preencha o cadastro para receber um novo código de verificação. Sua conta só
                        será criada após confirmar o e-mail.
                    </p>
                }
            >
                <ButtonLink
                    to="/register"
                    size="lg"
                    fullWidth
                    className="mt-6"
                    onClick={() => discardPendingRegistration()}
                >
                    Ir para o cadastro
                </ButtonLink>
                <p className="mt-6 text-center text-sm text-ink-dim">
                    Já tem uma conta?{" "}
                    <Link to="/login" className="font-semibold text-brand hover:underline">
                        Entrar
                    </Link>
                </p>
            </AuthStepLayout>
        );
    }

    return (
        <AuthStepLayout
            title="Confira seu e-mail"
            onBack={() => navigate(-1)}
            description={
                <p>
                    Enviamos um código de seis dígitos para
                    <span className="mt-1 block break-all font-semibold text-ink">
                        {pending.email}
                    </span>
                </p>
            }
        >
            <VerificationCodeForm
                key={pending.pendingRegistrationId}
                resendAvailableAt={pending.resendAvailableAt}
                onVerify={onVerify}
                onResend={onResend}
                submitLabel="Confirmar e criar conta"
                resendSuccessMessage="Novo código enviado! Confira sua caixa de entrada e a pasta de spam."
            />
            <p className="mt-8 text-center text-sm text-ink-dim">
                Prefere entrar depois?{" "}
                <Link to="/login" className="font-semibold text-brand hover:underline">
                    Ir para o login
                </Link>
            </p>
        </AuthStepLayout>
    );
}
