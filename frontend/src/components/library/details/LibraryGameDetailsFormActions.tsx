import { Button } from "../../ui/Button";
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
                <Button
                    type="submit"
                    disabled={!isDirty}
                    isLoading={isSaving}
                    loadingText="Salvando..."
                    className={isSaved
                        ? "bg-green-500! hover:bg-green-500! disabled:opacity-100"
                        : ""
                    }
                >
                    {isSaved ? (
                        <>
                            <MaterialIcon
                                name="check"
                                className="text-lg!"
                            />

                            Salvo!
                        </>
                    ) : (
                        "Salvar alterações"
                    )}
                </Button>

                {isDirty && (
                    <Button
                        variant="secondary"
                        disabled={isSaving}
                        onClick={onDiscardChanges}
                    >
                        <MaterialIcon
                            name="undo"
                            className="text-lg!"
                        />

                        Descartar alterações
                    </Button>
                )}

                <Button
                    variant="danger"
                    disabled={isSaving}
                    isLoading={isDeleting}
                    loadingText="Removendo..."
                    onClick={onRemove}
                >
                    <MaterialIcon
                        name="delete"
                        className="text-lg!"
                    />

                    Remover
                </Button>
            </div>
        </div>
    );
}
