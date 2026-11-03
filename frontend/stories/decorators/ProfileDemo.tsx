import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect, useState, type ReactNode } from "react";
import { MemoryRouter } from "react-router";
import { AuthContext } from "../../src/contexts/AuthContext";
import { logout } from "../../src/services/auth.service";
import type { User } from "../../src/types/auth.types";
import { demoProfileUser } from "../fixtures/profile";
import { setProfileDemoUser } from "../mocks/profileMutation";

export function ProfileDemo({
    children,
    initialUser = demoProfileUser,
    initialPath = "/profile",
}: {
    children: ReactNode;
    initialUser?: User;
    initialPath?: string;
}) {
    const [user, setUser] = useState<User | null>(initialUser);
    const [queryClient] = useState(
        () =>
            new QueryClient({
                defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
            }),
    );

    useEffect(() => {
        setProfileDemoUser(initialUser);
    }, [initialUser]);

    async function signOut() {
        await logout();
        queryClient.clear();
        setUser(null);
    }

    return (
        <QueryClientProvider client={queryClient}>
            <MemoryRouter initialEntries={[initialPath]}>
                <AuthContext.Provider
                    value={{
                        user,
                        setUser,
                        status: user ? "authenticated" : "unauthenticated",
                        retryAuth: async () => {},
                        signOut,
                    }}
                >
                    {children}
                </AuthContext.Provider>
            </MemoryRouter>
        </QueryClientProvider>
    );
}
