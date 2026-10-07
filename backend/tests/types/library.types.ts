import type { GameStatus } from "@prisma/client";

export type AddGameToLibraryData = {
    externalId: number;
    status: GameStatus;
    platforms: string[];
};
