import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AuthInput } from "./AuthInput";
import { Alert } from "../ui/Alert";
import { SuccessAlert } from "../ui/SuccessAlert";
import { Button } from "../ui/Button";
import { useCountdown } from "../../hooks/useCountdown";
import { verificationSchema, type VerificationData } from "../../schema/auth.schema";
import { getErrorMessage } from "../../utils/getErrorMessage";

type VerificationCodeFormProps = {
    resendAvailableAt: number;
    onVerify: (data: VerificationData) => Promise<void>;
    onResend: () => Promise<void>;
    submitLabel: string;
    resendSuccessMessage: string;
};

export function VerificationCodeForm({
    resendAvailableAt,
    onVerify,
    onResend,
    submitLabel,
    resendSuccessMessage,
}: VerificationCodeFormProps) {
    const resendIn = useCountdown(resendAvailableAt);
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

    async function handleVerify(data: VerificationData) {
        if (isResending) return;
        setShowSuccess(false);

        try {
            await onVerify(data);
        } catch (error) {
            setError("root", {
                message: getErrorMessage(
                    error,
                    "Não foi possível confirmar o código. Tente novamente.",
                ),
            });
        }
    }

    async function handleResend() {
        if (isResending || isSubmitting || resendIn > 0) return;
        setIsResending(true);
        setShowSuccess(false);
        clearErrors();

        try {
            await onResend();
            resetField("code");
            setShowSuccess(true);
        } catch (error) {
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

    return (
        <>
            <form onSubmit={handleSubmit(handleVerify)} className="mt-8" noValidate>
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
                        O código vale por 10 minutos. Se não encontrar o e-mail, confira a pasta de
                        spam.
                    </p>
                </fieldset>

                {errors.root?.message && <Alert className="mt-6">{errors.root.message}</Alert>}
                <SuccessAlert
                    visible={showSuccess}
                    onVisibleChange={setShowSuccess}
                    className="mt-6"
                >
                    {resendSuccessMessage}
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
                    {submitLabel}
                </Button>
            </form>

            <div className="mt-6 border-t border-divider pt-6">
                <p className="mb-3 text-center text-sm text-ink-dim">Não recebeu o código?</p>
                <Button
                    variant="secondary"
                    fullWidth
                    onClick={() => void handleResend()}
                    isLoading={isResending}
                    loadingText="Reenviando..."
                    disabled={isSubmitting || resendIn > 0}
                >
                    {resendIn > 0 ? `Reenviar código em ${resendIn}s` : "Reenviar código"}
                </Button>
            </div>
        </>
    );
}
