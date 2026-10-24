import { assert, describe, test } from "vitest";

import type { GameStatus } from "@prisma/client";

import { createAuthenticatedAgent, createRegisteredUser } from "../../fixtures/auth.fixture.js";
import { createLibraryDataForUser } from "../../fixtures/library.fixture.js";
import { listLibrary, listLibraryWithoutCookies } from "../../requests/library/list.request.js";
import type { ListLibraryResponse } from "../../types/library.types.js";

describe("GET /library", () => {
    test("deve retornar os jogos da biblioteca do usuário autenticado", async () => {
        const { agent, user } = await createAuthenticatedAgent();

        const { libraryEntry, game, selectedPlatforms } = await createLibraryDataForUser(user.id);

        const response = await listLibrary(agent);

        const body = response.body as ListLibraryResponse;

        assert.equal(response.status, 200);
        assert.equal(body.libraryEntries.length, 1);

        const [libraryEntryResponse] = body.libraryEntries;

        assert.ok(libraryEntryResponse);
        assert.equal(libraryEntryResponse.status, libraryEntry.status);
        assert.equal(libraryEntryResponse.playtimeMinutes, libraryEntry.playtimeMinutes);

        assert.equal(libraryEntryResponse.game.id, game.id);
        assert.equal(libraryEntryResponse.game.externalId, game.externalId);
        assert.equal(libraryEntryResponse.game.title, game.title);

        assert.deepEqual(libraryEntryResponse.platforms, selectedPlatforms);
    });

    test("deve retornar lista vazia quando o usuário não possui jogos na biblioteca", async () => {
        const { agent } = await createAuthenticatedAgent();

        const response = await listLibrary(agent);

        const body = response.body as ListLibraryResponse;

        assert.equal(response.status, 200);
        assert.deepEqual(body.libraryEntries, []);
    });

    test("não deve retornar jogos da biblioteca de outro usuário", async () => {
        const { agent: agentA } = await createAuthenticatedAgent();
        const { user: userB } = await createRegisteredUser({ email: "userB@email.com" });

        await createLibraryDataForUser(userB.id);

        const response = await listLibrary(agentA);

        const body = response.body as ListLibraryResponse;

        assert.equal(response.status, 200);
        assert.deepEqual(body.libraryEntries, []);
    });

    test.each(["PLAYING", "PAUSED"] as const)(
        "deve filtrar a biblioteca pelo status %s",
        async (filteredStatus) => {
            const { agent, user } = await createAuthenticatedAgent();

            const { game: firstTestGame, libraryEntry } = await createLibraryDataForUser(user.id, {
                libraryEntry: {
                    status: filteredStatus,
                },
            });

            await createLibraryDataForUser(user.id, {
                game: {
                    externalId: 456,
                    title: "Second Test Game",
                },
                selectedPlatforms: ["Second Test Platform"],
                libraryEntry: {
                    status: "COMPLETED",
                },
            });

            const response = await listLibrary(agent, { status: filteredStatus });

            const body = response.body as ListLibraryResponse;

            assert.equal(response.status, 200);
            assert.equal(body.libraryEntries.length, 1);

            const [libraryEntryResponse] = body.libraryEntries;

            assert.ok(libraryEntryResponse);
            assert.equal(libraryEntryResponse.game.id, firstTestGame.id);
            assert.equal(libraryEntryResponse.status, libraryEntry.status);
        },
    );

    test("deve filtrar a biblioteca pelo título do jogo", async () => {
        const { agent, user } = await createAuthenticatedAgent();

        const filteredSearch: string = "Elden Ring";
        const partialSearch = "ELDEN";

        const { game } = await createLibraryDataForUser(user.id, {
            game: {
                title: filteredSearch,
            },
        });

        await createLibraryDataForUser(user.id, {
            game: {
                externalId: 456,
                title: "Hades",
            },
            selectedPlatforms: ["Second Test Platform"],
        });

        const response = await listLibrary(agent, { search: partialSearch });

        const body = response.body as ListLibraryResponse;

        assert.equal(response.status, 200);
        assert.equal(body.libraryEntries.length, 1);

        const [libraryEntryResponse] = body.libraryEntries;

        assert.ok(libraryEntryResponse);
        assert.equal(libraryEntryResponse.game.id, game.id);
        assert.equal(libraryEntryResponse.game.title, game.title);
    });

    test("deve filtrar a biblioteca por status e título ao mesmo tempo", async () => {
        const { agent, user } = await createAuthenticatedAgent();

        const filteredStatus: GameStatus = "PAUSED";
        const filteredSearch: string = "Elden Ring";

        const { game, libraryEntry } = await createLibraryDataForUser(user.id, {
            game: {
                title: filteredSearch,
            },
            libraryEntry: {
                status: filteredStatus,
            },
        });

        await createLibraryDataForUser(user.id, {
            game: {
                externalId: 456,
                title: `${filteredSearch} Nightreign`,
            },
            selectedPlatforms: ["Second Test Platform"],
            libraryEntry: {
                status: "COMPLETED",
            },
        });

        await createLibraryDataForUser(user.id, {
            game: {
                externalId: 789,
                title: "Hades",
            },
            selectedPlatforms: ["Third Test Platform"],
            libraryEntry: {
                status: filteredStatus,
            },
        });

        const response = await listLibrary(agent, {
            status: filteredStatus,
            search: filteredSearch,
        });

        const body = response.body as ListLibraryResponse;

        assert.equal(response.status, 200);
        assert.equal(body.libraryEntries.length, 1);

        const [libraryEntryResponse] = body.libraryEntries;

        assert.ok(libraryEntryResponse);
        assert.equal(libraryEntryResponse.game.id, game.id);
        assert.equal(libraryEntryResponse.game.title, game.title);
        assert.equal(libraryEntryResponse.status, libraryEntry.status);
    });

    test("não deve listar biblioteca com status inválido", async () => {
        const { agent } = await createAuthenticatedAgent();

        const response = await listLibrary(agent, { status: "INVALID_STATUS" as GameStatus });

        assert.equal(response.status, 422);
        assert.equal(response.body.error, "Erro de Validação");
    });

    test("não deve listar biblioteca sem access token", async () => {
        const response = await listLibraryWithoutCookies();

        assert.equal(response.status, 401);
        assert.equal(response.body.message, "Não autenticado");
        assert.notExists(response.headers["set-cookie"]);
    });
});
