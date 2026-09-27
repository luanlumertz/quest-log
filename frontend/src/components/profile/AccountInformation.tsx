import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { useUpdateCurrentUser } from "../../hooks/auth.hook";
import { updateSchema, type UpdateData } from "../../schema/auth.schema";
import type { User } from "../../types/auth.types";
import { Button } from "../ui/Button";
import { getErrorMessage } from "../../utils/getErrorMessage";
import { Alert } from "../ui/Alert";

type AccountInformationProps = {
    user: User;
    disabled: boolean;
    onUpdatingChange: (updating: boolean) => void;
};

// Retira apenas os espaços excedentes; preserva maiúsculas e minúsculas.
const normalizeName = (name: string) => name.trim().replace(/\s+/g, " ");

export function AccountInformation({
    user,
    disabled,
    onUpdatingChange
}: AccountInformationProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [updateError, setUpdateError] = useState("");

    const {
        mutateAsync: updateUser,
        isPending: isUpdating
    } = useUpdateCurrentUser();

    const {
        register,
        handleSubmit,
        reset,
        watch,
        setValue,
        formState: { errors, isValid }
    } = useForm<UpdateData>({
        resolver: zodResolver(updateSchema),
        mode: "onChange",
        defaultValues: { name: user.name }
    });

    const watchedName = watch("name");
    const hasChanges = normalizeName(watchedName ?? "") !== normalizeName(user.name);

    // Dados externos não sobrescrevem o que a pessoa está digitando.
    useEffect(() => {
        if (!isEditing) {
            reset({ name: user.name });
        }
    }, [user.name, isEditing, reset]);

    // Após 3 segundos, inicia um fade-out de 300 ms.
    useEffect(() => {
        if (!showSuccess) return;

        const timeout = setTimeout(() => setShowSuccess(false), 3000);
        return () => clearTimeout(timeout);
    }, [showSuccess]);

    function handleEdit() {
        setShowSuccess(false);
        setUpdateError("");
        reset({ name: user.name });
        setIsEditing(true);
    }

    function handleCancelEdit() {
        reset({ name: user.name });
        setUpdateError("");
        setIsEditing(false);
    }

    async function handleSave(data: UpdateData) {
        if (!hasChanges || disabled) return;

        setShowSuccess(false);
        setUpdateError("");
        onUpdatingChange(true);

        try {
            await updateUser(data);
            setIsEditing(false);
            setShowSuccess(true);
        } catch (error) {
            setUpdateError(
                getErrorMessage(
                    error,
                    "Não foi possível atualizar seu nome."
                )
            );
        } finally {
            onUpdatingChange(false);
        }
    }

    return (
        <section className="mt-8 overflow-hidden rounded-2xl border border-divider bg-surface">
            <div className="border-b border-divider px-5 py-4">
                <h2 className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-mute">
                    Informações da conta
                </h2>
            </div>

            <div className="px-5 py-5">
                <div>
                    <p className="mb-3 text-[11px] font-semibold uppercase tracking-widest text-ink-mute">
                        Nome
                    </p>

                    {isEditing ? (
                        <form onSubmit={handleSubmit(handleSave)}>
                            <input
                                {...register("name", {
                                    onBlur: (event) => {
                                        setValue(
                                            "name",
                                            normalizeName(event.target.value),
                                            { shouldValidate: true, shouldDirty: true }
                                        );
                                    }
                                })}
                                type="text"
                                aria-label="Nome"
                                autoComplete="name"
                                autoFocus
                                disabled={isUpdating || disabled}
                                aria-invalid={!!errors.name}
                                className="
                                    h-11 w-full rounded-xl
                                    border border-divider-bright bg-surface px-3
                                    text-sm text-ink outline-none transition-colors
                                    focus:border-brand focus:ring-1 focus:ring-brand
                                    disabled:opacity-50
                                "
                            />

                            {errors.name && (
                                <p role="alert" className="mt-2 text-xs text-danger">
                                    {errors.name.message}
                                </p>
                            )}

                            {updateError && (
                                <Alert className="mt-3">
                                    {updateError}
                                </Alert>
                            )}

                            <div className="mt-3 flex items-center gap-2">
                                <Button
                                    type="submit"
                                    size="sm"
                                    disabled={disabled || !hasChanges || !isValid}
                                    isLoading={isUpdating}
                                    loadingText="Salvando..."
                                >
                                    Salvar
                                </Button>

                                <Button
                                    variant="secondary"
                                    size="sm"
                                    onClick={handleCancelEdit}
                                    disabled={isUpdating || disabled}
                                >
                                    Cancelar
                                </Button>
                            </div>
                        </form>
                    ) : (
                        <div className="flex items-center justify-between gap-4">
                            <p className="min-w-0 wrap-break-word text-sm font-medium text-ink">
                                {user.name}
                            </p>

                            <Button
                                variant="secondary"
                                size="sm"
                                onClick={handleEdit}
                                disabled={disabled}
                                className="shrink-0"
                            >
                                Editar
                            </Button>
                        </div>
                    )}

                    <div
                        aria-hidden={!showSuccess}
                        className={`
                            overflow-hidden
                            transition-[max-height,opacity,transform,margin]
                            duration-300 ease-in-out motion-reduce:transition-none
                            ${showSuccess
                                ? "mt-5 max-h-20 translate-y-0 opacity-100"
                                : "pointer-events-none mt-0 max-h-0 -translate-y-1 opacity-0"
                            }
                        `}
                    >
                        <Alert variant="success">
                            Nome atualizado com sucesso!
                        </Alert>
                    </div>
                </div>

                <div className="mt-5">
                    <p className="mb-3 text-[11px] font-semibold uppercase tracking-widest text-ink-mute">
                        Email
                    </p>
                    <p className="break-all text-sm text-ink-dim">{user.email}</p>
                </div>
            </div>
        </section>
    );
}
