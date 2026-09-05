import { prisma } from "../lib/prisma.js";

export function findPlatformByName(namePlatform: string) {
    return prisma.platform.findUnique({
        where: {
            name: namePlatform
        }
    })
}

export function createPlatform(namePlatform: string) {
    const platform = prisma.platform.create({
        data: {
            name: namePlatform
        }
    })

    return platform;
}

export function findPlatformsByGameId(gameId: number) {
    return prisma.platform.findMany({
        where: {
            games: {
                some: {
                    gameId
                }
            }
        }
    })
}