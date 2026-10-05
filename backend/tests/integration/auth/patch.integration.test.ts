import { assert, describe, test } from "vitest";

import { findUserById } from "../../../src/repositories/user.repository.js";
import type { PublicUser } from "../../../src/types/auth.types.js";

import {
    createAuthenticatedAgent,
    updateCurrentUser,
    updateCurrentUserWithInvalidPayload,
    updateCurrentUserWithoutCookies,
} from "../../helpers/auth.helper.js";

// Valor padrão
const updatePayload = {
    name: "Novo Nome",
};

describe("PATCH /auth/me", () => {
    test("deve atualizar o nome do usuário autenticado", async () => {
        const { agent, user: authenticatedUser } = await createAuthenticatedAgent();

        const updateResponse = await updateCurrentUser(agent, updatePayload);

        assert.equal(updateResponse.status, 200);

        const updatedUser: PublicUser = updateResponse.body.user;

        assert.equal(updatedUser.id, authenticatedUser.id);
        assert.equal(updatedUser.email, authenticatedUser.email);
        assert.equal(updatedUser.name, updatePayload.name);

        assert.notProperty(updatedUser, "password");
        assert.notProperty(updatedUser, "passwordHash");

        const persistedUser = await findUserById(authenticatedUser.id);

        assert.exists(persistedUser);
        assert.equal(persistedUser.name, updatePayload.name);
    });

    test("não deve atualizar usuário sem access token", async () => {
        const updateResponse = await updateCurrentUserWithoutCookies(updatePayload);

        assert.equal(updateResponse.status, 401);
        assert.equal(updateResponse.body.message, "Não autenticado");
        assert.notExists(updateResponse.headers["set-cookie"]);
    });

    test("não deve atualizar usuário com payload inválido", async () => {
        const { agent, user: authenticatedUser } = await createAuthenticatedAgent();

        const invalidUpdatePayload = {
            name: 12345,
        };

        const updateResponse = await updateCurrentUserWithInvalidPayload(agent, invalidUpdatePayload);

        assert.equal(updateResponse.status, 422);
        assert.equal(updateResponse.body.error, "Erro de Validação");

        const persistedUser = await findUserById(authenticatedUser.id);

        assert.exists(persistedUser);
        assert.equal(persistedUser.name, authenticatedUser.name);
    });
});
