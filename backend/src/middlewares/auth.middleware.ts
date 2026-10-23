import type { NextFunction, Request, Response } from "express";
import { AppError } from "../errors/AppError.js";
import { verifyToken } from "../lib/jwt.js";
import { findUserById } from "../repositories/user.repository.js";

export async function authenticateToken(req: Request, _res: Response, next: NextFunction) {
    const accessToken = req.cookies.accessToken;

    if (!accessToken) {
        throw new AppError("Não autenticado", 401);
    }

    let payload;

    try {
        payload = verifyToken(accessToken);
    } catch {
        throw new AppError("Não autenticado", 401);
    }

    const user = await findUserById(payload.userId);

    if (!user || user.sessionVersion !== payload.sessionVersion) {
        throw new AppError("Não autenticado", 401);
    }

    req.userId = user.id;

    next();
}
