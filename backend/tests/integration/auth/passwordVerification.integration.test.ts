import { assert, describe, test } from "vitest";

import { prisma } from "../../../src/lib/prisma.js";
import { hashPasswordResetToken } from "../../../src/lib/passwordResetToken.js";

import { createPasswordRecovery } from "../../fixtures/password.fixture.js";
import { loginUser } from "../../requests/auth/login.request.js";
import { getCurrentUserResponseWithToken } from "../../requests/auth/me.request.js";
import { verifyPasswordRecovery } from "../../requests/auth/password.request.js";

describe("POST /auth/password/verify", () => {
    test("deve consumir o código, armazenar somente o hash da autorização e preservar a senha", async () => {
        const { user, payload, code } = await createPasswordRecovery();

        const response = await verifyPasswordRecovery({ email: payload.email, code });

        assert.equal(response.status, 200);
        assert.equal(response.headers["cache-control"], "no-store");
        assert.match(response.body.resetToken, /^[a-f0-9]{64}$/);
        assert.equal(response.body.expiresIn, 600);
        assert.sameMembers(Object.keys(response.body), ["resetToken", "expiresIn"]);

        const recovery = await prisma.passwordRecovery.findUniqueOrThrow({
            where: { userId: user.id },
        });

        assert.isNull(recovery.codeHash);
        assert.equal(recovery.resetTokenHash, hashPasswordResetToken(response.body.resetToken));
        assert.isAbove(recovery.resetTokenExpiresAt!.getTime(), Date.now());
        assert.isAtMost(recovery.resetTokenExpiresAt!.getTime(), Date.now() + 600_000);

        const reused = await verifyPasswordRecovery({ email: payload.email, code });
        const login = await loginUser({ email: payload.email, password: payload.password });
        const grantAsAccessToken = await getCurrentUserResponseWithToken(response.body.resetToken);

        assert.equal(reused.status, 400);
        assert.equal(login.status, 200);
        assert.equal(grantAsAccessToken.status, 401);
    });

    test("deve rejeitar código expirado antes da limpeza", async () => {
        const { payload, recovery, code } = await createPasswordRecovery();

        await prisma.passwordRecovery.update({
            where: { id: recovery.id },
            data: { codeExpiresAt: new Date(0) },
        });

        const response = await verifyPasswordRecovery({ email: payload.email, code });

        assert.equal(response.status, 400);
        assert.equal(response.body.message, "Código inválido ou expirado.");

        const persisted = await prisma.passwordRecovery.findUniqueOrThrow({
            where: { id: recovery.id },
        });

        assert.isNull(persisted.resetTokenHash);
        assert.equal(persisted.attempts, 0);
    });

    test("deve bloquear após cinco erros mesmo quando o próximo código estiver correto", async () => {
        const { payload, recovery, code } = await createPasswordRecovery();
        const incorrectCode = code === "000000" ? "000001" : "000000";

        for (let attempt = 0; attempt < 5; attempt++) {
            const response = await verifyPasswordRecovery({
                email: payload.email,
                code: incorrectCode,
            });

            assert.equal(response.status, 400);
            assert.equal(response.body.message, "Código inválido ou expirado.");
        }

        const blocked = await verifyPasswordRecovery({ email: payload.email, code });
        const persisted = await prisma.passwordRecovery.findUniqueOrThrow({
            where: { id: recovery.id },
        });

        assert.equal(blocked.status, 400);
        assert.equal(persisted.attempts, 5);
        assert.isNull(persisted.resetTokenHash);
    });

    test("deve rejeitar conta sem recuperação sem revelar sua existência", async () => {
        const { payload, code } = await createPasswordRecovery();
        const incorrectCode = code === "000000" ? "000001" : "000000";

        const existing = await verifyPasswordRecovery({
            email: payload.email,
            code: incorrectCode,
        });
        const missing = await verifyPasswordRecovery({
            email: "inexistente@email.com",
            code: incorrectCode,
        });

        assert.equal(existing.status, 400);
        assert.equal(missing.status, 400);
        assert.deepEqual(missing.body, existing.body);
        assert.equal(await prisma.passwordRecovery.count(), 1);
    });

    test("deve emitir uma única autorização para confirmações simultâneas", async () => {
        const { payload, code, user } = await createPasswordRecovery();
        const responses = await Promise.all([
            verifyPasswordRecovery({ email: payload.email, code }),
            verifyPasswordRecovery({ email: payload.email, code }),
        ]);

        assert.sameMembers(
            responses.map((response) => response.status),
            [200, 400],
        );

        const successful = responses.find((response) => response.status === 200)!;
        const recovery = await prisma.passwordRecovery.findUniqueOrThrow({
            where: { userId: user.id },
        });

        assert.isNull(recovery.codeHash);
        assert.equal(recovery.resetTokenHash, hashPasswordResetToken(successful.body.resetToken));
    });
});
