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
                        <span className="material-symbols-rounded">
                            delete
                        </span>
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
                    <button
                        type="button"
                        disabled={isDeleting}
                        onClick={onCancel}
                        className="
                            min-h-10
                            cursor-pointer
                            rounded-xl
                            border
                            border-divider-bright
                            px-4
                            text-sm
                            font-semibold
                            text-ink-dim
                            transition-colors
                            hover:text-ink
                            disabled:cursor-not-allowed
                            disabled:opacity-50
                        "
                    >
                        Cancelar
                    </button>

                    <button
                        type="button"
                        disabled={isDeleting}
                        onClick={onConfirm}
                        className="
                            flex min-h-10
                            cursor-pointer
                            items-center gap-2
                            rounded-xl
                            bg-danger
                            px-4
                            text-sm
                            font-semibold
                            text-white
                            transition-opacity
                            hover:opacity-90
                            disabled:cursor-not-allowed
                            disabled:opacity-50
                        "
                    >
                        {isDeleting ? ("Removendo...") : (
                            <>
                                <span className="material-symbols-rounded text-lg!">
                                    delete
                                </span>
                                
                                Remover
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
