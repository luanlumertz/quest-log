import { assert, describe, test } from "vitest";

import { findPlatformByName } from "../../../src/repositories/platform.repository.js";
import { findGameByExternalId } from "../../../src/repositories/game.repository.js";

import {
    countLibraryEntriesByUserIdAndGameId,
    countLibraryEntryPlatformsByUserIdAndGameId,
} from "../../helpers/database/library.helper.js";
import { findGamePlatformByGameIdAndPlatformId } from "../../helpers/database/game.helper.js";
import {
    createLibraryDataForUser,
    createLibraryEntryForExistingGame,
} from "../../fixtures/library.fixture.js";
import { createAuthenticatedAgent, createRegisteredUser } from "../../fixtures/auth.fixture.js";
import {
    deleteLibraryEntry,
    deleteLibraryEntryWithoutCookies,
} from "../../requests/library/delete.request.js";

describe("DELETE /library/:gameId", () => {
    test("deve remover um jogo da biblioteca do usuário", async () => {
        const { agent, user } = await createAuthenticatedAgent();

        const { game, selectedPlatforms } = await createLibraryDataForUser(user.id);

        const platform = selectedPlatforms[0];

        assert.ok(platform);

        const response = await deleteLibraryEntry(agent, game.id);

        assert.equal(response.status, 204);

        const entryCount = await countLibraryEntriesByUserIdAndGameId(user.id, game.id);
        const entryPlatformCount = await countLibraryEntryPlatformsByUserIdAndGameId(
            user.id,
            game.id,
        );

        assert.equal(entryCount, 0);
        assert.equal(entryPlatformCount, 0);

        const persistedGame = await findGameByExternalId(game.externalId);
        const persistedPlatform = await findPlatformByName(platform.name);
        const persistedGamePlatform = await findGamePlatformByGameIdAndPlatformId(
            game.id,
            platform.id,
        );

        assert.ok(persistedGame);
        assert.ok(persistedPlatform);
        assert.ok(persistedGamePlatform);
    });

    test("deve remover apenas a entrada do usuário autenticado quando o jogo pertence a múltiplas bibliotecas", async () => {
        const { agent: agentA, user: userA } = await createAuthenticatedAgent();
        const { user: userB } = await createRegisteredUser({ email: "userB@email.com" });

        const { game, selectedPlatforms } = await createLibraryDataForUser(userA.id);

        const platformIds = selectedPlatforms.map((platform) => platform.id);

        await createLibraryEntryForExistingGame(userB.id, game.id, platformIds);

        const response = await deleteLibraryEntry(agentA, game.id);

        assert.equal(response.status, 204);

        const userAEntryCount = await countLibraryEntriesByUserIdAndGameId(userA.id, game.id);

        const userAPlatformCount = await countLibraryEntryPlatformsByUserIdAndGameId(
            userA.id,
            game.id,
        );

        const userBEntryCount = await countLibraryEntriesByUserIdAndGameId(userB.id, game.id);

        const userBPlatformCount = await countLibraryEntryPlatformsByUserIdAndGameId(
            userB.id,
            game.id,
        );

        assert.equal(userAEntryCount, 0);
        assert.equal(userAPlatformCount, 0);

        assert.equal(userBEntryCount, 1);
        assert.equal(userBPlatformCount, selectedPlatforms.length);
    });

    test("não deve remover jogo que pertence à biblioteca de outro usuário", async () => {
        const { agent: agentA } = await createAuthenticatedAgent();
        const { user: userB } = await createRegisteredUser({ email: "userB@email.com" });

        const { game, selectedPlatforms } = await createLibraryDataForUser(userB.id);

        const response = await deleteLibraryEntry(agentA, game.id);

        assert.equal(response.status, 404);
        assert.equal(response.body.message, "Jogo não encontrado na biblioteca do usuário");

        const entryCount = await countLibraryEntriesByUserIdAndGameId(userB.id, game.id);
        const entryPlatformCount = await countLibraryEntryPlatformsByUserIdAndGameId(
            userB.id,
            game.id,
        );

        assert.equal(entryCount, 1);
        assert.equal(entryPlatformCount, selectedPlatforms.length);
    });

    test("não deve remover jogo com gameId inválido", async () => {
        const { agent } = await createAuthenticatedAgent();

        const response = await deleteLibraryEntry(agent, 0);

        assert.equal(response.status, 422);
        assert.equal(response.body.error, "Erro de Validação");
    });

    test("não deve remover jogo sem access token", async () => {
        const { user } = await createRegisteredUser();

        const { game, selectedPlatforms } = await createLibraryDataForUser(user.id);

        const response = await deleteLibraryEntryWithoutCookies(game.id);

        assert.equal(response.status, 401);
        assert.equal(response.body.message, "Não autenticado");
        assert.notExists(response.headers["set-cookie"]);

        const entryCount = await countLibraryEntriesByUserIdAndGameId(user.id, game.id);
        const entryPlatformCount = await countLibraryEntryPlatformsByUserIdAndGameId(
            user.id,
            game.id,
        );

        assert.equal(entryCount, 1);
        assert.equal(entryPlatformCount, selectedPlatforms.length);
    });
});
