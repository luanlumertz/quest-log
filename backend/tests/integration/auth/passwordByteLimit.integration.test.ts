import request from "supertest";
import { assert, describe, test, vi } from "vitest";

import app from "../../../src/app.js";
import { prisma } from "../../../src/lib/prisma.js";
import { hashPassword } from "../../../src/lib/bcrypt.js";
import { sendEmail } from "../../../src/integrations/mail.js";
import { createAuthenticatedAgent, createRegisteredUser } from "../../fixtures/auth.fixture.js";
import { createAuthorizedPasswordReset } from "../../fixtures/password.fixture.js";
import { makeRegisterUserPayload } from "../../factories/auth.factory.js";
import { registerUser } from "../../requests/auth/register.request.js";
import { loginUser, loginUserWithAgent } from "../../requests/auth/login.request.js";
import { changePassword, resetPassword } from "../../requests/auth/password.request.js";

describe("limite UTF-8 das senhas", () => {
    const oversizedPassword = "é".repeat(36) + "a";

    test("deve rejeitar cadastro acima de 72 bytes sem criar pendência ou enviar e-mail", async () => {
        const response = await registerUser(
            makeRegisterUserPayload({ password: oversizedPassword }),
        );

        assert.equal(response.status, 422);
        assert.equal(await prisma.pendingRegistration.count(), 0);
        assert.equal(await prisma.user.count(), 0);
        assert.equal(vi.mocked(sendEmail).mock.calls.length, 0);
    });

    test("deve autenticar uma senha de exatamente 72 bytes e distinguir seu último caractere", async () => {
        const password = "🎮".repeat(18);
        const { payload } = await createRegisteredUser({ password });

        const accepted = await loginUser({ email: payload.email, password });
        const refused = await loginUser({ email: payload.email, password: "🎮".repeat(17) + "🎲" });

        assert.equal(accepted.status, 200);
        assert.equal(refused.status, 401);
    });

    test("deve rejeitar alteração acima de 72 bytes sem mudar a senha ou invalidar a sessão", async () => {
        const { agent, user, registerPayload } = await createAuthenticatedAgent();
        const before = await prisma.user.findUniqueOrThrow({ where: { id: user.id } });

        const response = await changePassword(agent, {
            currentPassword: registerPayload.password,
            password: oversizedPassword,
        });

        const after = await prisma.user.findUniqueOrThrow({ where: { id: user.id } });
        const currentSession = await agent.get("/auth/me");

        assert.equal(response.status, 422);
        assert.equal(after.passwordHash, before.passwordHash);
        assert.equal(after.sessionVersion, before.sessionVersion);
        assert.equal(currentSession.status, 200);
    });

    test("deve rejeitar redefinição acima de 72 bytes sem consumir a autorização", async () => {
        const { user, payload, resetToken } = await createAuthorizedPasswordReset();
        const before = await prisma.user.findUniqueOrThrow({ where: { id: user.id } });

        const refused = await resetPassword({ resetToken, password: oversizedPassword });
        const after = await prisma.user.findUniqueOrThrow({ where: { id: user.id } });
        const accepted = await resetPassword({ resetToken, password: "é".repeat(36) });
        const login = await loginUser({ email: payload.email, password: "é".repeat(36) });

        assert.equal(refused.status, 422);
        assert.equal(after.passwordHash, before.passwordHash);
        assert.equal(after.sessionVersion, before.sessionVersion);
        assert.equal(accepted.status, 204);
        assert.equal(login.status, 200);
    });

    test("deve permitir login e troca de senha de uma conta antiga acima de 72 bytes", async () => {
        const legacyPassword = "é".repeat(40);
        // Simula uma conta criada antes da validação de bytes, sem passar pelo cadastro novo.
        const user = await prisma.user.create({
            data: {
                name: "Jogador",
                email: "antigo@email.com",
                passwordHash: await hashPassword(legacyPassword),
            },
        });
        const agent = request.agent(app);

        const login = await loginUserWithAgent(agent, {
            email: user.email,
            password: legacyPassword,
        });
        const changed = await changePassword(agent, {
            currentPassword: legacyPassword,
            password: "nova senha123",
        });
        const newLogin = await loginUser({ email: user.email, password: "nova senha123" });

        assert.equal(login.status, 200);
        assert.equal(changed.status, 204);
        assert.equal(newLogin.status, 200);
    });
});
