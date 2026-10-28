import pino, { type DestinationStream } from "pino";
import { ZodError } from "zod";
import { AppError } from "../errors/AppError.js";
import { IntegrationError } from "../errors/IntegrationError.js";
import { requestContext } from "../middlewares/requestContext.middleware.js";

function serializeError(error: unknown, depth = 0): object {
    if (!(error instanceof Error) || depth >= 4) {
        return { type: typeof error };
    }

    // Mensagens de bibliotecas podem conter URLs, SQL, destinatários ou credenciais.
    // Preserve apenas mensagens públicas/controladas e os frames da stack.
    return {
        type: error.name,
        ...(error instanceof AppError
            ? { message: error.message, statusCode: error.statusCode }
            : {}),
        ...(error instanceof IntegrationError
            ? {
                  message: error.message,
                  context: {
                      service: error.context.service,
                      operation: error.context.operation,
                      reason: error.context.reason,
                      upstreamStatus: error.context.upstreamStatus,
                  },
              }
            : {}),
        ...("code" in error &&
        typeof error.code === "string" &&
        /^[A-Z][A-Z0-9_]{1,30}$/.test(error.code)
            ? { code: error.code }
            : {}),
        ...(error instanceof ZodError
            ? { issues: error.issues.map(({ code, path }) => ({ code, path })) }
            : {}),
        stack: error.stack
            ?.split("\n")
            .filter((line) => /^\s+at /.test(line))
            .map((line) => line.replace(/https?:\/\/\S+/g, "[URL]"))
            .join("\n"),
        ...(error.cause !== undefined ? { cause: serializeError(error.cause, depth + 1) } : {}),
    };
}

export function createLogger({
    destination,
    level,
}: { destination?: DestinationStream; level?: string } = {}) {
    return pino(
        {
            level:
                level ??
                process.env.LOG_LEVEL ??
                (process.env.NODE_ENV === "test" ? "silent" : "info"),
            base: { service: "questlog-backend" },
            timestamp: pino.stdTimeFunctions.isoTime,
            formatters: { level: (label) => ({ level: label }) },
            mixin: () => ({ ...requestContext.getStore() }),
            serializers: { err: (error: unknown) => serializeError(error) },
            redact: {
                paths: [
                    "body",
                    "headers",
                    "cookies",
                    "req",
                    "res",
                    "url",
                    "email",
                    "to",
                    "password",
                    "currentPassword",
                    "passwordHash",
                    "code",
                    "codeHash",
                    "accessToken",
                    "refreshToken",
                    "resetToken",
                    "token",
                    "apiKey",
                    "secret",
                    "DATABASE_URL",
                    "JWT_SECRET",
                    "RAWG_API_KEY",
                    "BREVO_API_KEY",
                    "ORIGIN_SECRET",
                    "*.password",
                    "*.currentPassword",
                    "*.passwordHash",
                    "*.apiKey",
                    "*.secret",
                ],
                remove: true,
            },
        },
        destination,
    );
}

export const logger = createLogger();
