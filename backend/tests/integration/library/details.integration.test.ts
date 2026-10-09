import { assert, describe, test } from "vitest";

import { createGame } from "../../../src/repositories/game.repository.js";

import { createAuthenticatedAgent, createRegisteredUser } from "../../fixtures/auth.fixture.js";
import { createLibraryDataForUser } from "../../fixtures/library.fixture.js";
import {
    getLibraryDetails,
    getLibraryDetailsWithoutCookies,
} from "../../requests/library/details.request.js";
import type { LibraryDetailsResponse } from "../../types/library.types.js";

describe("GET /library/:gameId", () => {
    test("deve retornar os detalhes de um jogo da biblioteca do usuário", async () => {
        const { agent, user } = await createAuthenticatedAgent();

        const { game, libraryEntry, selectedPlatforms, unselectedPlatforms } =
            await createLibraryDataForUser(user.id, {
                selectedPlatforms: ["PC"],
                unselectedPlatforms: ["PlayStation 5"],
            });

        const response = await getLibraryDetails(agent, game.id);

        assert.equal(response.status, 200);

        const { libraryEntry: libraryEntryResponse } = response.body as LibraryDetailsResponse;

        assert.ok(libraryEntryResponse);

        assert.equal(libraryEntryResponse.game.id, game.id);
        assert.equal(libraryEntryResponse.game.externalId, game.externalId);
        assert.equal(libraryEntryResponse.game.title, game.title);

        assert.equal(libraryEntryResponse.status, libraryEntry.status);

        assert.equal(libraryEntryResponse.platforms.length, 1);
        assert.deepEqual(libraryEntryResponse.platforms, selectedPlatforms);

        assert.equal(libraryEntryResponse.availablePlatforms.length, 2);
        assert.ok(
            libraryEntryResponse.availablePlatforms.some((p) => p.id === selectedPlatforms[0]?.id),
        );
        assert.ok(
            libraryEntryResponse.availablePlatforms.some(
                (p) => p.id === unselectedPlatforms[0]?.id,
            ),
        );
    });

    test("deve retornar 404 quando o jogo não pertence à biblioteca do usuário", async () => {
        const { agent } = await createAuthenticatedAgent();

        const game = await createGame({
            externalId: 123,
            title: "Test Game",
            coverUrl: null,
            releaseDate: null,
        });

        const response = await getLibraryDetails(agent, game.id);

        assert.equal(response.status, 404);
        assert.equal(response.body.message, "Jogo não encontrado na biblioteca do usuário");
    });

    test("não deve retornar detalhes de jogo que pertence à biblioteca de outro usuário", async () => {
        const { agent: agentA } = await createAuthenticatedAgent();
        const { user: userB } = await createRegisteredUser({ email: "userB@email.com" });

        const { game } = await createLibraryDataForUser(userB.id);

        const response = await getLibraryDetails(agentA, game.id);

        assert.equal(response.status, 404);
        assert.equal(response.body.message, "Jogo não encontrado na biblioteca do usuário");
    });

    test("não deve retornar detalhes com gameId inválido", async () => {
        const { agent } = await createAuthenticatedAgent();

        const response = await getLibraryDetails(agent, 0);

        assert.equal(response.status, 422);
        assert.equal(response.body.error, "Erro de Validação");
    });

    test("não deve retornar detalhes sem access token", async () => {
        const response = await getLibraryDetailsWithoutCookies(123);

        assert.equal(response.status, 401);
        assert.equal(response.body.message, "Não autenticado");
        assert.notExists(response.headers["set-cookie"]);
    });
});
