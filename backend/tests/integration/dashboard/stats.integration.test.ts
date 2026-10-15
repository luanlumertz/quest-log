import { assert, describe, test } from "vitest";

import type { DashboardResponse } from "../../types/dashboard.types.js";
import {
    createLibraryDataForUser,
    createMultipleLibraryDataForUser,
} from "../../fixtures/library.fixture.js";
import { createAuthenticatedAgent, createRegisteredUser } from "../../fixtures/auth.fixture.js";
import {
    getDashboardStats,
    getDashboardStatsWithoutCookies,
} from "../../requests/dashboard/stats.request.js";

describe("GET /dashboard", () => {
    test("deve retornar as estatísticas zeradas quando o usuário não possui jogos na biblioteca", async () => {
        const { agent } = await createAuthenticatedAgent();

        const response = await getDashboardStats(agent);

        assert.equal(response.status, 200);

        const {
            dashboardData: { stats, recentGames },
        } = response.body as DashboardResponse;

        assert.equal(stats.totalGames, 0);
        assert.equal(stats.totalPlaytimeMinutes, 0);
        assert.deepEqual(stats.byStatus, {
            WANT_TO_PLAY: 0,
            PLAYING: 0,
            COMPLETED: 0,
            ABANDONED: 0,
        });
        assert.deepEqual(recentGames, []);
    });

    test("deve retornar as estatísticas corretas dos jogos da biblioteca do usuário", async () => {
        const { agent, user } = await createAuthenticatedAgent();

        await createMultipleLibraryDataForUser(user.id, [
            { status: "WANT_TO_PLAY", playtimeMinutes: 0 },
            { status: "PLAYING", playtimeMinutes: 120 },
            { status: "PLAYING", playtimeMinutes: 90 },
            { status: "COMPLETED", playtimeMinutes: 300 },
            { status: "ABANDONED", playtimeMinutes: 60 },
        ]);

        const response = await getDashboardStats(agent);

        assert.equal(response.status, 200);

        const {
            dashboardData: { stats },
        } = response.body as DashboardResponse;

        assert.equal(stats.totalGames, 5);
        assert.equal(stats.totalPlaytimeMinutes, 570);
        assert.deepEqual(stats.byStatus, {
            WANT_TO_PLAY: 1,
            PLAYING: 2,
            COMPLETED: 1,
            ABANDONED: 1,
        });
    });

    test("deve retornar corretamente os dados dos jogos recentes", async () => {
        const { agent, user } = await createAuthenticatedAgent();

        const { game, selectedPlatforms } = await createLibraryDataForUser(user.id, {
            game: {
                title: "Jogo Recente",
            },
            selectedPlatforms: ["PC"],
            libraryEntry: {
                status: "PLAYING",
                rating: 4.5,
                playtimeMinutes: 120,
            },
        });

        const response = await getDashboardStats(agent);

        assert.equal(response.status, 200);

        const {
            dashboardData: { recentGames },
        } = response.body as DashboardResponse;

        assert.equal(recentGames.length, 1);

        const recentGame = recentGames[0];

        assert.ok(recentGame);
        assert.deepEqual(recentGame.game, {
            id: game.id,
            title: game.title,
            coverUrl: game.coverUrl,
        });
        assert.equal(recentGame.status, "PLAYING");
        assert.equal(recentGame.rating, 4.5);
        assert.equal(recentGame.playtimeMinutes, 120);
        assert.deepEqual(
            recentGame.platforms,
            selectedPlatforms.map(({ id, name }) => ({ id, name })),
        );
    });

    test("deve retornar no máximo 5 jogos recentes, ordenados por updatedAt decrescente", async () => {
        const { agent, user } = await createAuthenticatedAgent();

        await createMultipleLibraryDataForUser(user.id, [
            { updatedAt: new Date("2026-01-01T12:00:00Z") },
            { updatedAt: new Date("2026-01-02T12:00:00Z") },
            { updatedAt: new Date("2026-01-03T12:00:00Z") },
            { updatedAt: new Date("2026-01-04T12:00:00Z") },
            { updatedAt: new Date("2026-01-05T12:00:00Z") },
            { updatedAt: new Date("2026-01-06T12:00:00Z") },
            { updatedAt: new Date("2026-01-07T12:00:00Z") },
        ]);

        const response = await getDashboardStats(agent);

        assert.equal(response.status, 200);

        const {
            dashboardData: { recentGames },
        } = response.body as DashboardResponse;

        assert.equal(recentGames.length, 5);
        assert.deepEqual(
            recentGames.map(({ game }) => game.title),
            ["Jogo 7", "Jogo 6", "Jogo 5", "Jogo 4", "Jogo 3"],
        );
    });

    test("deve retornar apenas as estatísticas e os jogos recentes do usuário autenticado", async () => {
        const { agent: agentA, user: userA } = await createAuthenticatedAgent();
        const { user: userB } = await createRegisteredUser({ email: "userB@email.com" });

        const createdGamesA = await createMultipleLibraryDataForUser(userA.id, [
            { status: "PLAYING", playtimeMinutes: 100 },
            { status: "COMPLETED", playtimeMinutes: 250 },
        ]);

        await createMultipleLibraryDataForUser(userB.id, [
            { status: "WANT_TO_PLAY", playtimeMinutes: 0 },
            { status: "PLAYING", playtimeMinutes: 120 },
            { status: "ABANDONED", playtimeMinutes: 30 },
        ]);

        const response = await getDashboardStats(agentA);

        assert.equal(response.status, 200);

        const {
            dashboardData: { stats, recentGames },
        } = response.body as DashboardResponse;

        assert.equal(stats.totalGames, 2);
        assert.equal(stats.totalPlaytimeMinutes, 350);
        assert.deepEqual(stats.byStatus, {
            WANT_TO_PLAY: 0,
            PLAYING: 1,
            COMPLETED: 1,
            ABANDONED: 0,
        });
        assert.equal(recentGames.length, 2);
        assert.deepEqual(
            new Set(recentGames.map(({ game }) => game.id)),
            new Set(createdGamesA.map(({ game }) => game.id)),
        );
    });

    test("não deve retornar dados do dashboard sem access token", async () => {
        const response = await getDashboardStatsWithoutCookies();

        assert.equal(response.status, 401);
        assert.equal(response.body.message, "Não autenticado");
        assert.notExists(response.headers["set-cookie"]);
    });
});
