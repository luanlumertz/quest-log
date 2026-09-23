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
        <div
            className="
                fixed inset-0 z-50
                flex items-center justify-center
                bg-black/75 px-4
            "
            onKeyDown={(event) => {
                if (event.key === "Escape" && !isDeleting) {
                    onCancel();
                }
            }}
        >
            <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="delete-account-title"
                aria-describedby="delete-account-description"
                className="
                    w-full max-w-90
                    rounded-2xl
                    border border-divider-bright
                    bg-surface
                    p-6
                    shadow-2xl
                "
            >
                <div
                    className="
                        flex size-10
                        items-center justify-center
                        rounded-xl
                        border border-danger/30
                        bg-danger/10
                        text-red-300
                    "
                >
                    <span className="material-symbols-rounded">
                        delete
                    </span>
                </div>

                <h2
                    id="delete-account-title"
                    className="
                        mt-4
                        font-display
                        text-xl font-bold text-ink
                    "
                >
                    Excluir conta?
                </h2>

                <p
                    id="delete-account-description"
                    className="mt-2 text-sm leading-relaxed text-ink-dim"
                >
                    Isso excluirá permanentemente sua conta do QuestLog, incluindo toda a sua biblioteca de jogos, avaliações e horas registradas.
                </p>

                <p className="mt-2 text-sm font-semibold text-red-400">
                    Esta ação não pode ser desfeita.
                </p>

                {error && (
                    <p
                        role="alert"
                        className="
                            mt-4 rounded-xl
                            border border-danger/30
                            bg-danger/10
                            px-3 py-2
                            text-xs text-danger
                        "
                    >
                        {error}
                    </p>
                )}

                <div className="mt-5 grid grid-cols-2 gap-3">
                    <button
                        type="button"
                        autoFocus
                        disabled={isDeleting}
                        onClick={onCancel}
                        className="
                            min-h-11 rounded-xl
                            border border-divider-bright
                            px-3
                            text-sm font-semibold text-ink-dim
                            transition-colors
                            hover:text-ink
                            cursor-pointer
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
                            min-h-11 rounded-xl
                            bg-red-600
                            px-3
                            text-sm font-semibold text-white
                            transition-colors
                            hover:bg-red-700
                            cursor-pointer
                            disabled:cursor-not-allowed
                            disabled:opacity-50
                        "
                    >
                        {isDeleting ? "Excluindo..." : "Excluir Conta"}
                    </button>
                </div>
            </div>
        </div>
    );
}
