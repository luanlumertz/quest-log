import { describe, test, assert } from "vitest";
import { prisma } from "../../../src/lib/prisma.js";
import { hashRefreshToken } from "../../../src/lib/refreshToken.js";

import { makeLoginUserPayload } from "../../factories/auth.factory.js";
import { createRegisteredUser, loginUser } from "../../helpers/auth.helper.js";
import { getCookieValue } from "../../helpers/cookies.helper.js";
import {
    countRefreshSessionsByUserId,
    findRefreshSessionByUserId,
} from "../../helpers/refreshSession.helper.js";

describe("POST /auth/login", () => {
    test("deve logar um usuário válido", async () => {
        const { payload: registerPayload, user: registeredUser } =
            await createRegisteredUser();

        const loginPayload = makeLoginUserPayload({
            email: registerPayload.email,
            password: registerPayload.password,
        });
        const loginResponse = await loginUser(loginPayload);

        const loggedUser = loginResponse.body.user;

        assert.equal(loginResponse.status, 200);
        assert.equal(loggedUser.id, registeredUser.id);
        assert.equal(loggedUser.name, registeredUser.name);
        assert.equal(loggedUser.email, registeredUser.email);
        assert.notProperty(loggedUser, "password");
        assert.notProperty(loggedUser, "passwordHash");

        const setCookieHeader = loginResponse.headers["set-cookie"];

        assert.exists(setCookieHeader);

        const cookies = Array.isArray(setCookieHeader)
            ? setCookieHeader
            : [setCookieHeader];

        const accessCookie = cookies.find((cookie) =>
            cookie.startsWith("accessToken="),
        );

        const refreshCookie = cookies.find((cookie) =>
            cookie.startsWith("refreshToken="),
        );

        assert.exists(accessCookie);
        assert.exists(refreshCookie);
        assert.include(accessCookie, "HttpOnly");
        assert.include(refreshCookie, "HttpOnly");

        const refreshToken = getCookieValue(loginResponse, "refreshToken");

        assert.exists(refreshToken);

        const refreshSession = await findRefreshSessionByUserId(loggedUser.id);

        assert.exists(refreshSession);
        assert.equal(refreshSession.tokenHash, hashRefreshToken(refreshToken));
    });

    test("não deve logar usuário com senha incorreta", async () => {
        const { payload: registerPayload, user: registeredUser } =
            await createRegisteredUser();

        const loginPayload = makeLoginUserPayload({
            email: registerPayload.email,
            password: "uma senha que está errada",
        });
        const loginResponse = await loginUser(loginPayload);

        assert.equal(loginResponse.status, 401);
        assert.equal(loginResponse.body.message, "Email ou senha inválidos");

        const refreshSessionCount = await countRefreshSessionsByUserId(
            registeredUser.id,
        );

        assert.equal(refreshSessionCount, 0);
        assert.isUndefined(loginResponse.headers["set-cookie"]);
    });

    test("não deve logar usuário inexistente", async () => {
        const payload = makeLoginUserPayload();
        const response = await loginUser(payload);

        assert.equal(response.status, 401);
        assert.equal(response.body.message, "Email ou senha inválidos");

        const refreshSessionCount = await prisma.refreshSession.count();

        assert.equal(refreshSessionCount, 0);
        assert.isUndefined(response.headers["set-cookie"]);
    });

    test("não deve logar com payload inválido", async () => {
        const payload = makeLoginUserPayload({
            email: "email-invalido",
        });
        const response = await loginUser(payload);

        assert.equal(response.status, 422);
        assert.equal(response.body.error, "Erro de Validação");

        const refreshSessionCount = await prisma.refreshSession.count();

        assert.equal(refreshSessionCount, 0);
        assert.isUndefined(response.headers["set-cookie"]);
    });
});
