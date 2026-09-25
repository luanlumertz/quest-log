import { REFRESH_TOKEN_EXPIRES_IN_MS } from "../constants/auth.js";
import { AppError } from "../errors/AppError.js";
import { generateToken } from "../lib/jwt.js";
import { generateRefreshToken, hashRefreshToken } from "../lib/refreshToken.js";
import { createRefreshSession, deleteRefreshSessionById, findRefreshSessionByTokenHash, rotateRefreshSession } from "../repositories/refreshSession.repository.js";

export async function createRefreshSessionForUser(userId: number) {
    const refreshToken = generateRefreshToken();
    const tokenHash = hashRefreshToken(refreshToken);

    const expiresAt = new Date(Date.now() + REFRESH_TOKEN_EXPIRES_IN_MS);

    await createRefreshSession(userId, tokenHash, expiresAt);

    return refreshToken;
}

export async function refreshAccessToken(refreshToken?: string) {
    if (!refreshToken) {
        throw new AppError("Sessão inválida", 401);
    }

    const tokenHash = hashRefreshToken(refreshToken);

    const session = await findRefreshSessionByTokenHash(tokenHash);

    if (!session) {
        throw new AppError("Sessão inválida", 401);
    }

    if (session.expiresAt <= new Date()) {
        await deleteRefreshSessionById(session.id);
        throw new AppError("Sessão inválida", 401);
    }

    const newRefreshToken = generateRefreshToken();

    const newTokenHash = hashRefreshToken(newRefreshToken);

    const expiresAt = new Date(Date.now() + REFRESH_TOKEN_EXPIRES_IN_MS);

    await rotateRefreshSession(session.id, session.userId, newTokenHash, expiresAt);

    const accessToken = generateToken(session.userId);

    return {
        accessToken,
        refreshToken: newRefreshToken
    };
}

export async function revokeRefreshSession(refreshToken?: string) {
    if (!refreshToken) return;

    const tokenHash = hashRefreshToken(refreshToken);

    const session = await findRefreshSessionByTokenHash(tokenHash);

    if (!session) return;

    await deleteRefreshSessionById(session.id);
}
