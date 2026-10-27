import request from "supertest";
import { assert, describe, test } from "vitest";
import app from "../../../src/app.js";
import { createAuthenticatedAgent } from "../../fixtures/auth.fixture.js";
import { csrfHeaders } from "../../helpers/http/csrf.helper.js";
import { prisma } from "../../../src/lib/prisma.js";

describe("proteção CSRF da API", () => {
    test("deve rejeitar mudanças de perfil sem afetar os dados mesmo com cookies válidos", async () => {
        const { agent, user } = await createAuthenticatedAgent();

        const missingHeader = await agent.patch("/auth/me").send({ name: "Nome alterado" });
        const foreignOrigin = await agent
            .patch("/auth/me")
            .set(csrfHeaders)
            .set("Origin", "https://evil.example")
            .send({ name: "Nome alterado" });
        const form = await agent
            .patch("/auth/me")
            .set(csrfHeaders)
            .type("form")
            .send({ name: "Nome alterado" });
        const deletion = await agent.delete("/auth/me");

        const persisted = await prisma.user.findUnique({ where: { id: user.id } });

        assert.equal(missingHeader.status, 403);
        assert.equal(foreignOrigin.status, 403);
        assert.equal(form.status, 415);
        assert.equal(deletion.status, 403);
        assert.equal(persisted?.name, user.name);
    });

    test.each(["/auth/login", "/auth/logout", "/auth/refresh", "/auth/register", "/library"])(
        "deve proteger %s antes do controller e da autenticação",
        async (route) => {
            const response = await request(app).post(route).send({});

            assert.equal(response.status, 403);
            assert.notProperty(response.headers, "set-cookie");
        },
    );

    test("deve permitir o preflight do frontend com o cabeçalho obrigatório", async () => {
        const response = await request(app)
            .options("/auth/login")
            .set("Origin", csrfHeaders.Origin)
            .set("Access-Control-Request-Method", "POST")
            .set("Access-Control-Request-Headers", "content-type,x-questlog-request");

        assert.equal(response.status, 204);
        assert.equal(response.headers["access-control-allow-origin"], csrfHeaders.Origin);
        assert.include(response.headers["access-control-allow-headers"], "x-questlog-request");
    });
});
