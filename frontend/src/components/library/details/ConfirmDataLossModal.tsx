import type { DataLossField } from "./libraryGameDetailsForm.rules";

type ConfirmDataLossModalProps = {
    fields: DataLossField[];
    onConfirm: () => void;
    onCancel: () => void;
};

const DATA_LOSS_FIELD_LABELS: Record<DataLossField, string> = {
    rating: "Nota",
    playtimeMinutes: "Horas jogadas",
    startedAt: "Data de início",
    completedAt: "Data de conclusão"
};

export function ConfirmDataLossModal({ fields, onConfirm, onCancel }: ConfirmDataLossModalProps) {
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
                aria-labelledby="data-loss-title"
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
                            error
                        </span>
                    </div>

                    <div>
                        <h2
                            id="data-loss-title"
                            className="
                                font-display
                                text-lg
                                font-bold
                                text-ink
                            "
                        >
                            Alguns dados serão removidos ao salvar
                        </h2>

                        <p className="mt-1 text-sm text-ink-dim">
                            Ao salvar, os seguintes dados que estavam registrados serão removidos:
                        </p>
                    </div>
                </div>

                <ul
                    className="
                        mt-4 space-y-2
                        rounded-xl
                        border
                        border-divider
                        bg-surface-raised
                        p-3
                    "
                >
                    {fields.map(
                        (field) => (
                            <li
                                key={field}
                                className="
                                    flex
                                    items-center
                                    gap-2
                                    text-sm
                                    text-ink
                                "
                            >
                                <span className="size-1.5 rounded-full bg-danger" />

                                {DATA_LOSS_FIELD_LABELS[field]}
                            </li>
                        )
                    )}
                </ul>

                <div className="mt-5 flex justify-end gap-3">
                    <button
                        type="button"
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
                        "
                    >
                        Voltar
                    </button>

                    <button
                        type="button"
                        onClick={onConfirm}
                        className="
                            min-h-10
                            cursor-pointer
                            rounded-xl
                            bg-danger
                            px-4
                            text-sm
                            font-semibold
                            text-white
                            transition-opacity
                            hover:opacity-90
                        "
                    >
                        Salvar mesmo assim
                    </button>
                </div>
            </div>
        </div>
    );
}
