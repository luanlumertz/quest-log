import { assert, describe, test } from "vitest";

import { deleteUserById } from "../../../src/repositories/user.repository.js";
import type { PublicUser } from "../../../src/types/auth.types.js";

import { createAuthenticatedAgent } from "../../fixtures/auth.fixture.js";
import {
    getCurrentUserResponse,
    getCurrentUserResponseWithoutCookies,
    getCurrentUserResponseWithToken,
} from "../../requests/auth/me.request.js";

describe("GET /auth/me", () => {
    test("deve retornar o usuário autenticado", async () => {
        const { agent, user: registeredUser } = await createAuthenticatedAgent();

        const meResponse = await getCurrentUserResponse(agent);

        assert.equal(meResponse.status, 200);

        const user: PublicUser = meResponse.body.user;

        assert.equal(registeredUser.id, user.id);
        assert.equal(registeredUser.name, user.name);
        assert.equal(registeredUser.email, user.email);

        assert.notProperty(meResponse.body.user, "password");
        assert.notProperty(meResponse.body.user, "passwordHash");
    });

    test("não deve retornar usuário sem access token", async () => {
        const meResponse = await getCurrentUserResponseWithoutCookies();

        assert.equal(meResponse.status, 401);
        assert.equal(meResponse.body.message, "Não autenticado");
        assert.notExists(meResponse.headers["set-cookie"]);
    });

    test("não deve retornar usuário com access token inválido", async () => {
        const meResponse = await getCurrentUserResponseWithToken("accessToken-invalido");

        assert.equal(meResponse.status, 401);
        assert.equal(meResponse.body.message, "Não autenticado");
        assert.notExists(meResponse.headers["set-cookie"]);
    });

    test("não deve retornar usuário autenticado que não existe mais", async () => {
        const { agent, user } = await createAuthenticatedAgent();

        await deleteUserById(user.id);

        const meResponse = await getCurrentUserResponse(agent);

        assert.equal(meResponse.status, 401);
        assert.equal(meResponse.body.message, "Não autenticado");
    });
});
