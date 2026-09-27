import { ConfirmModal } from "../../ui/ConfirmModal";

type ConfirmDeleteLibraryEntryModalProps = {
    gameTitle: string;
    isDeleting: boolean;
    error?: string;
    onConfirm: () => void;
    onCancel: () => void;
};

export function ConfirmDeleteLibraryEntryModal({
    gameTitle,
    isDeleting,
    error,
    onConfirm,
    onCancel
}: ConfirmDeleteLibraryEntryModalProps) {
    return (
        <ConfirmModal
            icon="delete"
            title="Remover da biblioteca?"
            description={
                <>
                    <strong className="font-semibold text-ink">
                        {gameTitle}
                    </strong>{" "}
                    será removido da sua biblioteca. 
                    Os dados registrados para este jogo também serão removidos.
                </>
            }
            confirmText="Remover"
            loadingText="Removendo..."
            variant="danger"
            isLoading={isDeleting}
            error={error}
            onConfirm={onConfirm}
            onCancel={onCancel}
        />
    );
}
