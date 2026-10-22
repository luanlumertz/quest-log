import type { Request, Response } from "express";
import {
    loginUser,
    registerUser,
    getCurrentUser,
    updateUser,
    deleteUser,
    verifyRegistration,
} from "../services/auth.service.js";
import {
    clearAccessTokenCookie,
    clearRefreshTokenCookie,
    setAccessTokenCookie,
    setRefreshTokenCookie,
} from "../lib/authCookies.js";
import { refreshAccessToken, revokeRefreshSession } from "../services/refreshSession.service.js";
import type { RegisterUserData, LoginUserData, UpdateUserData } from "../schemas/auth.schema.js";

export async function registerUserController(
    req: Request<Record<string, string>, unknown, RegisterUserData>,
    res: Response,
) {
    const data = req.body;

    const result = await registerUser(data);

    return res.status(202).json(result);
}

export async function loginUserController(
    req: Request<Record<string, string>, unknown, LoginUserData>,
    res: Response,
) {
    const data = req.body;

    const result = await loginUser(data);

    setAccessTokenCookie(res, result.accessToken);
    setRefreshTokenCookie(res, result.refreshToken);

    return res.status(200).json({ user: result.user });
}

export async function logoutUserController(req: Request, res: Response) {
    const refreshToken = req.cookies.refreshToken;

    await revokeRefreshSession(refreshToken);

    clearAccessTokenCookie(res);
    clearRefreshTokenCookie(res);

    return res.status(204).send();
}

export async function getCurrentUserController(req: Request, res: Response) {
    const userId = req.userId!;

    const user = await getCurrentUser(userId);

    return res.status(200).json({ user });
}

export async function updateUserController(
    req: Request<Record<string, string>, unknown, UpdateUserData>,
    res: Response,
) {
    const userId = req.userId!;
    const data = req.body;

    const updatedUser = await updateUser(userId, data);

    return res.status(200).json({ user: updatedUser });
}

export async function deleteUserController(req: Request, res: Response) {
    const userId = req.userId!;

    await deleteUser(userId);

    clearAccessTokenCookie(res);
    clearRefreshTokenCookie(res);

    return res.status(204).send();
}

export async function refreshTokenController(req: Request, res: Response) {
    const refreshToken = req.cookies.refreshToken;

    const result = await refreshAccessToken(refreshToken);

    setAccessTokenCookie(res, result.accessToken);
    setRefreshTokenCookie(res, result.refreshToken);

    return res.status(204).send();
}

export async function verifyRegistrationController(req: Request, res: Response) {
    const user = await verifyRegistration(req.body);

    return res.status(201).json({ user });
}
