import type { Request, Response } from "express";
import { AppError } from "../errors/AppError.js";
import { getRawgGame, searchGame } from "../services/game.service.js";

export async function searchGameController(req: Request, res: Response) {
    const query = req.query.query;

    if (!query || typeof query !== "string" || query.trim() === "") {
        throw new AppError("Informe um termo para busca", 400);
    }

    const data = await searchGame(query.trim());

    return res.status(200).json(data);
}

export async function getRawgGameController(req: Request, res: Response) {
    const id = Number(req.params.externalId);

    if (!Number.isFinite(id)) {
        throw new AppError("Deve ser informado um número válido", 400);
    }

    const game = await getRawgGame(id);

    return res.status(200).json(game);
}