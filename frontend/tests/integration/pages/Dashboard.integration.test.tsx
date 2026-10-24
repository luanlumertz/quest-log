import { describe, expect, test } from "vitest";
import { QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter, Route, Routes } from "react-router";
import userEvent from "@testing-library/user-event";
import { render, screen, within } from "@testing-library/react";

import { Dashboard } from "../../../src/pages/Dashboard";
import { AuthContext } from "../../../src/contexts/AuthContext";

import { createTestQueryClient } from "../../helpers/createTestQueryClient.helper";
import { createLibraryEntry } from "../../fixtures/library.fixture";
import { mockApiResponse } from "../../mocks/api.mock";
import { createAuthContextMock } from "../../mocks/authContext.mock";

const dashboardData = {
    stats: {
        totalGames: 2,
        byStatus: {
            WANT_TO_PLAY: 0,
            PLAYING: 1,
            PAUSED: 0,
            COMPLETED: 1,
            ABANDONED: 0,
        },
        totalPlaytimeMinutes: 720,
    },
    recentGames: [],
};

function renderDashboard() {
    const authValue = createAuthContextMock({
        user: {
            id: 1,
            name: "João Silva",
            email: "joao@email.com",
        },
        status: "authenticated",
    });

    const queryClient = createTestQueryClient();

    return render(
        <AuthContext.Provider value={authValue}>
            <QueryClientProvider client={queryClient}>
                <MemoryRouter initialEntries={["/dashboard"]}>
                    <Routes>
                        <Route path="/dashboard" element={<Dashboard />} />
                        <Route
                            path="/library/1"
                            element={<div>Elden Ring na biblioteca de teste</div>}
                        />
                        <Route path="/library" element={<div>Biblioteca de teste</div>} />
                    </Routes>
                </MemoryRouter>
            </QueryClientProvider>
        </AuthContext.Provider>,
    );
}

describe("Dashboard.tsx", () => {
    test("deve formatar o total de minutos sem somar as horas arredondadas de cada jogo", async () => {
        const firstEntry = createLibraryEntry({ status: "PAUSED", playtimeMinutes: 52 });
        const secondEntry = createLibraryEntry({
            status: "COMPLETED",
            playtimeMinutes: 52,
            game: { ...firstEntry.game, id: 2, title: "Hades" },
        });

        mockApiResponse({
            method: "GET",
            endpoint: "/library",
            responseBody: { libraryEntries: [] },
        });
        mockApiResponse({
            method: "GET",
            endpoint: "/dashboard",
            responseBody: {
                dashboardData: {
                    stats: {
                        totalGames: 2,
                        totalPlaytimeMinutes: 104,
                        byStatus: {
                            WANT_TO_PLAY: 0,
                            PLAYING: 0,
                            PAUSED: 1,
                            COMPLETED: 1,
                            ABANDONED: 0,
                        },
                    },
                    recentGames: [firstEntry, secondEntry],
                },
            },
        });

        renderDashboard();

        const totalHeading = await screen.findByRole("heading", { name: "Tempo jogado" });
        const totalSection = totalHeading.closest("section");

        expect(within(totalSection!).getByText("1,7 h")).toBeVisible();
        expect(screen.queryByText("1,8 h")).not.toBeInTheDocument();

        const recentSection = screen
            .getByRole("heading", { name: "Atividade recente" })
            .closest("section");

        expect(within(recentSection!).getAllByText("0,9 h")).toHaveLength(2);
    });

    test("deve mostrar pausados nos cartões, no resumo e na atividade recente", async () => {
        mockApiResponse({
            method: "GET",
            endpoint: "/library",
            responseBody: { libraryEntries: [] },
        });
        mockApiResponse({
            method: "GET",
            endpoint: "/dashboard",
            responseBody: {
                dashboardData: {
                    ...dashboardData,
                    stats: {
                        ...dashboardData.stats,
                        totalGames: 4,
                        byStatus: { ...dashboardData.stats.byStatus, PAUSED: 2 },
                    },
                    recentGames: [createLibraryEntry({ status: "PAUSED" })],
                },
            },
        });

        renderDashboard();

        await screen.findByRole("heading", { name: "Bem-vindo de volta, João" });

        const pausedLinks = screen.getAllByRole("link", { name: /^Pausado/ });

        expect(pausedLinks).toHaveLength(2);

        for (const link of pausedLinks) {
            expect(link).toHaveAttribute("href", "/library?status=PAUSED");
            expect(within(link).getByText("2")).toBeVisible();
        }

        const recentSection = screen
            .getByRole("heading", { name: "Atividade recente" })
            .closest("section");

        expect(within(recentSection!).getByText("Pausado")).toBeVisible();
    });

    test("deve exibir atividades recentes com e sem nota e abrir a entrada correta", async () => {
        const user = userEvent.setup();

        const recentEntry = createLibraryEntry({
            status: "COMPLETED",
            rating: 4.5,
            playtimeMinutes: 720,
            platforms: [{ id: 1, name: "PC" }],
        });

        mockApiResponse({
            method: "GET",
            endpoint: "/library",
            responseBody: { libraryEntries: [] },
        });
        mockApiResponse({
            method: "GET",
            endpoint: "/dashboard",
            responseBody: {
                dashboardData: {
                    ...dashboardData,
                    recentGames: [
                        recentEntry,
                        {
                            ...recentEntry,
                            rating: null,
                            game: {
                                id: 2,
                                title: "Hades",
                                coverUrl: "https://example.com/hades.jpg",
                            },
                        },
                    ],
                },
            },
        });

        renderDashboard();

        const titulo = await screen.findByRole("heading", { name: "Atividade recente" });

        const section = titulo.closest("section");

        expect(section).not.toBeNull();

        const recent = within(section!);
        const eldenRing = recent.getByRole("link", { name: /Elden Ring/i });

        expect(within(eldenRing).getByLabelText("Nota 4.5 de 5")).toBeInTheDocument();
        expect(within(eldenRing).getByText("PC")).toBeInTheDocument();
        expect(within(eldenRing).getByText("12 h")).toBeVisible();
        expect(
            within(recent.getByRole("link", { name: /Hades/i })).getByText("Sem nota"),
        ).toBeInTheDocument();
        expect(recent.getByRole("link", { name: /Ver todos/i })).toHaveAttribute(
            "href",
            "/library",
        );

        await user.click(eldenRing);

        expect(await screen.findByText("Elden Ring na biblioteca de teste")).toBeVisible();
    });

    test("deve mostrar todos os jogos em andamento ordenados por início e permitir abrir a biblioteca", async () => {
        const user = userEvent.setup();

        const base = createLibraryEntry({ status: "PLAYING" });
        const playingGames = [
            { id: 1, title: "Sem data", startedAt: null },
            { id: 2, title: "Mais recente", startedAt: "2026-03-01" },
            { id: 3, title: "Mais antigo", startedAt: "2026-01-01" },
            { id: 4, title: "Intermediário", startedAt: "2026-02-01" },
        ].map(({ id, title, startedAt }) => ({
            ...base,
            startedAt,
            rating: 4,
            platforms: [{ id: 1, name: "PC" }],
            game: { ...base.game, id, externalId: 100 + id, title },
        }));

        mockApiResponse({
            method: "GET",
            endpoint: "/library",
            responseBody: { libraryEntries: playingGames },
        });
        mockApiResponse({ method: "GET", endpoint: "/dashboard", responseBody: { dashboardData } });

        renderDashboard();

        const titulo = await screen.findByRole("heading", { name: "Jogando agora" });

        const section = titulo.closest("section");

        expect(section).not.toBeNull();

        const playing = within(section!);

        expect(
            playing.getAllByRole("heading", { level: 3 }).map((heading) => heading.textContent),
        ).toEqual(["Mais recente", "Intermediário", "Mais antigo", "Sem data"]);
        expect(playing.getByRole("heading", { name: "Sem data" })).toBeVisible();

        const verTodos = playing.getByRole("link", { name: "Ver todos (4)" });

        expect(verTodos).toHaveAttribute("href", "/library?status=PLAYING");

        await user.click(verTodos);

        expect(await screen.findByText("Biblioteca de teste")).toBeVisible();
    });

    test("deve carregar as estatísticas e os jogos em andamento", async () => {
        mockApiResponse({
            method: "GET",
            endpoint: "/library",
            responseBody: {
                libraryEntries: [createLibraryEntry({ status: "PLAYING", playtimeMinutes: 95 })],
            },
        });

        mockApiResponse({
            method: "GET",
            endpoint: "/dashboard",
            responseBody: { dashboardData },
        });

        renderDashboard();

        expect(
            await screen.findByRole("heading", {
                name: "Bem-vindo de volta, João",
            }),
        ).toBeVisible();

        const totalDeJogos = screen.getByRole("link", {
            name: /Total de jogos/i,
        });

        const statsGrid = totalDeJogos.parentElement;

        expect(statsGrid).not.toBeNull();
        expect(
            within(statsGrid!)
                .getAllByRole("heading", { level: 2 })
                .map((heading) => heading.textContent),
        ).toEqual([
            "Total de jogos",
            "Quero jogar",
            "Jogando",
            "Pausado",
            "Abandonado",
            "Zerado",
            "Tempo jogado",
        ]);

        expect(within(totalDeJogos).getByText("2")).toBeVisible();
        expect(screen.getByText("12 h")).toBeVisible();

        const tituloJogando = await screen.findByRole("heading", {
            name: "Jogando agora",
        });

        const secaoJogando = tituloJogando.closest("section");

        expect(secaoJogando).not.toBeNull();
        expect(within(secaoJogando!).getByText("1,6 h")).toBeVisible();
        expect(
            within(secaoJogando!).getByRole("heading", {
                name: "Elden Ring",
            }),
        ).toBeVisible();
    });

    test("deve carregar o Dashboard ao tentar novamente após falha na consulta principal", async () => {
        const user = userEvent.setup();

        mockApiResponse({
            method: "GET",
            endpoint: "/dashboard",
            status: 500,
            responseBody: { message: "Erro interno" },
        });
        mockApiResponse({
            method: "GET",
            endpoint: "/library",
            responseBody: {
                libraryEntries: [createLibraryEntry({ status: "PLAYING" })],
            },
        });

        renderDashboard();

        expect(await screen.findByText("Não foi possível carregar o Dashboard")).toBeVisible();
        expect(screen.queryByRole("link", { name: /Total de jogos/i })).not.toBeInTheDocument();

        const { requests } = mockApiResponse({
            method: "GET",
            endpoint: "/dashboard",
            responseBody: { dashboardData },
        });

        await user.click(screen.getByRole("button", { name: "Tentar novamente" }));

        expect(
            await screen.findByRole("heading", { name: "Bem-vindo de volta, João" }),
        ).toBeVisible();

        const total = screen.getByRole("link", { name: /Total de jogos/i });

        expect(within(total).getByText("2")).toBeVisible();
        expect(screen.getByText("12 h")).toBeVisible();
        expect(await screen.findByRole("heading", { name: "Elden Ring" })).toBeVisible();
        expect(screen.queryByText("Não foi possível carregar o Dashboard")).not.toBeInTheDocument();
        expect(requests).toHaveLength(1);
    });

    test("deve preservar as estatísticas e recuperar apenas os jogos em andamento após uma falha", async () => {
        const user = userEvent.setup();

        const dashboard = mockApiResponse({
            method: "GET",
            endpoint: "/dashboard",
            responseBody: { dashboardData },
        });
        mockApiResponse({
            method: "GET",
            endpoint: "/library",
            status: 500,
            responseBody: { message: "Erro interno" },
        });

        renderDashboard();

        const erro = "Não foi possível carregar os jogos em andamento";

        expect(await screen.findByText(erro)).toBeVisible();

        const total = screen.getByRole("link", { name: /Total de jogos/i });

        expect(within(total).getByText("2")).toBeVisible();
        expect(screen.getByText("12 h")).toBeVisible();
        expect(screen.getByRole("heading", { name: "Atividade recente" })).toBeVisible();
        expect(screen.queryByText("Não foi possível carregar o Dashboard")).not.toBeInTheDocument();

        const playing = mockApiResponse({
            method: "GET",
            endpoint: "/library",
            responseBody: {
                libraryEntries: [createLibraryEntry({ status: "PLAYING" })],
            },
        });

        await user.click(screen.getByRole("button", { name: "Tentar novamente" }));

        const titulo = await screen.findByRole("heading", { name: "Jogando agora" });

        const section = titulo.closest("section");

        expect(section).not.toBeNull();
        expect(within(section!).getByRole("heading", { name: "Elden Ring" })).toBeVisible();
        expect(screen.queryByText(erro)).not.toBeInTheDocument();
        expect(within(total).getByText("2")).toBeVisible();
        expect(screen.getByText("12 h")).toBeVisible();
        expect(playing.requests).toHaveLength(1);
        expect(dashboard.requests).toHaveLength(1);
    });
});
