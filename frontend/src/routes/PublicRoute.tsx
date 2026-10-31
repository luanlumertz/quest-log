import { Navigate, Outlet } from "react-router";
import { useAuth } from "../contexts/AuthContext";
import { SessionErrorState } from "../components/auth/SessionErrorState";
import { LoadingState } from "../components/ui/LoadingState";

export function PublicRoute() {
    const { user, status, retryAuth } = useAuth();

    if (status === "loading") {
        return <LoadingState label="Verificando sessão..." className="min-h-dvh! bg-backdrop" />;
    }

    if (status === "error") {
        return <SessionErrorState onRetry={() => void retryAuth()} />;
    }

    if (status === "authenticated" && user) {
        return <Navigate to="/dashboard" replace />;
    }

    return <Outlet />;
}
