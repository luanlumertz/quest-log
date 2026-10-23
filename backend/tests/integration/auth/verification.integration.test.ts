import { describe, test, assert } from "vitest";
import { randomUUID } from "node:crypto";

import { prisma } from "../../../src/lib/prisma.js";
import { completePendingRegistration } from "../../../src/repositories/pendingRegistration.repository.js";

import { getLastVerificationCode } from "../../helpers/http/verificationCode.helper.js";
import { makeRegisterUserPayload } from "../../factories/auth.factory.js";
import { registerUser } from "../../requests/auth/register.request.js";
import { verifyRegistration } from "../../requests/auth/verification.request.js";

describe("POST /auth/register/verify", () => {
    test("não deve concluir uma tentativa substituída depois de sua leitura", async () => {
        const payload = makeRegisterUserPayload();

        const first = await registerUser(payload);

        const snapshot = await prisma.pendingRegistration.findUniqueOrThrow({
            where: { id: first.body.pendingRegistrationId },
        });

        const second = await registerUser({ ...payload, name: "Novo Nome" });

        assert.equal(second.status, 202);
        assert.isNull(await completePendingRegistration(snapshot));
        assert.equal(await prisma.user.count(), 0);

        const active = await prisma.pendingRegistration.findUniqueOrThrow({
            where: { email: payload.email },
        });

        assert.equal(active.id, second.body.pendingRegistrationId);
        assert.equal(active.name, "Novo Nome");
    });

    test("deve criar a conta uma única vez em confirmações simultâneas e consumir a pendência", async () => {
        const registration = await registerUser(makeRegisterUserPayload());

        const payload = {
            pendingRegistrationId: registration.body.pendingRegistrationId,
            code: getLastVerificationCode(),
        };

        const responses = await Promise.all([
            verifyRegistration(payload),
            verifyRegistration(payload),
        ]);

        assert.sameMembers(
            responses.map((response) => response.status),
            [201, 400],
        );

        const user = responses.find((response) => response.status === 201)!.body.user;
        assert.sameMembers(Object.keys(user), ["id", "name", "email"]);

        assert.equal(await prisma.user.count(), 1);
        assert.equal(await prisma.pendingRegistration.count(), 0);
    });

    test.each(["codeExpiresAt", "expiresAt"] as const)(
        "deve rejeitar %s expirado antes da limpeza",
        async (field) => {
            const registration = await registerUser(makeRegisterUserPayload());

            await prisma.pendingRegistration.update({
                where: { id: registration.body.pendingRegistrationId },
                data: { [field]: new Date(0) },
            });

            assert.equal(
                (
                    await verifyRegistration({
                        pendingRegistrationId: registration.body.pendingRegistrationId,
                        code: getLastVerificationCode(),
                    })
                ).status,
                400,
            );
            assert.equal(await prisma.user.count(), 0);
        },
    );

    test("deve bloquear após cinco erros mesmo quando o próximo código está correto", async () => {
        const registration = await registerUser(makeRegisterUserPayload());

        const id = registration.body.pendingRegistrationId;
        const code = getLastVerificationCode();
        const incorrectCode = code === "000000" ? "000001" : "000000";

        for (let attempt = 0; attempt < 5; attempt++) {
            assert.equal(
                (await verifyRegistration({ pendingRegistrationId: id, code: incorrectCode }))
                    .status,
                400,
            );
        }

        assert.equal((await verifyRegistration({ pendingRegistrationId: id, code })).status, 429);
        assert.equal(
            (await prisma.pendingRegistration.findUniqueOrThrow({ where: { id } })).attempts,
            5,
        );
        assert.equal(await prisma.user.count(), 0);
    });

    test("deve rejeitar identificador inexistente e código malformado", async () => {
        assert.equal(
            (await verifyRegistration({ pendingRegistrationId: randomUUID(), code: "123456" }))
                .status,
            400,
        );
        assert.equal(
            (await verifyRegistration({ pendingRegistrationId: randomUUID(), code: "abc" })).status,
            422,
        );
    });
});
