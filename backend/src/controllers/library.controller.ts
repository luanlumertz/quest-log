import type { Request, Response } from "express";
import {
    addGameToLibraryEntry,
    deleteLibraryEntry,
    getLibraryEntries,
    getLibraryEntryDetails,
    updateLibraryEntry,
} from "../services/library.service.js";
import type { AddGameToLibraryServiceData } from "../types/library.types.js";
import type {
    AddGameToLibraryData,
    GameIdParams,
    LibraryQueryData,
    UpdateLibraryEntryServiceData,
} from "../schemas/library.schema.js";

export async function addGameToLibraryEntryController(
    req: Request<Record<string, string>, unknown, AddGameToLibraryData>,
    res: Response,
) {
    const body = req.body;
    const userId = req.userId;

    const data: AddGameToLibraryServiceData = {
        userId: userId!,
        externalId: body.externalId,
        status: body.status,
        platforms: body.platforms,
    };

    const libraryEntry = await addGameToLibraryEntry(data);

    return res.status(201).json({ libraryEntry });
}

export async function getLibraryEntriesController(
    req: Request,
    res: Response<unknown, { query: LibraryQueryData }>,
) {
    const userId = req.userId!;
    const libraryQuery = res.locals.query;

    const libraryEntries = await getLibraryEntries(userId, libraryQuery);

    return res.status(200).json({ libraryEntries });
}

export async function getLibraryEntryDetailsController(
    req: Request,
    res: Response<unknown, { params: GameIdParams }>,
) {
    const userId = req.userId!;
    const { gameId } = res.locals.params;

    const libraryEntry = await getLibraryEntryDetails(userId, gameId);

    return res.status(200).json({ libraryEntry });
}

export async function updateLibraryEntryController(
    req: Request<Record<string, string>, unknown, UpdateLibraryEntryServiceData>,
    res: Response<unknown, { params: GameIdParams }>,
) {
    const body = req.body;
    const userId = req.userId!;
    const { gameId } = res.locals.params;

    const data: UpdateLibraryEntryServiceData = {
        status: body.status,
        rating: body.rating,
        playtimeMinutes: body.playtimeMinutes,
        startedAt: body.startedAt,
        completedAt: body.completedAt,
        platforms: body.platforms,
    };

    const updatedLibraryEntry = await updateLibraryEntry(userId, gameId, data);

    return res.status(200).json({ updatedLibraryEntry });
}

export async function deleteLibraryEntryController(
    req: Request,
    res: Response<unknown, { params: GameIdParams }>,
) {
    const userId = req.userId!;
    const { gameId } = res.locals.params;

    await deleteLibraryEntry(userId, gameId);

    return res.status(204).send();
}
