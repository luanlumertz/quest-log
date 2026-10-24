import { describe, expect, test } from "vitest";
import { MemoryRouter, useLocation } from "react-router";
import { render, screen } from "@testing-library/react";
import { QueryClientProvider } from "@tanstack/react-query";

import { AuthContext } from "../../../src/contexts/AuthContext";
import { AppRoutes } from "../../../src/routes/AppRoutes";

import { createTestQueryClient } from "../../helpers/createTestQueryClient.helper";
import { mockApiResponse } from "../../mocks/api.mock";
import { createAuthContextMock } from "../../mocks/authContext.mock";

function LocalizacaoDeTeste() {
    const { pathname } = useLocation();

    return <output data-testid="rota-atual">{pathname}</output>;
}

function renderAppRoutes(path: string, authenticated = false) {
    const authValue = createAuthContextMock({
        user: authenticated ? { id: 1, name: "João Silva", email: "joao@email.com" } : null,
        status: authenticated ? "authenticated" : "unauthenticated",
    });

    return render(
        <AuthContext.Provider value={authValue}>
            <QueryClientProvider client={createTestQueryClient()}>
                <MemoryRouter initialEntries={[path]}>
                    <AppRoutes />
                    <LocalizacaoDeTeste />
                </MemoryRouter>
            </QueryClientProvider>
        </AuthContext.Provider>,
    );
}

function mockDashboard() {
    mockApiResponse({
        method: "GET",
        endpoint: "/dashboard",
        responseBody: {
            dashboardData: {
                stats: {
                    totalGames: 0,
                    byStatus: {
                        WANT_TO_PLAY: 0,
                        PLAYING: 0,
                        PAUSED: 0,
                        COMPLETED: 0,
                        ABANDONED: 0,
                    },
                    totalPlaytimeMinutes: 0,
                },
                recentGames: [],
            },
        },
    });
    mockApiResponse({ method: "GET", endpoint: "/library", responseBody: { libraryEntries: [] } });
}

describe("AppRoutes.tsx", () => {
    test.each([
        "/",
        "/dashboard",
        "/games/search",
        "/games/123",
        "/library",
        "/library/1",
        "/profile",
    ])("deve proteger a rota real %s de usuários não autenticados", async (path) => {
        renderAppRoutes(path);

        expect(await screen.findByRole("heading", { name: "Bem-vindo!" })).toBeVisible();
        expect(screen.getByTestId("rota-atual")).toHaveTextContent(/^\/login$/);
        expect(screen.queryByRole("banner")).not.toBeInTheDocument();
    });

    test("deve redirecionar a raiz para o dashboard dentro do layout quando autenticado", async () => {
        mockDashboard();

        renderAppRoutes("/", true);

        expect(
            await screen.findByRole("heading", { name: "Bem-vindo de volta, João" }),
        ).toBeVisible();
        expect(screen.getByTestId("rota-atual")).toHaveTextContent(/^\/dashboard$/);
        expect(screen.getByRole("banner")).toBeInTheDocument();
    });

    test.each(["/login", "/register", "/register/verify"])(
        "deve impedir acesso autenticado à rota real %s",
        async (path) => {
            mockDashboard();

            renderAppRoutes(path, true);

            expect(
                await screen.findByRole("heading", { name: "Bem-vindo de volta, João" }),
            ).toBeVisible();
            expect(screen.getByTestId("rota-atual")).toHaveTextContent(/^\/dashboard$/);
        },
    );

    test("deve permitir o cadastro sem autenticação na configuração real", () => {
        renderAppRoutes("/register");

        expect(screen.getByRole("heading", { name: "Crie uma conta!" })).toBeVisible();
        expect(screen.getByTestId("rota-atual")).toHaveTextContent(/^\/register$/);
    });

    test.each([false, true])("deve permitir recuperação com autenticação %s", (authenticated) => {
        renderAppRoutes("/forgot-password", authenticated);

        expect(screen.getByRole("heading", { name: "Esqueceu sua senha?" })).toBeVisible();
        expect(screen.getByTestId("rota-atual")).toHaveTextContent(/^\/forgot-password$/);
        expect(screen.queryByRole("banner")).not.toBeInTheDocument();
    });

    test("deve exibir NotFound para um endereço desconhecido sem exigir autenticação", () => {
        renderAppRoutes("/endereco-inexistente");

        expect(screen.getByRole("heading", { name: "Página não encontrada" })).toBeVisible();
        expect(screen.getByTestId("rota-atual")).toHaveTextContent(/^\/endereco-inexistente$/);
    });
});
