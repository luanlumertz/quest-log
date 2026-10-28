import type { NextFunction, Request, Response } from "express";
import { AppError } from "../errors/AppError.js";
import { Prisma } from "../generated/prisma/client.js";
import { logger } from "../lib/logger.js";

export function errorHandler(err: unknown, req: Request, res: Response, _next: NextFunction) {
    if (err instanceof AppError) {
        if (err.statusCode >= 500) {
            logHttpFailure(err, req, err.statusCode);
        }
        return res.status(err.statusCode).json({ message: err.message });
    }

    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2025") {
        return res.status(404).json({ message: "Registro não encontrado" });
    }

    if (err instanceof SyntaxError && "type" in err && err.type === "entity.parse.failed") {
        return res.status(400).json({ message: "JSON malformado" });
    }

    logHttpFailure(err, req, 500);

    return res.status(500).json({ message: "Erro interno do servidor" });
}

function logHttpFailure(err: unknown, req: Request, statusCode: number) {
    logger.error(
        {
            event: "http.request_failed",
            err,
            method: req.method,
            route:
                typeof req.route?.path === "string" ? `${req.baseUrl}${req.route.path}` : req.path,
            statusCode,
        },
        "Falha na requisição HTTP",
    );
}
