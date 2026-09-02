import type { Request, Response } from "express";
import { AppError } from "../errors/AppError.js";
import { searchGame } from "../services/game.service.js";

export async function searchGameController(req: Request, res: Response) {
    const query = req.query.query

    if (!query || typeof query !== "string" || query.trim() === "") {
        throw new AppError("Informe um termo para busca", 400)
    }

    const data = await searchGame(query.trim());

    return res.status(200).json(data);
}