import { assert, describe, test } from "vitest";

import { prisma } from "../../../src/lib/prisma.js";
import { hashRefreshToken } from "../../../src/lib/refreshToken.js";
import { findRefreshSessionByTokenHash } from "../../../src/repositories/refreshSession.repository.js";

import { getAuthCookiesFromResponse, getCookieValue } from "../../helpers/http/cookies.helper.js";
import {
    countRefreshSessionsByUserId,
    findRefreshSessionByUserId,
} from "../../helpers/database/refreshSession.helper.js";
import { createAuthenticatedAgent, createRegisteredUser } from "../../fixtures/auth.fixture.js";
import { makeLoginUserPayload } from "../../factories/auth.factory.js";
import {
    logoutUser,
    logoutUserWithoutCookies,
    logoutUserWithToken,
} from "../../requests/auth/logout.request.js";
import { loginUser } from "../../requests/auth/login.request.js";

describe("POST /auth/logout", () => {
    test("deve encerrar a sessão atual do usuário", async () => {
        const { agent, user } = await createAuthenticatedAgent();

        const sessionBefore = await findRefreshSessionByUserId(user.id);

        assert.exists(sessionBefore);

        const logoutResponse = await logoutUser(agent);

        assert.equal(logoutResponse.status, 204);

        const sessionAfter = await findRefreshSessionByUserId(user.id);

        assert.notExists(sessionAfter);

        const { accessTokenCookie, refreshTokenCookie } =
            getAuthCookiesFromResponse(logoutResponse);

        assert.exists(accessTokenCookie);
        assert.exists(refreshTokenCookie);

        assert.include(accessTokenCookie, "accessToken=;");
        assert.include(accessTokenCookie, "Expires=Thu, 01 Jan 1970 00:00:00 GMT");

        assert.include(refreshTokenCookie, "refreshToken=;");
        assert.include(refreshTokenCookie, "Expires=Thu, 01 Jan 1970 00:00:00 GMT");
    });

    test("deve retornar 204 mesmo sem refresh token", async () => {
        const logoutResponse = await logoutUserWithoutCookies();

        assert.equal(logoutResponse.status, 204);

        const session = await prisma.refreshSession.count();

        assert.equal(session, 0);

        const { accessTokenCookie, refreshTokenCookie } =
            getAuthCookiesFromResponse(logoutResponse);

        assert.exists(accessTokenCookie);
        assert.exists(refreshTokenCookie);

        assert.include(accessTokenCookie, "accessToken=;");
        assert.include(accessTokenCookie, "Expires=Thu, 01 Jan 1970 00:00:00 GMT");

        assert.include(refreshTokenCookie, "refreshToken=;");
        assert.include(refreshTokenCookie, "Expires=Thu, 01 Jan 1970 00:00:00 GMT");
    });

    test("deve retornar 204 com refresh token inválido sem afetar sessões válidas", async () => {
        const { user } = await createAuthenticatedAgent();

        const sessionBefore = await findRefreshSessionByUserId(user.id);

        assert.exists(sessionBefore);

        const logoutResponse = await logoutUserWithToken("token-inexistente");

        assert.equal(logoutResponse.status, 204);

        const sessionAfter = await findRefreshSessionByUserId(user.id);

        assert.exists(sessionAfter);

        assert.equal(sessionAfter.id, sessionBefore.id);
        assert.equal(sessionAfter.tokenHash, sessionBefore.tokenHash);

        const sessionCount = await countRefreshSessionsByUserId(user.id);

        assert.equal(sessionCount, 1);

        const { accessTokenCookie, refreshTokenCookie } =
            getAuthCookiesFromResponse(logoutResponse);

        assert.exists(accessTokenCookie);
        assert.exists(refreshTokenCookie);

        assert.include(accessTokenCookie, "accessToken=;");
        assert.include(accessTokenCookie, "Expires=Thu, 01 Jan 1970 00:00:00 GMT");

        assert.include(refreshTokenCookie, "refreshToken=;");
        assert.include(refreshTokenCookie, "Expires=Thu, 01 Jan 1970 00:00:00 GMT");
    });

    test("deve revogar apenas a sessão atual quando o usuário possui múltiplas sessões", async () => {
        const { user, payload } = await createRegisteredUser();

        const loginPayload = makeLoginUserPayload({
            email: payload.email,
            password: payload.password,
        });

        const loginResponseA = await loginUser(loginPayload);
        const loginResponseB = await loginUser(loginPayload);

        assert.equal(loginResponseA.status, 200);
        assert.equal(loginResponseB.status, 200);

        const refreshTokenA = getCookieValue(loginResponseA, "refreshToken");
        const refreshTokenB = getCookieValue(loginResponseB, "refreshToken");

        assert.exists(refreshTokenA);
        assert.exists(refreshTokenB);

        const tokenHashA = hashRefreshToken(refreshTokenA);
        const tokenHashB = hashRefreshToken(refreshTokenB);

        assert.notEqual(tokenHashA, tokenHashB);

        const sessionA = await findRefreshSessionByTokenHash(tokenHashA);
        const sessionB = await findRefreshSessionByTokenHash(tokenHashB);

        assert.exists(sessionA);
        assert.exists(sessionB);

        const sessionsCountBefore = await countRefreshSessionsByUserId(user.id);

        assert.equal(sessionsCountBefore, 2);

        const logoutResponse = await logoutUserWithToken(refreshTokenA);

        assert.equal(logoutResponse.status, 204);

        const sessionsCountAfter = await countRefreshSessionsByUserId(user.id);

        assert.equal(sessionsCountAfter, 1);

        const sessionAAfter = await findRefreshSessionByTokenHash(tokenHashA);
        const sessionBAfter = await findRefreshSessionByTokenHash(tokenHashB);

        assert.notExists(sessionAAfter);
        assert.exists(sessionBAfter);

        assert.equal(sessionBAfter.id, sessionB.id);
        assert.equal(sessionBAfter.tokenHash, sessionB.tokenHash);
    });
});
