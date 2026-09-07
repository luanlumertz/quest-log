import type { Request, Response } from "express";
import { addGameToLibraryEntry, getLibraryEntries, getLibraryEntryDetails } from "../services/library.service.js";
import type { AddGameToLibraryServiceData } from "../types/library.types.js";
import type { GetLibraryEntryDetailsParams } from "../schemas/library.schema.js";

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
    const { gameId } = res.locals.params as GetLibraryEntryDetailsParams;

    const libraryEntry = await getLibraryEntryDetails(userId, gameId);

    return res.status(200).json({ libraryEntry })
}
