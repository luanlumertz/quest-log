import type { DataLossField } from "./libraryGameDetailsForm.rules";
import { ConfirmModal } from "../../ui/ConfirmModal";

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

export function ConfirmDataLossModal({
    fields,
    onConfirm,
    onCancel
}: ConfirmDataLossModalProps) {
    return (
        <ConfirmModal
            icon="error"
            title="Alguns dados serão removidos ao salvar"
            description="Ao salvar, os seguintes dados que estavam registrados serão removidos:"
            confirmText="Salvar mesmo assim"
            cancelText="Voltar"
            variant="danger"
            onConfirm={onConfirm}
            onCancel={onCancel}
        >
            <ul
                className="
                    space-y-2
                    rounded-xl
                    border border-divider
                    bg-surface-raised
                    p-3
                "
            >
                {fields.map((field) => (
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
                        <span
                            className="
                                size-1.5
                                shrink-0
                                rounded-full
                                bg-danger
                            "
                        />

                        {DATA_LOSS_FIELD_LABELS[field]}
                    </li>
                ))}
            </ul>
        </ConfirmModal>
    );
}
