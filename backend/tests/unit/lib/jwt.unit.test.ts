import { assert, describe, test } from "vitest";
import jwt from "jsonwebtoken";

import { verifyToken } from "../../../src/lib/jwt.js";
describe("jwt.ts", () => {
    describe("verifyToken", () => {
        test("deve rejeitar um token com assinatura válida, mas userId inválido", () => {
            assert.ok(process.env.JWT_SECRET);

            const token = jwt.sign({ userId: "123", sessionVersion: 0 }, process.env.JWT_SECRET);

            assert.throws(() => verifyToken(token), Error, "Token inválido");
        });

        test("deve rejeitar um JWT cujo payload seja uma string", () => {
            assert.ok(process.env.JWT_SECRET);

            const token = jwt.sign("payload inválido", process.env.JWT_SECRET);

            assert.throws(() => verifyToken(token), Error, "Token inválido");
        });

        test.each([
            { scenario: "ausente", sessionVersion: undefined },
            { scenario: "negativa", sessionVersion: -1 },
            { scenario: "fracionária", sessionVersion: 0.5 },
            { scenario: "como texto", sessionVersion: "0" },
        ])(
            "deve rejeitar uma versão de sessão $scenario mesmo com assinatura válida",
            ({ sessionVersion }) => {
                assert.ok(process.env.JWT_SECRET);

                const token = jwt.sign({ userId: 123, sessionVersion }, process.env.JWT_SECRET);

                assert.throws(() => verifyToken(token), Error, "Token inválido");
            },
        );
    });
});
