import type { NextFunction, Request, Response } from "express";
import { AppError } from "../errors/AppError.js";

export function errorHandler(err: unknown, req: Request, res: Response, next: NextFunction) {
    if (err instanceof AppError) {
        return res.status(err.statusCode).json({ message: err.message })
    }

    if (err instanceof SyntaxError && "type" in err && err.type === "entity.parse.failed") {
        return res.status(400).json({ message: "JSON malformado" });
    }

    console.error(err);

    return res.status(500).json({ message: "Erro interno do servidor" })
}