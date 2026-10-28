import type { RequestHandler } from "express";
import { AppError } from "../errors/AppError.js";

export function createCsrfProtection(frontendUrl: string): RequestHandler {
    const trustedOrigin = new URL(frontendUrl).origin;

    return (req, _res, next) => {
        if (["GET", "HEAD", "OPTIONS"].includes(req.method)) {
            return next();
        }

        let sourceOrigin = req.get("Origin");

        // Origin tem precedência: uma origem inválida não pode usar Referer como escape.
        if (sourceOrigin === undefined) {
            try {
                sourceOrigin = new URL(req.get("Referer") ?? "").origin;
            } catch {
                throw new AppError("Origem da requisição não permitida.", 403);
            }
        }

        if (sourceOrigin !== trustedOrigin || req.get("X-QuestLog-Request") !== "true") {
            throw new AppError("Origem da requisição não permitida.", 403);
        }

        const hasBody =
            req.headers["transfer-encoding"] !== undefined ||
            Number(req.get("Content-Length") ?? 0) > 0;

        if (hasBody && !req.is("application/json")) {
            throw new AppError("O corpo da requisição deve ser enviado em JSON.", 415);
        }

        return next();
    };
}
