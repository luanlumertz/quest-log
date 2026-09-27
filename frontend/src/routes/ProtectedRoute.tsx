import { Navigate, Outlet } from "react-router";
import { useAuth } from "../contexts/AuthContext";
import { Button } from "../components/ui/Button";

export function ProtectedRoute() {
    const { user, status, retryAuth } = useAuth();

    if (status === "loading") {
        return null;
    }

    if (status === "error") {
        return (
            <div
                className="
                    flex min-h-screen
                    items-center justify-center
                    bg-backdrop
                    px-4
                    text-ink
                "
            >
                <div className="text-center">
                    <h1 className="font-display text-xl font-bold">
                        Não foi possível verificar sua sessão
                    </h1>

                    <p className="mt-2 text-sm text-ink-dim">
                        Verifique sua conexão e tente novamente.
                    </p>

                    <Button
                        className="mt-5"
                        onClick={retryAuth}
                    >
                        Tentar novamente
                    </Button>
                </div>
            </div>
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
