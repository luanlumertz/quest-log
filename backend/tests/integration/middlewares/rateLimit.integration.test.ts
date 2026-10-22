import { describe, test, assert } from "vitest";
import request from "supertest";

import app from "../../../src/app.js";

import { createRegisteredUser } from "../../fixtures/auth.fixture.js";
import { loginUser } from "../../requests/auth/login.request.js";

describe("Rate limiting de autenticação", () => {
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
    ])("deve bloquear $route após $limit chamadas malsucedidas", async ({ route, limit }) => {
        for (let attempt = 0; attempt < limit; attempt++) {
            assert.equal((await request(app).post(route).send({})).status, 422);
        }

        const response = await request(app).post(route).send({});

        assert.equal(response.status, 429);
        assert.exists(response.headers["retry-after"]);
    });
});
