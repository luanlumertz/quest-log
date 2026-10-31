import type { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import z from "zod";
import { messageResponseSchema } from "../shared/error.schemas.js";
import { registerDashboardSchemas } from "./dashboard.schemas.js";

export function registerDashboardPaths(registry: OpenAPIRegistry) {
    const dashboardData = registerDashboardSchemas(registry);

    registry.registerPath({
        method: "get",
        path: "/dashboard",
        operationId: "getDashboardData",
        tags: ["Dashboard"],
        summary: "Consultar estatísticas e atividade recente da biblioteca",
        description:
            "Retorna dados somente da biblioteca do usuário autenticado, no campo dashboardData. stats reúne o total de jogos, a quantidade em cada um dos cinco status e o tempo total jogado em minutos. recentGames contém até cinco entradas ordenadas pela última atualização, da mais recente para a mais antiga, independentemente do status; não representa um histórico de eventos. Os jogos recentes usam o ID interno game.id e incluem somente as plataformas selecionadas pelo usuário. updatedAt é uma data ISO 8601 em UTC, e rating pode ser null. Com a biblioteca vazia, todos os totais são zero e recentGames é uma lista vazia. Não recebe corpo ou parâmetros documentados, não oferece filtros nem paginação e não exige cabeçalho CSRF. As estatísticas e os jogos recentes são consultados separadamente, portanto alterações simultâneas podem aparecer em apenas uma das partes da resposta.",
        security: [{ cookieAuth: [] }],
        responses: {
            200: {
                description: "Estatísticas e entradas recentes consultadas com sucesso.",
                content: {
                    "application/json": {
                        schema: z.object({ dashboardData }),
                        examples: {
                            populated: {
                                summary: "Biblioteca com jogos",
                                value: {
                                    dashboardData: {
                                        stats: {
                                            totalGames: 2,
                                            byStatus: {
                                                WANT_TO_PLAY: 0,
                                                PLAYING: 1,
                                                PAUSED: 0,
                                                COMPLETED: 1,
                                                ABANDONED: 0,
                                            },
                                            totalPlaytimeMinutes: 300,
                                        },
                                        recentGames: [
                                            {
                                                status: "PLAYING",
                                                rating: 4.5,
                                                playtimeMinutes: 120,
                                                updatedAt: "2026-10-02T12:00:00.000Z",
                                                game: {
                                                    id: 1,
                                                    title: "Elden Ring",
                                                    coverUrl: null,
                                                },
                                                platforms: [{ id: 1, name: "PC" }],
                                            },
                                            {
                                                status: "COMPLETED",
                                                rating: null,
                                                playtimeMinutes: 180,
                                                updatedAt: "2026-10-01T12:00:00.000Z",
                                                game: { id: 2, title: "Portal", coverUrl: null },
                                                platforms: [],
                                            },
                                        ],
                                    },
                                },
                            },
                            empty: {
                                summary: "Biblioteca vazia",
                                value: {
                                    dashboardData: {
                                        stats: {
                                            totalGames: 0,
                                            byStatus: {
                                                WANT_TO_PLAY: 0,
                                                PLAYING: 0,
                                                PAUSED: 0,
                                                COMPLETED: 0,
                                                ABANDONED: 0,
                                            },
                                            totalPlaytimeMinutes: 0,
                                        },
                                        recentGames: [],
                                    },
                                },
                            },
                        },
                    },
                },
            },
            401: {
                description:
                    "Cookie de acesso ausente, inválido ou expirado, conta removida ou sessão revogada. Faça login neste ambiente antes de consultar o dashboard.",
                content: {
                    "application/json": {
                        schema: messageResponseSchema,
                        example: { message: "Não autenticado" },
                    },
                },
            },
            403: {
                description:
                    "Requisição rejeitada pela proteção de origem, quando configurada. Não se aplica ao acesso direto do sandbox. Esta consulta GET não exige cabeçalho CSRF.",
                content: {
                    "application/json": {
                        schema: messageResponseSchema,
                        example: { message: "Acesso à API não permitido." },
                    },
                },
            },
            500: {
                description: "Falha interna ao autenticar ou consultar os dados da biblioteca.",
                content: {
                    "application/json": {
                        schema: messageResponseSchema,
                        example: { message: "Erro interno do servidor" },
                    },
                },
            },
        },
    });
}
