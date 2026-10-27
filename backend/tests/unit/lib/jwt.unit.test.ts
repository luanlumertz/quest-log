import { assert, describe, expect, test } from "vitest";
import jwt from "jsonwebtoken";
import { AppError } from "../../../src/errors/AppError.js";

import { verifyToken } from "../../../src/lib/jwt.js";
describe("jwt.ts", () => {
    describe("verifyToken", () => {
        test("deve rejeitar um token com assinatura válida, mas userId inválido", () => {
            assert.ok(process.env.JWT_SECRET);

            const token = jwt.sign({ userId: "123", sessionVersion: 0 }, process.env.JWT_SECRET);

            assert.throws(() => verifyToken(token), AppError, "Token inválido");
            expect(() => verifyToken(token)).toThrowError(
                expect.objectContaining({ statusCode: 401 }),
            );
        });

        test("deve rejeitar um JWT cujo payload seja uma string", () => {
            assert.ok(process.env.JWT_SECRET);

            const token = jwt.sign("payload inválido", process.env.JWT_SECRET);

            assert.throws(() => verifyToken(token), AppError, "Token inválido");
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

                assert.throws(() => verifyToken(token), AppError, "Token inválido");
            },
        );
    });
});
