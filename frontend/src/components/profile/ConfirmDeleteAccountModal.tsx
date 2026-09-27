import { ConfirmModal } from "../ui/ConfirmModal";

type ConfirmDeleteAccountModalProps = {
    isDeleting: boolean;
    error?: string;
    onConfirm: () => void;
    onCancel: () => void;
};

export function ConfirmDeleteAccountModal({
    isDeleting,
    error,
    onConfirm,
    onCancel
}: ConfirmDeleteAccountModalProps) {
    return (
        <ConfirmModal
            icon="delete"
            title="Excluir conta?"
            description={
                <>
                    <p>
                        Isso excluirá permanentemente sua conta do QuestLog, 
                        incluindo toda a sua biblioteca de jogos, avaliações e horas registradas.
                    </p>

                    <p className="mt-2 font-semibold text-danger">
                        Esta ação não pode ser desfeita.
                    </p>
                </>
            }
            confirmText="Excluir conta"
            loadingText="Excluindo..."
            variant="danger"
            isLoading={isDeleting}
            error={error}
            onConfirm={onConfirm}
            onCancel={onCancel}
        />
    );
}
