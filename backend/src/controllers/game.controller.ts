import type { Request, Response } from "express";
import { AppError } from "../errors/AppError.js";
import { getRawgGame, searchGame } from "../services/game.service.js";

export async function searchGameController(req: Request, res: Response) {
    const { query } = res.locals.query;

    const data = await searchGame(query);

    return res.status(200).json(data);
}

export async function getRawgGameController(req: Request, res: Response) {
    const { externalId } = res.locals.params;

    const game = await getRawgGame(externalId);

    return res.status(200).json(game);
}