import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { useQueryClient } from "@tanstack/react-query";

import type { User } from "../types/auth.types";
import { getCurrentUser, logout } from "../services/auth.service";
import { ApiError, AUTH_SESSION_EXPIRED_EVENT } from "../services/api";
import { AuthContext, type AuthStatus } from "./AuthContext";

type Props = {
    children: ReactNode;
};

type CurrentUserState = {
    user: User | null;
    status: Exclude<AuthStatus, "loading">;
};

async function getCurrentUserState(): Promise<CurrentUserState> {
    try {
        const user = await getCurrentUser();

        return {
            user,
            status: "authenticated",
        };
    } catch (error) {
        if (error instanceof ApiError && error.status === 401) {
            return {
                user: null,
                status: "unauthenticated",
            };
        }

        return {
            user: null,
            status: "error",
        };
    }
}

export const AuthProvider = ({ children }: Props) => {
    const [user, setUserState] = useState<User | null>(null);
    const [status, setStatus] = useState<AuthStatus>("loading");

    const queryClient = useQueryClient();
    const authVersion = useRef(0);

    const setUser = useCallback((user: User | null) => {
        authVersion.current += 1;
        setUserState(user);

        setStatus(user ? "authenticated" : "unauthenticated");
    }, []);

    useEffect(() => {
        function handleSessionExpired() {
            queryClient.clear();

            setUser(null);
        }

        window.addEventListener(AUTH_SESSION_EXPIRED_EVENT, handleSessionExpired);

        return () => {
            window.removeEventListener(AUTH_SESSION_EXPIRED_EVENT, handleSessionExpired);
        };
    }, [queryClient, setUser]);

    useEffect(() => {
        let isActive = true;
        const version = authVersion.current;

        void getCurrentUserState().then((nextState) => {
            if (!isActive || version !== authVersion.current) {
                return;
            }

            setUserState(nextState.user);
            setStatus(nextState.status);
        });

        return () => {
            isActive = false;
        };
    }, []);

    const retryAuth = useCallback(async () => {
        const version = ++authVersion.current;
        setStatus("loading");

        const nextState = await getCurrentUserState();

        // Uma consulta antiga não restaura uma sessão encerrada após trocar a senha.
        if (version !== authVersion.current) return;

        setUserState(nextState.user);
        setStatus(nextState.status);
    }, []);

    async function signOut() {
        try {
            await logout();
        } catch (error) {
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
                retryAuth,
                signOut,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};
