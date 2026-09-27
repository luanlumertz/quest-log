import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { useQueryClient } from "@tanstack/react-query";
import type { User } from "../types/auth.types";
import { getCurrentUser, logout } from "../services/auth.service";
import { ApiError, AUTH_SESSION_EXPIRED_EVENT } from "../services/api";

export type AuthStatus =
    | "loading"
    | "authenticated"
    | "unauthenticated"
    | "error";

type AuthContextType = {
    user: User | null;
    status: AuthStatus;
    setUser: (user: User | null) => void;
    retryAuth: () => Promise<void>;
    signOut: () => Promise<void>;
};

export const AuthContext = createContext<AuthContextType | null>(null);

type Props = {
    children: ReactNode;
};

export const AuthProvider = ({ children }: Props) => {
    const [user, setUserState] = useState<User | null>(null);
    const [status, setStatus] = useState<AuthStatus>("loading");

    const queryClient = useQueryClient();

    const setUser = useCallback((user: User | null) => {
        setUserState(user);

        setStatus(user ? "authenticated" : "unauthenticated");
    }, []);

    const loadCurrentUser = useCallback(
        async () => {
            setStatus("loading");

            try {
                const currentUser = await getCurrentUser();

                setUserState(currentUser);
                setStatus("authenticated");
            } catch (error) {
                setUserState(null);

                if (error instanceof ApiError && error.status === 401) {
                    setStatus("unauthenticated");

                    return;
                }

                setStatus("error");
            }
        }, []
    );

    useEffect(() => {
        function handleSessionExpired() {
            queryClient.clear();

            setUserState(null);
            setStatus("unauthenticated");
        }

        window.addEventListener(
            AUTH_SESSION_EXPIRED_EVENT,
            handleSessionExpired
        );

        return () => {
            window.removeEventListener(
                AUTH_SESSION_EXPIRED_EVENT,
                handleSessionExpired
            );
        };
    }, [queryClient]);

    useEffect(() => {
        loadCurrentUser();
    }, [loadCurrentUser]);

    async function signOut() {
        try {
            await logout();
        } catch (error) {
            // Se o backend falar que a sessão já é inválida, o logout() já foi concluído
            if (!(error instanceof ApiError && error.status === 401)) {
                throw error;
            }
        }

        queryClient.clear();
        setUser(null);
    }

    return (
        <AuthContext.Provider
            value={{
                user,
                status,
                setUser,
                retryAuth: loadCurrentUser,
                signOut
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export function useAuth() {
    const context = useContext(AuthContext);

    if (!context) {
        throw new Error("useAuth deve ser usado dentro de AuthProvider");
    }

    return context;
}
