import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { User } from "../types/auth.types";
import { getCurrentUser, logout } from "../services/auth.service";
import { useQueryClient } from "@tanstack/react-query";

type AuthContextType = {
    user: User | null;
    isLoading: boolean;
    setUser: (user: User | null) => void;
    signOut: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | null>(null);

type Props = {
    children: ReactNode;
}

export const AuthProvider = ({ children }: Props) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const queryClient = useQueryClient();

    useEffect(() => {
        function handleSessionExpired() {
            queryClient.clear();
            setUser(null);
        }

        window.addEventListener(
            "auth:session-expired",
            handleSessionExpired
        );

        return () => {
            window.removeEventListener(
                "auth:session-expired",
                handleSessionExpired
            );
        };
    }, [queryClient]);

    useEffect(() => {
        async function loadCurrentUser() {
            try {
                const currentUser = await getCurrentUser();

                setUser(currentUser);
            } catch {
                setUser(null);
            } finally {
                setIsLoading(false);
            }
        }

        loadCurrentUser();
    }, [])

    async function signOut() {
        await logout();

        queryClient.clear();
        setUser(null);
    }

    return (
        <AuthContext.Provider value={{ user, isLoading, setUser, signOut }}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    const context = useContext(AuthContext);

    if (!context) {
        throw new Error("useAuth deve ser usado dentro de AuthProvider");
    }

    return context;
}
