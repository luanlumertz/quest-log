import { assert, describe, test } from "vitest";
import { z } from "zod";
import { createLogger } from "../../../src/lib/logger.js";
import { AppError } from "../../../src/errors/AppError.js";
import { IntegrationError } from "../../../src/errors/IntegrationError.js";
import { requestContext } from "../../../src/middlewares/requestContext.middleware.js";

function captureLogs() {
    const lines: string[] = [];
    const logger = createLogger({
        level: "info",
        destination: {
            write: (line) => {
                lines.push(line);
            },
        },
    });
    return { logger, lines };
}

describe("logger", () => {
    test("deve registrar contexto e causa técnica sem mensagens arbitrárias ou credenciais", () => {
        const { logger, lines } = captureLogs();
        const original = Object.assign(
            new Error("senha=segredo https://rawg.example/?key=CHAVE_PRIVADA"),
            { code: "ECONNRESET" },
        );
        const integration = new IntegrationError(
            "Falha RAWG",
            { service: "rawg", operation: "search", reason: "network" },
            original,
        );

        logger.error(
            { err: new AppError("Erro ao buscar jogos", 502, { cause: integration }) },
            "Falha HTTP",
        );

        const entry = JSON.parse(lines[0]!);
        assert.equal(entry.level, "error");
        assert.match(entry.time, /^\d{4}-\d{2}-\d{2}T/);
        assert.equal(entry.err.statusCode, 502);
        assert.equal(entry.err.cause.context.service, "rawg");
        assert.equal(entry.err.cause.cause.code, "ECONNRESET");
        assert.notInclude(lines.join(""), "segredo");
        assert.notInclude(lines.join(""), "CHAVE_PRIVADA");
        assert.include(entry.err.stack, "logger.unit.test");
    });

    test("deve omitir dados sensíveis estruturados e manter somente a estrutura de erros Zod", () => {
        const { logger, lines } = captureLogs();
        const parsed = z
            .object({ name: z.literal("esperado") })
            .safeParse({ name: "VALOR_PRIVADO" });
        assert.isFalse(parsed.success);

        logger.error(
            {
                err: parsed.error,
                body: { password: "SEGREDO" },
                headers: { cookie: "SEGREDO" },
                cookies: { accessToken: "SEGREDO" },
                password: "SEGREDO",
                code: "123456",
                apiKey: "SEGREDO",
                email: "email@privado.test",
                metadata: { password: "SEGREDO", apiKey: "SEGREDO", secret: "SEGREDO" },
                RAWG_API_KEY: "SEGREDO",
                ORIGIN_SECRET: "SEGREDO",
            },
            "Resposta inválida",
        );

        const entry = JSON.parse(lines[0]!);
        assert.deepEqual(entry.err.issues, [{ code: "invalid_value", path: ["name"] }]);
        for (const secret of ["VALOR_PRIVADO", "SEGREDO", "123456", "email@privado.test"]) {
            assert.notInclude(lines.join(""), secret);
        }
    });

    test("deve isolar os identificadores entre chamadas concorrentes e trabalhos assíncronos", async () => {
        const { logger, lines } = captureLogs();

        await Promise.all(
            ["request-a", "request-b"].map((requestId) =>
                requestContext.run({ requestId }, async () => {
                    await new Promise<void>((resolve) => setImmediate(resolve));
                    logger.info({ event: requestId }, "Trabalho em segundo plano");
                    assert.deepEqual(requestContext.getStore(), { requestId });
                }),
            ),
        );
        logger.info("Fora de uma requisição");

        const entries = lines.map((line) => JSON.parse(line));
        assert.equal(entries[0].requestId, entries[0].event);
        assert.equal(entries[1].requestId, entries[1].event);
        assert.notEqual(entries[0].requestId, entries[1].requestId);
        assert.notProperty(entries[2], "requestId");
    });

    test("deve limitar causas circulares e não despejar valores lançados que não sejam Error", () => {
        const { logger, lines } = captureLogs();
        const error = new Error("conteúdo privado");
        error.cause = error;

        logger.error({ err: error }, "Erro circular");
        logger.error({ err: { password: "SEGREDO" } }, "Erro desconhecido");

        assert.lengthOf(lines, 2);
        assert.notInclude(lines.join(""), "SEGREDO");
        assert.notInclude(lines.join(""), "conteúdo privado");
        assert.deepEqual(JSON.parse(lines[1]!).err, { type: "object" });
    });
});
