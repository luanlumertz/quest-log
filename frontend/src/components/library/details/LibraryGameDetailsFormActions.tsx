import { MaterialIcon } from "../../ui/MaterialIcon";

type LibraryGameDetailsFormActionsProps = {
    isSaving: boolean;
    isDeleting: boolean;
    isDirty: boolean;
    isSaved: boolean;
    onDiscardChanges: () => void;
    onRemove: () => void;
};

export function LibraryGameDetailsFormActions({
    isSaving,
    isDeleting,
    isDirty,
    isSaved,
    onDiscardChanges,
    onRemove
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
                            <MaterialIcon
                                name="check"
                                className="text-lg!"
                            />

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
                        <MaterialIcon
                            name="undo"
                            className="text-lg!"
                        />

                        Descartar alterações
                    </button>
                )}

                <button
                    type="button"
                    disabled={isSaving || isDeleting}
                    onClick={onRemove}
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
                       text-ink-mute
                        transition-colors
                       hover:border-danger/50
                       hover:text-danger
                        disabled:cursor-not-allowed
                        disabled:opacity-50
                    "
                >
                    <MaterialIcon
                        name="delete"
                        className="text-lg!"
                    />

                    {isDeleting ? "Removendo..." : "Remover"}
                </button>
            </div>
        </div>
    );
}
