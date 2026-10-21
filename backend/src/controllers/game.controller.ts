import type { Request, Response } from "express";
import { getRawgGame, searchGame } from "../services/game.service.js";
import type { SearchGameQuery, GetRawgGameParams } from "../schemas/game.schema.js";

export async function searchGameController(
    req: Request,
    res: Response<unknown, { query: SearchGameQuery }>,
) {
    const { query } = res.locals.query;

    const data = await searchGame(query);

    return res.status(200).json(data);
}

export async function getRawgGameController(
    req: Request,
    res: Response<unknown, { params: GetRawgGameParams }>,
) {
    const { externalId } = res.locals.params;

    const game = await getRawgGame(externalId);

    return res.status(200).json(game);
}
