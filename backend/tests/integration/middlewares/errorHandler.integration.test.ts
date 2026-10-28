import { logger } from "../../../src/lib/logger.js";
import { describe, test, assert, vi, expect } from "vitest";

import {
    registerWithMalformedJson,
    requestPrismaNotFound,
    requestUnexpectedError,
    requestHandledError,
} from "../../requests/middlewares/errorHandler.request.js";
import { AppError } from "../../../src/errors/AppError.js";
import { IntegrationError } from "../../../src/errors/IntegrationError.js";
import { requestContext } from "../../../src/middlewares/requestContext.middleware.js";

describe("errorHandler.middleware.ts", () => {
    test.each([502, 504])(
        "deve registrar AppError %s uma vez e preservar os detalhes somente no servidor",
        async (statusCode) => {
            const cause = new IntegrationError("HTTP 401 do provedor", {
                service: "rawg",
                operation: "search",
                reason: "http",
                upstreamStatus: 401,
            });
            const error = new AppError("Falha ao buscar jogos", statusCode, { cause });
            let requestId: string | undefined;
            const log = vi.spyOn(logger, "error").mockImplementation(() => {
                requestId = requestContext.getStore()?.requestId;
            });

            try {
                const response = await requestHandledError(error);

                assert.equal(response.status, statusCode);
                assert.deepEqual(response.body, { message: "Falha ao buscar jogos" });
                assert.notInclude(response.text, "HTTP 401");
                assert.equal(response.headers["x-request-id"], requestId);
                assert.match(requestId!, /^[0-9a-f-]{36}$/);
                expect(log).toHaveBeenCalledExactlyOnceWith(
                    {
                        event: "http.request_failed",
                        err: error,
                        method: "GET",
                        route: "/erro-integracao",
                        statusCode,
                    },
                    "Falha na requisição HTTP",
                );
            } finally {
                log.mockRestore();
            }
        },
    );

    test("não deve registrar um erro esperado do cliente como falha do servidor", async () => {
        const log = vi.spyOn(logger, "error");

        try {
            const response = await requestHandledError(new AppError("Jogo não encontrado", 404));

            assert.equal(response.status, 404);
            expect(log).not.toHaveBeenCalled();
        } finally {
            log.mockRestore();
        }
    });

    test("deve retornar 400 quando receber um JSON malformado", async () => {
        const response = await registerWithMalformedJson();

        assert.equal(response.status, 400);
        assert.equal(response.body.message, "JSON malformado");
    });

    test("deve retornar 500 quando ocorrer um erro inesperado", async () => {
        const consoleSpy = vi.spyOn(logger, "error").mockImplementation(() => {});

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
