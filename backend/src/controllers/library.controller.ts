import type { Request, Response } from "express";
import { addGameToLibraryEntry, deleteLibraryEntry, getLibraryEntries, getLibraryEntryDetails, updateLibraryEntry } from "../services/library.service.js";
import type { AddGameToLibraryServiceData, UpdateLibraryEntryServiceData } from "../types/library.types.js";
import type { GameIdParams } from "../schemas/library.schema.js";

export async function addGameToLibraryEntryController(req: Request, res: Response) {
    const body = req.body
    
    const userId = req.userId

    const data: AddGameToLibraryServiceData = {
        userId: userId!,
        externalId: body.externalId,
        status: body.status,
        platforms: body.platforms
    }

    const libraryEntry = await addGameToLibraryEntry(data)

    return res.status(201).json({ libraryEntry })
}

export async function getLibraryEntriesController(req: Request, res: Response) {
    const userId = req.userId!

    const libraryEntries = await getLibraryEntries(userId);

    return res.status(200).json({ libraryEntries })
}

export async function getLibraryEntryDetailsController(req: Request, res: Response) {
    const userId = req.userId!
    const { gameId } = res.locals.params as GameIdParams;

    const libraryEntry = await getLibraryEntryDetails(userId, gameId);

    return res.status(200).json({ libraryEntry })
}

export async function updateLibraryEntryController(req: Request, res: Response) {
    const body = req.body
    const userId = req.userId!
    const { gameId } = res.locals.params as GameIdParams;

    const data: UpdateLibraryEntryServiceData = {
        status: body.status,
        rating: body.rating,
        playtimeMinutes: body.playtimeMinutes,
        startedAt: body.startedAt,
        completedAt: body.completedAt,
        platforms: body.platforms
    }

    const updatedLibraryEntry = await updateLibraryEntry(userId, gameId, data);

    return res.status(200).json({ updatedLibraryEntry })
}

export async function deleteLibraryEntryController(req: Request, res: Response) {
    const userId = req.userId!
    const { gameId } = res.locals.params as GameIdParams;

    await deleteLibraryEntry(userId, gameId);

    return res.status(204).send()
}
