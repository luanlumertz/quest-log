import { useState } from "react";

import { useAuth } from "../contexts/AuthContext";
import { useDeleteCurrentUser } from "../hooks/auth.hook";

import { AccountInformation } from "../components/profile/AccountInformation";
import { LogoutSection } from "../components/profile/LogoutSection";
import { DangerZone } from "../components/profile/DangerZone";
import { ConfirmDeleteAccountModal } from "../components/profile/ConfirmDeleteAccountModal";

export function Profile() {
    const { user, isLoading, signOut } = useAuth();

    const [isUpdating, setIsUpdating] = useState(false);
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const [logoutError, setLogoutError] = useState("");
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

    const {
        mutateAsync: deleteUser,
        isPending: isDeleting,
        error: deleteError,
        reset: resetDelete
    } = useDeleteCurrentUser();

    async function handleLogout() {
        setLogoutError("");
        setIsLoggingOut(true);

        try {
            await signOut();
        } catch (error) {
            setLogoutError(error instanceof Error
                ? error.message
                : "Não foi possível encerrar a sessão."
            );
        } finally {
            setIsLoggingOut(false);
        }
    }

    function handleOpenDeleteModal() {
        resetDelete();
        setIsDeleteModalOpen(true);
    }

    function handleCloseDeleteModal() {
        if (isDeleting) return;

        resetDelete();
        setIsDeleteModalOpen(false);
    }

    async function handleConfirmDelete() {
        try {
            await deleteUser();
            // O hook limpa a sessão e o ProtectedRoute redireciona.
        } catch {
            // O erro da mutation aparece dentro do modal.
        }
    }

    if (isLoading) {
        return (
            <div className="py-10 text-center text-sm text-ink-dim">
                Carregando perfil...
            </div>
        );
    }

    if (!user) return null;

    return (
        <>
            <div className="mx-auto w-full max-w-142.5 py-8">
                <h1 className="font-display text-3xl font-bold text-white">
                    Meu Perfil
                </h1>

                <AccountInformation
                    user={user}
                    disabled={isLoggingOut || isDeleting}
                    onUpdatingChange={setIsUpdating}
                />

                <LogoutSection
                    isLoggingOut={isLoggingOut}
                    logoutError={logoutError}
                    disabled={isUpdating || isDeleting}
                    onLogout={handleLogout}
                />

                <DangerZone
                    disabled={isUpdating || isLoggingOut || isDeleting}
                    onDelete={handleOpenDeleteModal}
                />
            </div>

            {isDeleteModalOpen && (
                <ConfirmDeleteAccountModal
                    isDeleting={isDeleting}
                    error={deleteError instanceof Error
                        ? deleteError.message
                        : undefined
                    }
                    onConfirm={handleConfirmDelete}
                    onCancel={handleCloseDeleteModal}
                />
            )}
        </>
    );
}
