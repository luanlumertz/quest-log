import type { ReactNode } from "react";
import { Alert } from "./Alert";
import { Button } from "./Button";

type RetryAlertProps = {
    children: ReactNode;
    onRetry: () => void;
    isRetrying?: boolean;
    className?: string;
};

export function RetryAlert({ children, onRetry, isRetrying = false, className }: RetryAlertProps) {
    return (
        <Alert className={className}>
            <div>
                <div>{children}</div>
                <Button
                    variant="secondary"
                    size="sm"
                    isLoading={isRetrying}
                    loadingText="Tentando..."
                    onClick={onRetry}
                    className="mt-3"
                >
                    Tentar novamente
                </Button>
            </div>
        </Alert>
    );
}
