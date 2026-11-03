import { extendZodWithOpenApi, type OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import z from "zod";
import { libraryEntryResponseSchema } from "../library/library.schemas.js";

export function registerDashboardSchemas(registry: OpenAPIRegistry) {
    extendZodWithOpenApi(z);

    const count = z.number().int().nonnegative();
    const stats = registry.register(
        "DashboardStats",
        z.object({
            totalGames: count.meta({
                description: "Total de jogos na biblioteca, somando todos os status.",
            }),
            byStatus: z
                .object({
                    WANT_TO_PLAY: count,
                    PLAYING: count,
                    PAUSED: count,
                    COMPLETED: count,
                    ABANDONED: count,
                })
                .meta({
                    description:
                        "Quantidade por status. Todos os cinco status são retornados, inclusive os que têm zero jogos.",
                }),
            totalPlaytimeMinutes: count.meta({
                description:
                    "Soma do tempo jogado em minutos em toda a biblioteca, independentemente do status.",
            }),
        }),
    );

    const recentGame = registry.register(
        "DashboardRecentGame",
        libraryEntryResponseSchema
            .pick({
                status: true,
                rating: true,
                playtimeMinutes: true,
                updatedAt: true,
                platforms: true,
            })
            .extend({
                game: libraryEntryResponseSchema.shape.game.pick({
                    id: true,
                    title: true,
                    coverUrl: true,
                }),
            }),
    );

    return registry.register(
        "DashboardData",
        z.object({
            stats,
            recentGames: z.array(recentGame).max(5).meta({
                description:
                    "Até cinco entradas da biblioteca, ordenadas por updatedAt decrescente. Não há desempate explícito para datas iguais. Platforms contém somente as plataformas selecionadas pelo usuário.",
            }),
        }),
    );
}
