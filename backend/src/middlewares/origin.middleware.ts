import { timingSafeEqual } from "node:crypto";
import type { RequestHandler } from "express";
import { AppError } from "../errors/AppError.js";

export function createOriginProtection(secret: string | undefined): RequestHandler {
    if (process.env.NODE_ENV === "production" && (!secret || secret.length < 32)) {
        throw new Error("ORIGIN_SECRET deve ter pelo menos 32 caracteres em produção.");
    }

    return (req, _res, next) => {
        // O healthcheck do Render não passa pelo proxy da Vercel.
        if (!secret || (req.path === "/healthz" && ["GET", "HEAD"].includes(req.method))) {
            return next();
        }

        const provided = Buffer.from(req.get("X-QuestLog-Origin-Secret") ?? "");
        const expected = Buffer.from(secret);

        if (provided.length !== expected.length || !timingSafeEqual(provided, expected)) {
            throw new AppError("Acesso à API não permitido.", 403);
        }

        return next();
    };
}
