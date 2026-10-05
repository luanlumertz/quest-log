import { assert, describe, test } from "vitest";

import { prisma } from "../../../src/lib/prisma.js";
import { findUserById } from "../../../src/repositories/user.repository.js";

import { countRefreshSessionsByUserId } from "../../helpers/database/refreshSession.helper.js";
import { getAuthCookiesFromResponse } from "../../helpers/http/cookies.helper.js";
import { createLibraryDataForUser } from "../../fixtures/library.fixture.js";
import { createAuthenticatedAgent, createRegisteredUser } from "../../fixtures/auth.fixture.js";
import { deleteCurrentUser, deleteCurrentUserWithoutCookies } from "../../requests/auth/me.request.js";

describe("DELETE /auth/me", () => {
    test("deve excluir a conta do usuário autenticado", async () => {
        const { agent, user } = await createAuthenticatedAgent();

        const sessionCountBefore = await countRefreshSessionsByUserId(user.id);

        assert.equal(sessionCountBefore, 1);

        const deleteResponse = await deleteCurrentUser(agent);

        assert.equal(deleteResponse.status, 204);

        const deletedUser = await findUserById(user.id);
        const sessionCountAfter = await countRefreshSessionsByUserId(user.id);

        assert.notExists(deletedUser);
        assert.equal(sessionCountAfter, 0);

        const { accessTokenCookie, refreshTokenCookie } = getAuthCookiesFromResponse(deleteResponse);

        assert.exists(accessTokenCookie);
        assert.exists(refreshTokenCookie);

        assert.include(accessTokenCookie, "accessToken=;");
        assert.include(accessTokenCookie, "Expires=Thu, 01 Jan 1970 00:00:00 GMT");

        assert.include(refreshTokenCookie, "refreshToken=;");
        assert.include(refreshTokenCookie, "Expires=Thu, 01 Jan 1970 00:00:00 GMT");
    });

    test("não deve excluir usuário sem access token", async () => {
        const { user } = await createRegisteredUser();

        const deleteResponse = await deleteCurrentUserWithoutCookies();

        assert.equal(deleteResponse.status, 401);
        assert.equal(deleteResponse.body.message, "Não autenticado");
        assert.notExists(deleteResponse.headers["set-cookie"]);

        const persistedUser = await findUserById(user.id);

        assert.exists(persistedUser);
    });

    test("deve excluir os dados pessoais do usuário sem remover dados globais dos jogos", async () => {
        const { agent, user } = await createAuthenticatedAgent();

        const { game, platform, gamePlatform, libraryEntry, libraryEntryPlatform } =
            await createLibraryDataForUser(user.id);

        const sessionCountBefore = await countRefreshSessionsByUserId(user.id);

        assert.equal(sessionCountBefore, 1);

        const deleteResponse = await deleteCurrentUser(agent);

        assert.equal(deleteResponse.status, 204);

        const deletedUser = await findUserById(user.id);

        const sessionCountAfter = await countRefreshSessionsByUserId(user.id);

        const persistedLibraryEntry = await prisma.libraryEntry.findUnique({
            where: {
                userId_gameId: {
                    userId: libraryEntry.userId,
                    gameId: libraryEntry.gameId,
                },
            },
        });

        const persistedLibraryEntryPlatform = await prisma.libraryEntryPlatform.findUnique({
            where: {
                userId_gameId_platformId: {
                    userId: libraryEntryPlatform.userId,
                    gameId: libraryEntryPlatform.gameId,
                    platformId: libraryEntryPlatform.platformId,
                },
            },
        });

        const persistedGame = await prisma.game.findUnique({
            where: {
                id: game.id,
            },
        });

        const persistedPlatform = await prisma.platform.findUnique({
            where: {
                id: platform.id,
            },
        });

        const persistedGamePlatform = await prisma.gamePlatform.findUnique({
            where: {
                gameId_platformId: {
                    gameId: gamePlatform.gameId,
                    platformId: gamePlatform.platformId,
                },
            },
        });

        assert.notExists(deletedUser);
        assert.equal(sessionCountAfter, 0);

        assert.notExists(persistedLibraryEntry);
        assert.notExists(persistedLibraryEntryPlatform);

        assert.exists(persistedGame);
        assert.exists(persistedPlatform);
        assert.exists(persistedGamePlatform);
    });
});
