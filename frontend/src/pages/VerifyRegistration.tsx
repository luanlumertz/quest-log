import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AuthLayout } from "../components/auth/AuthLayout";
import { AuthInput } from "../components/auth/AuthInput";
import { Alert } from "../components/ui/Alert";
import { SuccessAlert } from "../components/ui/SuccessAlert";
import { BackButton } from "../components/ui/BackButton";
import { Button, ButtonLink } from "../components/ui/Button";
import { MaterialIcon } from "../components/ui/MaterialIcon";
import { useRegistration } from "../contexts/RegistrationContext";
import { useCountdown } from "../hooks/useCountdown";
import { useDocumentTitle } from "../hooks/useDocumentTitle";
import { verificationSchema, type VerificationData } from "../schema/auth.schema";
import { verifyRegistration, resendRegistrationCode } from "../services/auth.service";
import { ApiError } from "../services/api";
import { getErrorMessage } from "../utils/getErrorMessage";

export function VerifyRegistration() {
    useDocumentTitle("Verificar e-mail");
    const navigate = useNavigate();
    const { pending, renewResendCooldown, discardPendingRegistration, clearRegistration } =
        useRegistration();
    const resendIn = useCountdown(pending?.resendAvailableAt ?? 0);
    const expiresIn = useCountdown(pending?.expiresAt ?? 0);
    const [isResending, setIsResending] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const {
        register,
        handleSubmit,
        setError,
        clearErrors,
        resetField,
        formState: { errors, isSubmitting },
    } = useForm<VerificationData>({
        resolver: zodResolver(verificationSchema),
        defaultValues: { code: "" },
    });
    const backButton = <BackButton onClick={() => navigate(-1)}>Voltar</BackButton>;

    async function onSubmit(data: VerificationData) {
        if (!pending || isResending) return;
        setShowSuccess(false);
        try {
            await verifyRegistration(pending.pendingRegistrationId, data);
            clearRegistration();
            navigate("/login", { replace: true, state: { registrationSuccess: true } });
        } catch (error) {
            setError("root", {
                message: getErrorMessage(
                    error,
                    "Não foi possível confirmar o código. Tente novamente.",
                ),
            });
        }
    }

    async function onResend() {
        if (!pending || isResending || isSubmitting || resendIn > 0) return;
        setIsResending(true);
        setShowSuccess(false);
        clearErrors();
        try {
            await resendRegistrationCode(pending.pendingRegistrationId);
            renewResendCooldown(pending.pendingRegistrationId);
            resetField("code");
            setShowSuccess(true);
        } catch (error) {
            if (error instanceof ApiError && error.status === 400) {
                discardPendingRegistration(pending.pendingRegistrationId);
            }
            setError("root", {
                message: getErrorMessage(
                    error,
                    "Não foi possível reenviar o código. Tente novamente.",
                ),
            });
        } finally {
            setIsResending(false);
        }
    }

    if (!pending || expiresIn === 0) {
        return (
            <AuthLayout mobileNavigation={backButton}>
                <div className="space-y-6">
                    <div className="hidden lg:block">{backButton}</div>
                    <h1 className="font-display text-3xl font-bold text-white">
                        {pending ? "Seu cadastro expirou" : "Vamos começar de novo?"}
                    </h1>
                    <p className="text-ink-dim">
                        Preencha o cadastro para receber um novo código de verificação. Sua conta só
                        será criada após confirmar o e-mail.
                    </p>
                    <ButtonLink
                        to="/register"
                        size="lg"
                        fullWidth
                        onClick={() => discardPendingRegistration()}
                    >
                        Ir para o cadastro
                    </ButtonLink>
                    <p className="text-center text-sm text-ink-dim">
                        Já tem uma conta?{" "}
                        <Link to="/login" className="font-semibold text-brand hover:underline">
                            Entrar
                        </Link>
                    </p>
                </div>
            </AuthLayout>
        );
    }

    return (
        <AuthLayout mobileNavigation={backButton}>
            <div>
                <div className="mb-6 hidden lg:block">{backButton}</div>
                <div className="mb-6 hidden size-14 items-center justify-center rounded-2xl border border-brand/30 bg-brand/10 text-brand lg:flex">
                    <MaterialIcon name="mail" className="text-3xl!" />
                </div>
                <h1 className="font-display text-3xl font-bold text-white">Confira seu e-mail</h1>
                <p className="mt-2 leading-relaxed text-ink-dim">
                    Enviamos um código de seis dígitos para
                    <span className="mt-1 block break-all font-semibold text-ink">
                        {pending.email}
                    </span>
                </p>

                <form onSubmit={handleSubmit(onSubmit)} className="mt-8" noValidate>
                    <fieldset disabled={isSubmitting || isResending} className="min-w-0 space-y-3">
                        <AuthInput
                            label="Código de verificação"
                            type="text"
                            inputMode="numeric"
                            autoComplete="one-time-code"
                            maxLength={6}
                            placeholder="000000"
                            inputClassName="text-center font-mono text-2xl tracking-[0.35em] sm:tracking-[0.5em]"
                            registration={register("code")}
                            error={errors.code?.message}
                        />
                        <p className="text-sm leading-relaxed text-ink-dim">
                            O código vale por 10 minutos. Se não encontrar o e-mail, confira a pasta
                            de spam.
                        </p>
                    </fieldset>

                    {errors.root?.message && <Alert className="mt-6">{errors.root.message}</Alert>}
                    <SuccessAlert
                        visible={showSuccess}
                        onVisibleChange={setShowSuccess}
                        className="mt-6"
                    >
                        Novo código enviado! Confira sua caixa de entrada e a pasta de spam.
                    </SuccessAlert>

                    <Button
                        type="submit"
                        size="lg"
                        fullWidth
                        isLoading={isSubmitting}
                        loadingText="Confirmando..."
                        disabled={isResending}
                        className="mt-6"
                    >
                        Confirmar e criar conta
                    </Button>
                </form>

                <div className="mt-6 border-t border-divider pt-6">
                    <p className="mb-3 text-center text-sm text-ink-dim">Não recebeu o código?</p>
                    <Button
                        variant="secondary"
                        fullWidth
                        onClick={() => void onResend()}
                        isLoading={isResending}
                        loadingText="Reenviando..."
                        disabled={isSubmitting || resendIn > 0}
                    >
                        {resendIn > 0 ? `Reenviar código em ${resendIn}s` : "Reenviar código"}
                    </Button>
                </div>

                <p className="mt-8 text-center text-sm text-ink-dim">
                    Prefere entrar depois?{" "}
                    <Link to="/login" className="font-semibold text-brand hover:underline">
                        Ir para o login
                    </Link>
                </p>
            </div>
        </AuthLayout>
    );
}
