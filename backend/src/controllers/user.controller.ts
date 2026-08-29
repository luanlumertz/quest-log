import type { Request, Response } from "express";
import { registerUser } from "../services/user.service.js"

export async function registerUserController(req: Request, res: Response) {
    const data = req.body;

    const user = await registerUser(data);

    return res.status(201).json({ user })
}