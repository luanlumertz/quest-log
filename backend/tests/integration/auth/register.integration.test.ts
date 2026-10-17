import { describe, test, assert } from "vitest";
import bcrypt from "bcryptjs";

import { prisma } from "../../../src/lib/prisma.js";

import { registerUser } from "../../requests/auth/register.request.js";
import { makeRegisterUserPayload } from "../../factories/auth.factory.js";

describe("POST /auth/register", () => {
    test("deve cadastrar um usuário válido", async () => {
        const payload = makeRegisterUserPayload();
        const response = await registerUser(payload);
        const user = response.body.user;

        assert.equal(response.status, 201);
        assert.equal(user.name, payload.name);
        assert.equal(user.email, payload.email);
        assert.exists(user.id);
        assert.notProperty(user, "password");
        assert.notProperty(user, "passwordHash");

        const userInDatabase = await prisma.user.findUnique({
            where: {
                email: payload.email,
            },
        });

        assert.exists(userInDatabase);
        assert.equal(userInDatabase.id, user.id);
        assert.equal(userInDatabase.name, payload.name);
        assert.equal(userInDatabase.email, payload.email);

        const passwordIsValid = await bcrypt.compare(payload.password, userInDatabase.passwordHash);

        assert.isTrue(passwordIsValid);
    });

    test("não deve cadastrar usuário com e-mail já utilizado", async () => {
        const firstUser = makeRegisterUserPayload();
        const secondUser = makeRegisterUserPayload({
            name: "Fulano",
            password: "87654321",
        });

        const responseValid = await registerUser(firstUser);

        assert.equal(responseValid.status, 201);

        const responseInvalid = await registerUser(secondUser);

        assert.equal(responseInvalid.status, 409);
        assert.equal(responseInvalid.body.message, "Este e-mail já está em uso");

        const userCount = await prisma.user.count({
            where: {
                email: firstUser.email,
            },
        });

        assert.equal(userCount, 1);
    });

    test("não deve cadastrar usuário com payload inválido", async () => {
        const payload = makeRegisterUserPayload({
            email: "email-invalido",
        });
        const response = await registerUser(payload);

        assert.equal(response.status, 422);
        assert.equal(response.body.error, "Erro de Validação");

        const userCount = await prisma.user.count();

        assert.equal(userCount, 0);
    });
});
