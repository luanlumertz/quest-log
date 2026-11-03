import type { ReactNode } from "react";
import { Button, type ButtonSize, type ButtonVariant } from "./Button";
import { StateView } from "./StateView";

type RetryErrorStateProps = {
    title: string;
    description?: ReactNode;
    onRetry: () => void;
    isRetrying?: boolean;
    className?: string;
    buttonVariant?: ButtonVariant;
    buttonSize?: ButtonSize;
};

export function RetryErrorState({
    title,
    description = "Tente novamente em alguns instantes.",
    onRetry,
    isRetrying = false,
    className,
    buttonVariant = "primary",
    buttonSize = "md",
}: RetryErrorStateProps) {
    return (
        <StateView
            icon="error"
            tone="danger"
            title={title}
            description={description}
            className={className}
            action={
                <Button
                    variant={buttonVariant}
                    size={buttonSize}
                    isLoading={isRetrying}
                    loadingText="Tentando..."
                    onClick={onRetry}
                >
                    Tentar novamente
                </Button>
            }
        />
    );
}
