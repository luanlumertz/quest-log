import { describe, test, assert, vi, expect } from "vitest";

import {
    registerWithMalformedJson,
    requestPrismaNotFound,
    requestUnexpectedError,
} from "../../requests/middlewares/errorHandler.request.js";

describe("errorHandler.middleware.ts", () => {
    test("deve retornar 400 quando receber um JSON malformado", async () => {
        const response = await registerWithMalformedJson();

        assert.equal(response.status, 400);
        assert.equal(response.body.message, "JSON malformado");
    });

    test("deve retornar 500 quando ocorrer um erro inesperado", async () => {
        const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

        try {
            const response = await requestUnexpectedError();

            assert.equal(response.status, 500);
            assert.equal(response.body.message, "Erro interno do servidor");
            assert.notInclude(response.text, "Erro interno de teste");

            expect(consoleSpy).toHaveBeenCalledOnce();
        } finally {
            consoleSpy.mockRestore();
        }
    });

    test("deve retornar 404 quando o Prisma lançar um erro P2025", async () => {
        const response = await requestPrismaNotFound();

        assert.equal(response.status, 404);
        assert.equal(response.body.message, "Registro não encontrado");
    });
});
