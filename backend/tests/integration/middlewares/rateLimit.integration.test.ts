import { describe, test, assert } from "vitest";
import request from "supertest";

import app from "../../../src/app.js";

import { createRegisteredUser, createAuthenticatedAgent } from "../../fixtures/auth.fixture.js";
import { loginUser } from "../../requests/auth/login.request.js";
import { changePassword } from "../../requests/auth/password.request.js";

describe("rateLimit.middleware.ts", () => {
    test("logins bem-sucedidos não devem acumular no limite de falhas", async () => {
        const { payload } = await createRegisteredUser();

        for (let attempt = 0; attempt < 12; attempt++) {
            assert.equal(
                (await loginUser({ email: payload.email, password: payload.password })).status,
                200,
            );
        }
    });

    test.each([
        { route: "/auth/register", limit: 10 },
        { route: "/auth/login", limit: 10 },
        { route: "/auth/register/verify", limit: 30 },
        { route: "/auth/register/resend", limit: 10 },
        { route: "/auth/password/forgot", limit: 10 },
        { route: "/auth/password/verify", limit: 30 },
        { route: "/auth/password/reset", limit: 10 },
    ])("deve bloquear $route após $limit chamadas malsucedidas", async ({ route, limit }) => {
        for (let attempt = 0; attempt < limit; attempt++) {
            assert.equal((await request(app).post(route).send({})).status, 422);
        }

        const response = await request(app).post(route).send({});

        assert.equal(response.status, 429);
        assert.exists(response.headers["retry-after"]);
    });

    test("solicitação e reenvio de recuperação devem compartilhar o limite por IP", async () => {
        for (let attempt = 0; attempt < 10; attempt++) {
            const route = attempt % 2 === 0 ? "/auth/password/forgot" : "/auth/password/resend";
            const response = await request(app).post(route).send({});

            assert.equal(response.status, 422);
        }

        const response = await request(app).post("/auth/password/resend").send({});

        assert.equal(response.status, 429);
        assert.exists(response.headers["retry-after"]);
    });

    test("deve limitar erros de senha atual por usuário sem bloquear outra conta no mesmo IP", async () => {
        const first = await createAuthenticatedAgent();
        const second = await createAuthenticatedAgent({ email: "outro@email.com" });
        const payload = { currentPassword: "senha incorreta", password: "nova senha" };

        for (let attempt = 0; attempt < 10; attempt++) {
            assert.equal((await changePassword(first.agent, payload)).status, 400);
        }

        const blocked = await changePassword(first.agent, payload);
        const otherAccount = await changePassword(second.agent, payload);

        assert.equal(blocked.status, 429);
        assert.exists(blocked.headers["retry-after"]);
        assert.equal(otherAccount.status, 400);
    });

    test("deve limitar chamadas de alteração por IP antes da autenticação", async () => {
        for (let attempt = 0; attempt < 30; attempt++) {
            assert.equal((await request(app).patch("/auth/me/password").send({})).status, 401);
        }

        const response = await request(app).patch("/auth/me/password").send({});

        assert.equal(response.status, 429);
        assert.exists(response.headers["retry-after"]);
    });
});
