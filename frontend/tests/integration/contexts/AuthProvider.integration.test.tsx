import { describe, expect, test } from "vitest";
import { useState } from "react";
import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClientProvider } from "@tanstack/react-query";

import { AUTH_SESSION_EXPIRED_EVENT } from "../../../src/services/api";
import { useAuth } from "../../../src/contexts/AuthContext";
import { AuthProvider } from "../../../src/contexts/AuthProvider";

import { createTestQueryClient } from "../../helpers/createTestQueryClient.helper";
import { mockApiResponse } from "../../mocks/api.mock";

const authenticatedUser = {
    id: 1,
    name: "João Silva",
    email: "joao@email.com",
};

function AuthConsumerDeTeste() {
    const { status, user, retryAuth, signOut, setUser } = useAuth();
    const [logoutError, setLogoutError] = useState(false);

    async function handleSignOut() {
        try {
            await signOut();
        } catch {
            setLogoutError(true);
        }
    }

    return (
        <div>
            <p>Status: {status}</p>
            <p>Usuário: {user?.name ?? "Nenhum"}</p>
            <button onClick={() => void retryAuth()}>Verificar novamente</button>
            <button onClick={() => void handleSignOut()}>Sair</button>
            <button onClick={() => setUser(authenticatedUser)}>Definir usuário</button>
            <button onClick={() => setUser(null)}>Limpar usuário</button>
            {logoutError && <p>Falha no logout</p>}
        </div>
    );
}

function renderAuthContext(queryClient = createTestQueryClient()) {
    render(
        <QueryClientProvider client={queryClient}>
            <AuthProvider>
                <AuthConsumerDeTeste />
            </AuthProvider>
        </QueryClientProvider>,
    );

    return { queryClient };
}

describe("AuthProvider.tsx", () => {
    test("deve restaurar a sessão ao carregar o usuário autenticado", async () => {
        const { requests } = mockApiResponse({
            method: "GET",
            endpoint: "/auth/me",
            responseBody: {
                user: {
                    id: 1,
                    name: "João Silva",
                    email: "joao@email.com",
                },
            },
        });

        renderAuthContext();

        expect(await screen.findByText("Status: authenticated")).toBeVisible();
        expect(screen.getByText("Usuário: João Silva")).toBeVisible();
        expect(requests).toHaveLength(1);
    });

    test("deve ficar desautenticado quando a sessão e a renovação forem recusadas", async () => {
        mockApiResponse({ method: "GET", endpoint: "/auth/me", status: 401 });
        mockApiResponse({ method: "POST", endpoint: "/auth/refresh", status: 401 });

        renderAuthContext();

        expect(await screen.findByText("Status: unauthenticated")).toBeVisible();
        expect(screen.getByText("Usuário: Nenhum")).toBeVisible();
        expect(screen.queryByText("Status: error")).not.toBeInTheDocument();
    });

    test("deve distinguir falha temporária de sessão inválida e recuperar ao tentar novamente", async () => {
        const user = userEvent.setup();

        mockApiResponse({ method: "GET", endpoint: "/auth/me", status: 500 });

        renderAuthContext();

        expect(await screen.findByText("Status: error")).toBeVisible();
        expect(screen.getByText("Usuário: Nenhum")).toBeVisible();
        expect(screen.queryByText("Status: unauthenticated")).not.toBeInTheDocument();

        const { requests } = mockApiResponse({
            method: "GET",
            endpoint: "/auth/me",
            responseBody: { user: authenticatedUser },
        });

        await user.click(screen.getByRole("button", { name: "Verificar novamente" }));

        expect(await screen.findByText("Status: authenticated")).toBeVisible();
        expect(screen.getByText("Usuário: João Silva")).toBeVisible();
        expect(requests).toHaveLength(1);
    });

    test("deve remover o usuário e limpar o cache ao receber o evento de sessão expirada", async () => {
        mockApiResponse({
            method: "GET",
            endpoint: "/auth/me",
            responseBody: { user: authenticatedUser },
        });

        const { queryClient } = renderAuthContext();

        await screen.findByText("Status: authenticated");

        queryClient.setQueryData(["library"], { privateData: "dados do usuário" });

        expect(queryClient.getQueryData(["library"])).toBeDefined();

        act(() => {
            window.dispatchEvent(new Event(AUTH_SESSION_EXPIRED_EVENT));
        });

        expect(screen.getByText("Status: unauthenticated")).toBeVisible();
        expect(screen.getByText("Usuário: Nenhum")).toBeVisible();
        expect(queryClient.getQueryData(["library"])).toBeUndefined();
    });

    test.each([200, 401])(
        "deve encerrar a sessão e limpar o cache quando logout retornar %s",
        async (status) => {
            const user = userEvent.setup();

            mockApiResponse({
                method: "GET",
                endpoint: "/auth/me",
                responseBody: { user: authenticatedUser },
            });
            const { requests } = mockApiResponse({
                method: "POST",
                endpoint: "/auth/logout",
                status,
            });

            const { queryClient } = renderAuthContext();

            await screen.findByText("Status: authenticated");

            queryClient.setQueryData(["library"], { privateData: "dados do usuário" });
            await user.click(screen.getByRole("button", { name: "Sair" }));

            expect(await screen.findByText("Status: unauthenticated")).toBeVisible();
            expect(screen.getByText("Usuário: Nenhum")).toBeVisible();
            expect(queryClient.getQueryData(["library"])).toBeUndefined();
            expect(screen.queryByText("Falha no logout")).not.toBeInTheDocument();
            expect(requests).toHaveLength(1);
        },
    );

    test("deve propagar falha de logout sem apagar o usuário ou o cache", async () => {
        const user = userEvent.setup();

        mockApiResponse({
            method: "GET",
            endpoint: "/auth/me",
            responseBody: { user: authenticatedUser },
        });
        mockApiResponse({ method: "POST", endpoint: "/auth/logout", status: 500 });

        const { queryClient } = renderAuthContext();

        await screen.findByText("Status: authenticated");

        const cachedLibrary = { privateData: "dados do usuário" };

        queryClient.setQueryData(["library"], cachedLibrary);
        await user.click(screen.getByRole("button", { name: "Sair" }));

        expect(await screen.findByText("Falha no logout")).toBeVisible();
        expect(screen.getByText("Status: authenticated")).toBeVisible();
        expect(screen.getByText("Usuário: João Silva")).toBeVisible();
        expect(queryClient.getQueryData(["library"])).toEqual(cachedLibrary);
    });

    test("deve sincronizar usuário e status ao definir e limpar o usuário pelo contexto", async () => {
        const user = userEvent.setup();

        const { requests } = mockApiResponse({ method: "GET", endpoint: "/auth/me", status: 500 });

        renderAuthContext();

        await screen.findByText("Status: error");

        await user.click(screen.getByRole("button", { name: "Definir usuário" }));

        expect(screen.getByText("Status: authenticated")).toBeVisible();
        expect(screen.getByText("Usuário: João Silva")).toBeVisible();

        await user.click(screen.getByRole("button", { name: "Limpar usuário" }));

        expect(screen.getByText("Status: unauthenticated")).toBeVisible();
        expect(screen.getByText("Usuário: Nenhum")).toBeVisible();
        expect(requests).toHaveLength(1);
    });
});
