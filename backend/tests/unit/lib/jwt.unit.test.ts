import { assert, describe, test } from "vitest";
import jwt from "jsonwebtoken";

import { verifyToken } from "../../../src/lib/jwt.js";
describe("jwt.ts", () => {
    describe("verifyToken", () => {
        test("deve rejeitar um token com assinatura válida, mas userId inválido", () => {
            assert.ok(process.env.JWT_SECRET);

            const token = jwt.sign({ userId: "123" }, process.env.JWT_SECRET);

            assert.throws(() => verifyToken(token), Error, "Token inválido");
        });

        test("deve rejeitar um JWT cujo payload seja uma string", () => {
            assert.ok(process.env.JWT_SECRET);

            const token = jwt.sign("payload inválido", process.env.JWT_SECRET);

            assert.throws(() => verifyToken(token), Error, "Token inválido");
        });
    });
});
