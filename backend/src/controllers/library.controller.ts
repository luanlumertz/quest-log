import type { Request, Response } from "express";
import { addGameToLibraryEntry } from "../services/library.service.js";
import type { AddGameToLibraryServiceData } from "../types/library.types.js";

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