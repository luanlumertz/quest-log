import type { Request, Response } from "express";
import { registerUser } from "../services/user.service.js"

export async function registerUserController(req: Request, res: Response) {
    try {
        const data = req.body;

        const user = await registerUser(data);

        return res.status(201).json({ user })
    } catch (error) {
        if (error instanceof Error) {
            return res.status(400).json({ message: error.message, });
        }

        return res.status(500).json({ message: "Erro interno do servidor", });
    }
}