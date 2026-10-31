import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, type ReactNode } from "react";
import { MemoryRouter, useLocation } from "react-router";

export function GameDemo({ children }: { children: ReactNode }) {
    const [queryClient] = useState(
        () =>
            new QueryClient({
                defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
            }),
    );

    return (
        <QueryClientProvider client={queryClient}>
            <MemoryRouter initialEntries={["/jogos-demo"]}>{children}</MemoryRouter>
        </QueryClientProvider>
    );
}

export function DemoLocation() {
    const location = useLocation();
    return (
        <p role="status" className="mt-4 text-sm text-ink-dim">
            Rota da demonstração: {location.pathname}
            {location.search}
        </p>
    );
}
