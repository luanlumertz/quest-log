import type { Request, Response } from "express";
import { loginUser, registerUser, getCurrentUser } from "../services/auth.service.js"

export async function registerUserController(req: Request, res: Response) {
    const data = req.body;

    const user = await registerUser(data);

    return res.status(201).json({ user })
}

export async function loginUserController(req: Request, res: Response) {
    const data = req.body;

    const result = await loginUser(data);

    res.cookie("accessToken", result.token, {
        httpOnly: true,
        sameSite: "lax",
        secure: false, // enquanto estiver em desenvolvimento
        maxAge: 60 * 60 * 1000
    })

    return res.status(200).json(result.user);
}

export function logoutUserController(req: Request, res: Response) {
    res.clearCookie("accessToken", {
        httpOnly: true,
        sameSite: "lax",
        secure: false, // enquanto estiver em desenvolvimento
    })

    return res.status(204).send()
}

export async function getCurrentUserController(req: Request, res: Response) {
    const userId = req.userId!

    const user = await getCurrentUser(userId);

    return res.status(200).json({ user })
}