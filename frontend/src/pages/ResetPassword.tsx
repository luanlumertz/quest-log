import { useNavigate } from "react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AuthStepLayout } from "../components/auth/AuthStepLayout";
import { NewPasswordFields } from "../components/auth/NewPasswordFields";
import { Alert } from "../components/ui/Alert";
import { Button, ButtonLink } from "../components/ui/Button";
import { usePasswordRecovery } from "../contexts/PasswordRecoveryContext";
import { usePasswordChangeSuccess } from "../hooks/auth.hook";
import { useCountdown } from "../hooks/useCountdown";
import { useDocumentTitle } from "../hooks/useDocumentTitle";
import {
    resetPasswordSchema,
    type ResetPasswordData,
    type ResetPasswordFormData,
} from "../schema/auth.schema";
import { resetPassword } from "../services/auth.service";
import { ApiError } from "../services/api";
import { getErrorMessage } from "../utils/getErrorMessage";

export function ResetPassword() {
    useDocumentTitle("Criar nova senha");
    const navigate = useNavigate();
    const { recovery, authorization, discardAuthorization, clearRecovery } = usePasswordRecovery();
    const completePasswordChange = usePasswordChangeSuccess();
    const expiresIn = useCountdown(authorization?.expiresAt ?? 0);
    const {
        register,
        handleSubmit,
        setError,
        reset,
        formState: { errors, isSubmitting },
    } = useForm<ResetPasswordFormData, unknown, ResetPasswordData>({
        resolver: zodResolver(resetPasswordSchema),
        defaultValues: { password: "", confirmPassword: "" },
    });

    async function onSubmit(data: ResetPasswordData) {
        if (!authorization || expiresIn === 0) {
            discardAuthorization();
            return;
        }

        try {
            await resetPassword(authorization.resetToken, data);
            reset();
            clearRecovery();
            completePasswordChange(recovery?.email);
        } catch (error) {
            if (error instanceof ApiError && error.status === 422) {
                setError("password", { message: error.message });
                return;
            }

            if (error instanceof ApiError && error.status === 400) discardAuthorization();
            setError("root", {
                message: getErrorMessage(
                    error,
                    "Não foi possível redefinir sua senha. Tente novamente.",
                ),
            });
        }
    }

    if (!authorization || expiresIn === 0) {
        return (
            <AuthStepLayout
                title="Solicite um novo código"
                icon="lock"
                onBack={() => navigate("/forgot-password")}
                description={
                    <p>
                        Sua autorização não está disponível ou expirou. Confirme um novo código para
                        definir sua senha.
                    </p>
                }
            >
                {errors.root?.message && <Alert className="mt-6">{errors.root.message}</Alert>}
                <ButtonLink to="/forgot-password" size="lg" fullWidth className="mt-6">
                    Recuperar senha
                </ButtonLink>
            </AuthStepLayout>
        );
    }

    return (
        <AuthStepLayout
            title="Crie sua nova senha"
            icon="lock"
            onBack={() => navigate("/forgot-password")}
            description={
                <p>
                    Escolha uma senha com pelo menos 8 caracteres. Depois de salvar, entre novamente
                    na sua conta.
                </p>
            }
        >
            <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-6" noValidate>
                <fieldset disabled={isSubmitting} className="min-w-0 space-y-6">
                    <NewPasswordFields
                        passwordRegistration={register("password")}
                        confirmationRegistration={register("confirmPassword")}
                        passwordError={errors.password?.message}
                        confirmationError={errors.confirmPassword?.message}
                    />
                </fieldset>
                <p className="text-sm leading-relaxed text-ink-dim">
                    Todas as sessões abertas serão encerradas ao alterar a senha.
                </p>
                {errors.root?.message && <Alert>{errors.root.message}</Alert>}
                <Button
                    type="submit"
                    size="lg"
                    fullWidth
                    isLoading={isSubmitting}
                    loadingText="Salvando..."
                >
                    Salvar nova senha
                </Button>
            </form>
        </AuthStepLayout>
    );
}
