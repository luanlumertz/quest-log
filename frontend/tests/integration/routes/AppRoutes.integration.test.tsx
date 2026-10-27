import { describe, expect, test } from "vitest";
import { MemoryRouter, useLocation } from "react-router";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClientProvider } from "@tanstack/react-query";
import { http, HttpResponse } from "msw";

import { AuthContext } from "../../../src/contexts/AuthContext";
import { AppRoutes } from "../../../src/routes/AppRoutes";
import { API_URL } from "../../../src/services/api";
import type { DashboardData } from "../../../src/types/dashboard.types";

import { createTestQueryClient } from "../../helpers/createTestQueryClient.helper";
import { createLibraryEntry } from "../../fixtures/library.fixture";
import { mockApiResponse } from "../../mocks/api.mock";
import { createAuthContextMock } from "../../mocks/authContext.mock";
import { server } from "../../mocks/server.mock";

function LocalizacaoDeTeste() {
    const { pathname, search } = useLocation();

    return (
        <output data-testid="rota-atual">
            {" "}
            {pathname} {search}{" "}
        </output>
    );
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

function mockDashboard(stats: Partial<DashboardData["stats"]> = {}) {
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
                    ...stats,
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

    test("deve abrir a biblioteca filtrada ao clicar no indicador Jogando do dashboard", async () => {
        const user = userEvent.setup();
        const playingGame = createLibraryEntry({ status: "PLAYING" });
        const completedGame = createLibraryEntry({
            status: "COMPLETED",
            game: { ...playingGame.game, id: 2, externalId: 456, title: "Hades" },
        });
        const games = [playingGame, completedGame];

        mockDashboard({
            totalGames: 2,
            byStatus: {
                WANT_TO_PLAY: 0,
                PLAYING: 1,
                PAUSED: 0,
                COMPLETED: 1,
                ABANDONED: 0,
            },
        });
        server.use(
            http.get(`${API_URL}/library`, ({ request }) => {
                const status = new URL(request.url).searchParams.get("status");

                return HttpResponse.json({
                    libraryEntries: status ? games.filter((game) => game.status === status) : games,
                });
            }),
        );

        renderAppRoutes("/dashboard", true);

        const playingCard = (await screen.findByRole("heading", { name: "Jogando" })).closest("a");

        expect(playingCard).not.toBeNull();

        await user.click(playingCard!);

        expect(await screen.findByRole("heading", { name: "Minha Biblioteca" })).toBeVisible();
        expect(screen.getByTestId("rota-atual")).toHaveTextContent(/^\/library\?status=PLAYING$/);
        expect(screen.getByRole("button", { name: /^Jogando/i })).toHaveAttribute(
            "aria-pressed",
            "true",
        );
        expect(screen.getByRole("button", { name: /^Todos/i })).toHaveAttribute(
            "aria-pressed",
            "false",
        );
        expect(await screen.findByRole("heading", { name: "Elden Ring" })).toBeVisible();
        expect(screen.queryByRole("heading", { name: "Hades" })).not.toBeInTheDocument();
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
