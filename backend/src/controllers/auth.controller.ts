import type { Request, Response } from "express";
import { loginUser, registerUser, getCurrentUser, updateUser, deleteUser } from "../services/auth.service.js"
import { clearAccessTokenCookie, setAccessTokenCookie, setRefreshTokenCookie } from "../lib/authCookies.js";
import { refreshAccessToken } from "../services/refreshSession.service.js";

export async function registerUserController(req: Request, res: Response) {
    const data = req.body;

    const user = await registerUser(data);

    return res.status(201).json({ user })
}

export async function loginUserController(req: Request, res: Response) {
    const data = req.body;

    const result = await loginUser(data);

    setAccessTokenCookie(res, result.accessToken);
    setRefreshTokenCookie(res, result.refreshToken);

    return res.status(200).json({ user: result.user });
}

export function logoutUserController(req: Request, res: Response) {
    clearAccessTokenCookie(res);

    return res.status(204).send()
}

export async function getCurrentUserController(req: Request, res: Response) {
    const userId = req.userId!

    const user = await getCurrentUser(userId);

    return res.status(200).json({ user })
}

export async function updateUserController(req: Request, res: Response) {
    const userId = req.userId!
    const data = req.body

    const updatedUser = await updateUser(userId, data);

    return res.status(200).json({ user: updatedUser })
}

export async function deleteUserController(req: Request, res: Response) {
    const userId = req.userId!

    await deleteUser(userId);

    clearAccessTokenCookie(res);

    return res.status(204).send()
}

export async function refreshTokenController(req: Request, res: Response){
    const refreshToken = req.cookies.refreshToken

    const result = await refreshAccessToken(refreshToken);

    setAccessTokenCookie(res, result);

    return res.status(204).send()
}
