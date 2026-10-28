import { prisma } from "../lib/prisma.js";
import type { CreateGameData } from "../types/game.types.js";
import { Prisma } from "../generated/prisma/client.js";
import { getOrCreatePlatforms } from "./platform.repository.js";

export function findGameByExternalId(externalId: number) {
    return prisma.game.findUnique({
        where: { externalId },
    });
}

export function saveGameWithPlatforms(data: CreateGameData, platformNames: string[]) {
    return prisma.$transaction(
        async (tx) => {
            // ON CONFLICT evita a disputa entre buscar e criar o mesmo jogo.
            const created = await tx.game.createMany({ data, skipDuplicates: true });
            const game = await tx.game.findUniqueOrThrow({
                where: { externalId: data.externalId },
            });

            // Uma criação concorrente só fica visível após confirmar todos os vínculos.
            if (created.count === 0 || platformNames.length === 0) {
                return game;
            }

            const platforms = await getOrCreatePlatforms(platformNames, tx);

            await tx.gamePlatform.createMany({
                data: platforms.map(({ id }) => ({ gameId: game.id, platformId: id })),
                skipDuplicates: true,
            });

            return game;
        },
        { isolationLevel: Prisma.TransactionIsolationLevel.ReadCommitted },
    );
}
