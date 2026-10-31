import { RetryErrorState } from "../ui/RetryErrorState";

type SessionErrorStateProps = {
    onRetry: () => void;
};

export function SessionErrorState({ onRetry }: SessionErrorStateProps) {
    return (
        <RetryErrorState
            title="Não foi possível verificar sua sessão"
            description="Verifique sua conexão e tente novamente."
            className="min-h-dvh! bg-backdrop"
            onRetry={onRetry}
        />
    );
}
