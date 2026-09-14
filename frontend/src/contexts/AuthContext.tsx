import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { User } from "../types/auth.types";
import { getCurrentUser } from "../services/auth.service";

type AuthContextType = {
    user: User | null;
    isLoading: boolean;
    setUser: (user: User | null) => void;
}

export const AuthContext = createContext<AuthContextType | null>(null);

type Props = {
    children: ReactNode;
}

export const AuthProvider = ({ children }: Props) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function loadCurrentUser() {
            try {
                const currentUser = await getCurrentUser();

                setUser(currentUser);
            } catch (error) {
                setUser(null);
            } finally {
                setIsLoading(false);
            }
        }

        loadCurrentUser();
    }, [])

    return (
        <AuthContext.Provider value={{ user, isLoading, setUser }}>
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
