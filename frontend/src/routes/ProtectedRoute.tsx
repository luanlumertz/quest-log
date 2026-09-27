import { Navigate, Outlet } from "react-router";
import { useAuth } from "../contexts/AuthContext";
import { Button } from "../components/ui/Button";
import { LoadingState } from "../components/ui/LoadingState";
import { StateView } from "../components/ui/StateView";

export function ProtectedRoute() {
    const { user, status, retryAuth } = useAuth();

    if (status === "loading") {
        return (
            <LoadingState
                label="Verificando sessão..."
                className="min-h-screen! bg-backdrop"
            />
        );
    }

    if (status === "error") {
        return (
            <StateView
                icon="error"
                tone="danger"
                title="Não foi possível verificar sua sessão"
                description="Verifique sua conexão e tente novamente."
                className="min-h-screen! bg-backdrop"
                action={
                    <Button onClick={() => void retryAuth()} >
                        Tentar novamente
                    </Button>
                }
            />
        );
    }

    if (status === "unauthenticated" || !user) {
        return (
            <Navigate
                to="/login"
                replace
            />
        );
    }

    return <Outlet />;
}
