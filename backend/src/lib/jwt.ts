import jwt from "jsonwebtoken";
import { ACCESS_TOKEN_EXPIRES_IN_SECONDS } from "../constants/auth.js";
import { AppError } from "../errors/AppError.js";

const JWT_SECRET = process.env.JWT_SECRET as string;

if (!JWT_SECRET) {
    throw new Error("JWT_SECRET não configurado");
}

export function generateToken(userId: number, sessionVersion = 0) {
    return jwt.sign({ userId, sessionVersion }, JWT_SECRET, {
        expiresIn: ACCESS_TOKEN_EXPIRES_IN_SECONDS,
    });
}

export function verifyToken(token: string) {
    const payload = jwt.verify(token, JWT_SECRET);

    if (
        typeof payload === "string" ||
        !Number.isSafeInteger(payload.userId) ||
        !Number.isSafeInteger(payload.sessionVersion) ||
        payload.sessionVersion < 0
    ) {
        throw new AppError("Token inválido", 401);
    }

    return {
        ...payload,
        userId: payload.userId,
        sessionVersion: payload.sessionVersion,
    };
}
