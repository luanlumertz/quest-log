import jwt, { type JwtPayload } from "jsonwebtoken";
import { ACCESS_TOKEN_EXPIRES_IN_SECONDS } from "../constants/auth.js";

const JWT_SECRET = process.env.JWT_SECRET as string;

if (!JWT_SECRET) {
    throw new Error("JWT_SECRET não configurado");
};

export function generateToken(userId: number) {
    return jwt.sign({ userId }, JWT_SECRET, { expiresIn: ACCESS_TOKEN_EXPIRES_IN_SECONDS });
};

export function verifyToken(token: string) {
    const payload = jwt.verify(token, JWT_SECRET);

    if (
        typeof payload === "string" ||
        typeof payload.userId !== "number"
    ) {
        throw new Error("Token inválido");
    }

    return {
        ...payload,
        userId: payload.userId,
    };
}
