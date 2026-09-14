import { Navigate, Outlet } from "react-router";
import { useAuth } from "../contexts/AuthContext";

export function PublicRoute() {
    const { user, isLoading } = useAuth();

    if (isLoading) {
        return null;
    }

    if (user) {
        return <Navigate to="/dashboard" replace />;
    }

    return <Outlet />;
}
