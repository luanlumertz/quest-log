import { useId, type ReactNode } from "react";
import { Button, type ButtonVariant } from "./Button";
import { MaterialIcon, type MaterialIconName } from "./MaterialIcon";
import { Modal } from "./Modal";
import { Alert } from "./Alert";

type ConfirmVariant = Extract<ButtonVariant, "primary" | "danger">;

type ConfirmModalProps = {
    icon: MaterialIconName;
    title: string;
    description?: ReactNode;
    children?: ReactNode;
    error?: string;

    confirmText: string;
    cancelText?: string;
    loadingText?: string;

    variant?: ConfirmVariant;
    isLoading?: boolean;

    onConfirm: () => void;
    onCancel: () => void;
};

export function ConfirmModal({
    icon,
    title,
    description,
    children,
    error,

    confirmText,
    cancelText = "Cancelar",
    loadingText,

    variant = "primary",
    isLoading = false,

    onConfirm,
    onCancel
}: ConfirmModalProps) {
    const titleId = useId();
    const descriptionId = useId();

    const isDanger = variant === "danger";

    return (
        <Modal
            onClose={onCancel}
            preventClose={isLoading}
            ariaLabelledBy={titleId}
            ariaDescribedBy={description ? descriptionId : undefined}
        >
            <div className="p-5">
                <div className="flex items-center gap-4">
                    <div
                        className={`
                            flex size-10
                            shrink-0
                            items-center justify-center
                            rounded-xl
                            border
                            ${isDanger
                                ? `
                                        border-danger/30
                                        bg-danger/10
                                        text-danger
                                    `
                                : `
                                        border-brand/30
                                        bg-brand/10
                                        text-brand
                                    `
                            }
                        `}
                    >
                        <MaterialIcon
                            name={icon}
                        />
                    </div>

                    <div className="min-w-0">
                        <h2
                            id={titleId}
                            className="
                                font-display
                                text-lg
                                font-bold
                                text-ink
                            "
                        >
                            {title}
                        </h2>

                        {description && (
                            <div
                                id={descriptionId}
                                className="
                                    mt-1
                                    text-sm
                                    leading-relaxed
                                    text-ink-dim
                                "
                            >
                                {description}
                            </div>
                        )}
                    </div>
                </div>

                {children && (
                    <div className="mt-4">
                        {children}
                    </div>
                )}

                {error && (
                    <Alert className="mt-4">
                        {error}
                    </Alert>
                )}

                <div className="mt-5 grid grid-cols-2 gap-3">
                    <Button
                        variant="secondary"
                        disabled={isLoading}
                        onClick={onCancel}
                        fullWidth
                    >
                        {cancelText}
                    </Button>

                    <Button
                        variant={variant}
                        isLoading={isLoading}
                        loadingText={loadingText}
                        onClick={onConfirm}
                        fullWidth
                    >
                        {confirmText}
                    </Button>
                </div>
            </div>
        </Modal>
    );
}
