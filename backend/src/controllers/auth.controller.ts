import type { Request, Response } from "express";
import { loginUser, registerUser, getCurrentUser, updateUser, deleteUser } from "../services/auth.service.js"
import { ACCESS_TOKEN_EXPIRES_IN_MS, REFRESH_TOKEN_EXPIRES_IN_MS } from "../constants/auth.js";

export async function registerUserController(req: Request, res: Response) {
    const data = req.body;

    const user = await registerUser(data);

    return res.status(201).json({ user })
}

export async function loginUserController(req: Request, res: Response) {
    const data = req.body;

    const result = await loginUser(data);

    res.cookie("accessToken", result.accessToken, {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        maxAge: ACCESS_TOKEN_EXPIRES_IN_MS,
        path: "/"
    })

    res.cookie("refreshToken", result.refreshToken, {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        maxAge: REFRESH_TOKEN_EXPIRES_IN_MS,
        path: "/auth"
    })

    return res.status(200).json({ user: result.user });
}

export function logoutUserController(req: Request, res: Response) {
    res.clearCookie("accessToken", {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production"
    })

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

    res.clearCookie("accessToken", {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production"
    })

    return res.status(204).send()
}
