import { Button } from "../../ui/Button";
import { MaterialIcon } from "../../ui/MaterialIcon";

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
        <div
            className="
                fixed inset-0 z-50
                flex items-center
                justify-center
                bg-black/70
                px-4
            "
        >
            <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="delete-entry-title"
                className="
                    w-full max-w-md
                    rounded-2xl
                    border
                    border-divider-bright
                    bg-surface
                    p-5
                    shadow-2xl
                "
            >
                <div className="flex items-start gap-3">
                    <div
                        className="
                            flex size-10
                            shrink-0
                            items-center
                            justify-center
                            rounded-xl
                            bg-danger/10
                            text-danger
                        "
                    >
                        <MaterialIcon
                            name="delete"
                        />
                    </div>

                    <div>
                        <h2
                            id="delete-entry-title"
                            className="
                                font-display
                                text-lg
                                font-bold
                                text-ink
                            "
                        >
                            Remover da biblioteca?
                        </h2>

                        <p className="mt-1 text-sm text-ink-dim">
                            <strong className="font-semibold text-ink">
                                {gameTitle}
                            </strong>{" "}
                            será removido da sua biblioteca. Os dados registrados para este jogo também serão removidos.
                        </p>
                    </div>
                </div>

                {error && (
                    <p
                        role="alert"
                        className="
                            mt-4
                            rounded-xl
                            border
                          border-danger/30
                          bg-danger/10
                            px-3 py-2
                            text-sm
                          text-danger
                        "
                    >
                        {error}
                    </p>
                )}

                <div className="mt-5 flex justify-end gap-3">
                    <Button
                        variant="secondary"
                        disabled={isDeleting}
                        onClick={onCancel}
                    >
                        Cancelar
                    </Button>

                    <Button
                        variant="danger"
                        isLoading={isDeleting}
                        loadingText="Removendo..."
                        onClick={onConfirm}
                    >
                        <MaterialIcon
                            name="delete"
                            className="text-lg!"
                        />

                        Remover
                    </Button>
                </div>
            </div>
        </div>
    );
}
