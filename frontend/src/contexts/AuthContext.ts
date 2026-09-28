import { createContext, useContext } from "react";
import type { User } from "../types/auth.types";

export type AuthStatus =
    | "loading"
    | "authenticated"
    | "unauthenticated"
    | "error";

export type AuthContextType = {
    user: User | null;
    status: AuthStatus;
    setUser: (user: User | null) => void;
    retryAuth: () => Promise<void>;
    signOut: () => Promise<void>;
};

export const AuthContext = createContext<AuthContextType | null>(null);

export function useAuth() {
    const context = useContext(AuthContext);

    if (!context) {
        throw new Error("useAuth deve ser usado dentro de AuthProvider");
    }

    return context;
}
