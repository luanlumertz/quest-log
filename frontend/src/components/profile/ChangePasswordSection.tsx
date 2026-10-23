import { useState } from "react";
import { Link } from "react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AuthInput } from "../auth/AuthInput";
import { NewPasswordFields } from "../auth/NewPasswordFields";
import { Alert } from "../ui/Alert";
import { Button } from "../ui/Button";
import { SuccessAlert } from "../ui/SuccessAlert";
import { storePasswordRecovery } from "../../lib/passwordRecoverySession";
import {
    changePasswordSchema,
    type ChangePasswordData,
    type ChangePasswordFormData,
} from "../../schema/auth.schema";
import { changePassword } from "../../services/auth.service";
import { ApiError } from "../../services/api";
import { getErrorMessage } from "../../utils/getErrorMessage";

type ChangePasswordSectionProps = {
    email: string;
    disabled: boolean;
    onChangingChange: (changing: boolean) => void;
};

export function ChangePasswordSection({
    email,
    disabled,
    onChangingChange,
}: ChangePasswordSectionProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const {
        register,
        handleSubmit,
        reset,
        setError,
        formState: { errors, isSubmitting },
    } = useForm<ChangePasswordFormData, unknown, ChangePasswordData>({
        resolver: zodResolver(changePasswordSchema),
        defaultValues: { currentPassword: "", password: "", confirmPassword: "" },
    });

    function handleCancel() {
        reset();
        setIsEditing(false);
    }

    async function onSubmit(data: ChangePasswordData) {
        if (disabled) return;
        setShowSuccess(false);
        onChangingChange(true);

        try {
            await changePassword(data);
            reset();
            setIsEditing(false);
            storePasswordRecovery(null);
            setShowSuccess(true);
        } catch (error) {
            if (error instanceof ApiError && error.status === 422) {
                setError("password", { message: error.message });
                return;
            }

            setError("root", {
                message: getErrorMessage(
                    error,
                    "Não foi possível alterar sua senha. Tente novamente.",
                ),
            });
        } finally {
            onChangingChange(false);
        }
    }

    return (
        <section className="mt-4 overflow-hidden rounded-2xl border border-divider bg-surface">
            <div className="border-b border-divider px-5 py-4">
                <h2 className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-mute">
                    Segurança
                </h2>
            </div>
            <div className="px-5 py-5">
                {isEditing ? (
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
                        <fieldset disabled={disabled || isSubmitting} className="min-w-0 space-y-5">
                            <AuthInput
                                label="Senha atual"
                                type="password"
                                placeholder="Digite sua senha atual"
                                autoComplete="current-password"
                                registration={register("currentPassword")}
                                error={errors.currentPassword?.message}
                            />
                            <NewPasswordFields
                                passwordRegistration={register("password")}
                                confirmationRegistration={register("confirmPassword")}
                                passwordError={errors.password?.message}
                                confirmationError={errors.confirmPassword?.message}
                            />
                        </fieldset>
                        <p className="text-xs leading-relaxed text-ink-dim">
                            Use pelo menos 8 caracteres. As outras sessões serão encerradas. Você
                            continuará conectado neste navegador.
                        </p>
                        {errors.root?.message && <Alert>{errors.root.message}</Alert>}
                        <div className="flex flex-col gap-2 min-[420px]:flex-row">
                            <Button
                                type="submit"
                                size="sm"
                                disabled={disabled}
                                isLoading={isSubmitting}
                                loadingText="Salvando..."
                            >
                                Salvar nova senha
                            </Button>
                            <Button
                                variant="secondary"
                                size="sm"
                                disabled={isSubmitting || disabled}
                                onClick={handleCancel}
                            >
                                Cancelar
                            </Button>
                        </div>
                        {!isSubmitting && !disabled && (
                            <Link
                                to="/forgot-password"
                                state={{ email }}
                                className="inline-block text-sm font-semibold text-brand hover:underline"
                            >
                                Esqueci minha senha atual
                            </Link>
                        )}
                    </form>
                ) : (
                    <div className="flex flex-col items-stretch gap-3 min-[420px]:flex-row min-[420px]:items-center min-[420px]:justify-between">
                        <div>
                            <p className="text-sm font-medium text-ink">Senha</p>
                            <p className="mt-1 text-xs text-ink-mute">
                                Atualize a senha da sua conta.
                            </p>
                        </div>
                        <Button
                            variant="secondary"
                            size="sm"
                            disabled={disabled}
                            onClick={() => {
                                setShowSuccess(false);
                                setIsEditing(true);
                            }}
                            className="shrink-0"
                        >
                            Alterar senha
                        </Button>
                    </div>
                )}
                <SuccessAlert
                    visible={showSuccess}
                    onVisibleChange={setShowSuccess}
                    className="mt-5"
                >
                    Senha alterada com sucesso!
                </SuccessAlert>
            </div>
        </section>
    );
}
