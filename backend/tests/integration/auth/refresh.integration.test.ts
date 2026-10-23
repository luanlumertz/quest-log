import { describe, test, assert } from "vitest";

import { prisma } from "../../../src/lib/prisma.js";
import { hashRefreshToken } from "../../../src/lib/refreshToken.js";

import { getCookieValue } from "../../helpers/http/cookies.helper.js";
import {
    countRefreshSessionsByUserId,
    findRefreshSessionByUserId,
} from "../../helpers/database/refreshSession.helper.js";
import { createAuthenticatedAgent } from "../../fixtures/auth.fixture.js";
import {
    refreshUser,
    refreshUserWithoutToken,
    refreshUserWithToken,
} from "../../requests/auth/refresh.request.js";

describe("POST /auth/refresh", () => {
    test("deve renovar os tokens e rotacionar a sessão", async () => {
        const { agent, user, loginResponse } = await createAuthenticatedAgent();

        const sessionBefore = await findRefreshSessionByUserId(user.id);

        assert.exists(sessionBefore);

        const refreshResponse = await refreshUser(agent);

        assert.equal(refreshResponse.status, 204);

        const sessionAfter = await findRefreshSessionByUserId(user.id);

        assert.exists(sessionAfter);
        assert.notEqual(sessionAfter.id, sessionBefore.id);
        assert.notEqual(sessionAfter.tokenHash, sessionBefore.tokenHash);

        const sessionCount = await countRefreshSessionsByUserId(user.id);

        assert.equal(sessionCount, 1);

        const refreshTokenBefore = getCookieValue(loginResponse, "refreshToken");
        const refreshTokenAfter = getCookieValue(refreshResponse, "refreshToken");

        const accessTokenAfter = getCookieValue(refreshResponse, "accessToken");

        assert.exists(refreshTokenBefore);
        assert.exists(refreshTokenAfter);
        assert.exists(accessTokenAfter);
        assert.notEqual(refreshTokenBefore, refreshTokenAfter);
        assert.equal(sessionAfter.tokenHash, hashRefreshToken(refreshTokenAfter));
    });

    test("não deve reutilizar refresh token já rotacionado", async () => {
        const { agent, user, loginResponse } = await createAuthenticatedAgent();

        const refreshTokenBefore = getCookieValue(loginResponse, "refreshToken");

        assert.exists(refreshTokenBefore);

        const sessionBefore = await findRefreshSessionByUserId(user.id);

        assert.exists(sessionBefore);

        const refreshResponse = await refreshUser(agent);

        assert.equal(refreshResponse.status, 204);

        const sessionAfter = await findRefreshSessionByUserId(user.id);

        assert.exists(sessionAfter);
        assert.notEqual(sessionAfter.id, sessionBefore.id);
        assert.notEqual(sessionAfter.tokenHash, sessionBefore.tokenHash);

        const sessionCount = await countRefreshSessionsByUserId(user.id);

        assert.equal(sessionCount, 1);

        const refreshInvalid = await refreshUserWithToken(refreshTokenBefore);

        assert.equal(refreshInvalid.status, 401);
        assert.equal(refreshInvalid.body.message, "Sessão inválida");

        const sessionCountAfterInvalidRefresh = await countRefreshSessionsByUserId(user.id);

        assert.equal(sessionCountAfterInvalidRefresh, 1);

        const currentSession = await findRefreshSessionByUserId(user.id);

        assert.exists(currentSession);
        assert.equal(currentSession.id, sessionAfter.id);
        assert.equal(currentSession.tokenHash, sessionAfter.tokenHash);
        assert.isUndefined(refreshInvalid.headers["set-cookie"]);
    });

    test("deve permitir uma única rotação em pedidos simultâneos com o mesmo refresh token", async () => {
        const { user, loginResponse } = await createAuthenticatedAgent();
        const refreshToken = getCookieValue(loginResponse, "refreshToken");

        assert.exists(refreshToken);

        const responses = await Promise.all([
            refreshUserWithToken(refreshToken),
            refreshUserWithToken(refreshToken),
        ]);

        assert.sameMembers(
            responses.map((response) => response.status),
            [204, 401],
        );
        assert.equal(await countRefreshSessionsByUserId(user.id), 1);

        const successful = responses.find((response) => response.status === 204)!;
        const newRefreshToken = getCookieValue(successful, "refreshToken");

        assert.exists(newRefreshToken);

        const nextRefresh = await refreshUserWithToken(newRefreshToken);

        assert.equal(nextRefresh.status, 204);
        assert.equal(await countRefreshSessionsByUserId(user.id), 1);
    });

    test("não deve renovar sessão sem refresh token", async () => {
        const refreshInvalid = await refreshUserWithoutToken();

        assert.equal(refreshInvalid.status, 401);
        assert.equal(refreshInvalid.body.message, "Sessão inválida");

        const sessionCount = await prisma.refreshSession.count();

        assert.equal(sessionCount, 0);
        assert.isUndefined(refreshInvalid.headers["set-cookie"]);
    });

    test("não deve renovar sessão com refresh token expirado", async () => {
        const { agent, user } = await createAuthenticatedAgent();

        const session = await findRefreshSessionByUserId(user.id);

        assert.exists(session);

        await prisma.refreshSession.update({
            where: {
                id: session.id,
            },
            data: {
                expiresAt: new Date("2000-01-01"),
            },
        });

        const refreshInvalid = await refreshUser(agent);

        assert.equal(refreshInvalid.status, 401);
        assert.equal(refreshInvalid.body.message, "Sessão inválida");

        const sessionCount = await countRefreshSessionsByUserId(user.id);

        assert.equal(sessionCount, 0);
        assert.isUndefined(refreshInvalid.headers["set-cookie"]);
    });

    test("deve renovar sessão sem access token quando o refresh token for válido", async () => {
        const { user, loginResponse } = await createAuthenticatedAgent();

        const refreshTokenBefore = getCookieValue(loginResponse, "refreshToken");

        assert.exists(refreshTokenBefore);

        const sessionBefore = await findRefreshSessionByUserId(user.id);

        assert.exists(sessionBefore);

        const refreshResponse = await refreshUserWithToken(refreshTokenBefore);

        assert.equal(refreshResponse.status, 204);

        const accessTokenAfter = getCookieValue(refreshResponse, "accessToken");
        const refreshTokenAfter = getCookieValue(refreshResponse, "refreshToken");

        assert.exists(accessTokenAfter);
        assert.exists(refreshTokenAfter);
        assert.notEqual(refreshTokenAfter, refreshTokenBefore);

        const sessionAfter = await findRefreshSessionByUserId(user.id);

        assert.exists(sessionAfter);
        assert.notEqual(sessionAfter.id, sessionBefore.id);
        assert.notEqual(sessionAfter.tokenHash, sessionBefore.tokenHash);
        assert.equal(sessionAfter.tokenHash, hashRefreshToken(refreshTokenAfter));

        const sessionCount = await countRefreshSessionsByUserId(user.id);

        assert.equal(sessionCount, 1);
    });
});
