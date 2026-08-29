import type { NextFunction, Request, Response } from "express";
import { AppError } from "../errors/AppError.js";
import { verifyToken } from "../lib/jwt.js";

export function authenticateToken(req: Request, res: Response, next: NextFunction) {
    const accessToken = req.cookies.accessToken;

    if (!accessToken) {
        throw new AppError("Não autenticado", 401)
    }

    try {
        const payload = verifyToken(accessToken);
        req.userId = payload.userId;
    } catch {
        throw new AppError("Não autenticado", 401);
    }
    
    next();
}
