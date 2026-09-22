type LibraryGameDetailsFormActionsProps = {
    isSaving: boolean;
    isDirty: boolean;
    isSaved: boolean;
    onDiscardChanges: () => void;
};

export function LibraryGameDetailsFormActions({
    isSaving,
    isDirty,
    isSaved,
    onDiscardChanges
}: LibraryGameDetailsFormActionsProps) {
    return (
        <div className="mt-7 border-t border-divider pt-5">
            <div className="flex flex-wrap gap-3">
                <button
                    type="submit"
                    disabled={isSaving || !isDirty}
                    className={`
                        flex min-h-11
                        items-center gap-2
                        rounded-xl
                        px-5
                        text-sm
                        font-semibold
                        text-white
                        transition-colors
                        disabled:cursor-not-allowed
                        cursor-pointer
                        ${isSaved
                            ? "bg-green-500 disabled:opacity-100"
                            : "bg-brand hover:bg-brand-dim disabled:opacity-50"
                        }
                    `}
                >
                    {isSaving ? ("Salvando...") : isSaved ? (
                        <>
                            <span className="material-symbols-rounded text-lg!">
                                check
                            </span>

                            Salvo!
                        </>
                    ) : ("Salvar alterações")}
                </button>

                {isDirty && (
                    <button
                        type="button"
                        disabled={isSaving}
                        onClick={
                            onDiscardChanges
                        }
                        className="
                            flex min-h-11
                            cursor-pointer
                            items-center gap-2
                            rounded-xl
                            border
                            border-divider-bright
                            px-4
                            text-sm
                            font-medium
                            text-ink-dim
                            transition-colors
                            hover:text-ink
                            disabled:cursor-not-allowed
                            disabled:opacity-50
                        "
                    >
                        <span className="material-symbols-rounded text-lg!">
                            undo
                        </span>

                        Descartar alterações
                    </button>
                )}

                <button
                    type="button"
                    disabled
                    className="
                        flex min-h-11
                        items-center gap-2
                        rounded-xl
                        border
                        border-divider-bright
                        px-4
                        text-sm
                        font-medium
                        text-ink-mute
                        opacity-50
                        cursor-not-allowed
                    "
                >
                    <span className="material-symbols-rounded text-lg!">
                        delete
                    </span>

                    Remover
                </button>
            </div>
        </div>
    );
}
