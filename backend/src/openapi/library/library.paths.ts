import type { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import z from "zod";
import {
    addGameToLibrarySchema,
    gameIdParamsSchema,
    libraryQuerySchema,
} from "../../schemas/library.schema.js";
import { messageResponseSchema, validationErrorResponseSchema } from "../shared/error.schemas.js";
import {
    createdLibraryEntryResponseSchema,
    libraryEntryDetailsResponseSchema,
    libraryEntryResponseSchema,
    updateLibraryEntryRequestSchema,
} from "./library.schemas.js";

export function registerLibraryPaths(registry: OpenAPIRegistry) {
    registry.registerPath({
        method: "delete",
        path: "/library/{gameId}",
        operationId: "deleteLibraryEntry",
        tags: ["Biblioteca"],
        summary: "Remover um jogo da biblioteca",
        description:
            "Remove a entrada do jogo e suas associações de plataformas da biblioteca do usuário autenticado. O jogo permanece no catálogo local e nas bibliotecas de outros usuários. Use game.id como gameId, não o externalId da RAWG. Não envie corpo. A resposta de sucesso não contém JSON. Se a entrada não existir, inclusive após uma remoção anterior, retorna 404. Para executar pelo Swagger, faça login no frontend, abra http://localhost:5173/api/docs/, selecione o servidor /api e envie X-QuestLog-Request: true.",
        security: [{ cookieAuth: [] }],
        request: {
            params: gameIdParamsSchema.extend({
                gameId: gameIdParamsSchema.shape.gameId.meta({
                    description: "ID interno do jogo (game.id), inteiro positivo.",
                    example: 1,
                }),
            }),
            headers: z.object({
                "X-QuestLog-Request": z.literal("true").meta({
                    description: "Cabeçalho obrigatório da proteção CSRF.",
                    example: "true",
                }),
            }),
        },
        responses: {
            204: {
                description: "Jogo removido da biblioteca. Resposta sem corpo.",
            },
            401: {
                description: "Cookie de acesso ausente, inválido, expirado ou sessão revogada.",
                content: {
                    "application/json": {
                        schema: messageResponseSchema,
                        example: { message: "Não autenticado" },
                    },
                },
            },
            403: {
                description:
                    "Origem ou cabeçalho CSRF inválido, ou acesso rejeitado pela proteção de origem.",
                content: {
                    "application/json": {
                        schema: messageResponseSchema,
                        examples: {
                            csrf: { value: { message: "Origem da requisição não permitida." } },
                            origin: { value: { message: "Acesso à API não permitido." } },
                        },
                    },
                },
            },
            404: {
                description: "O jogo não está na biblioteca do usuário autenticado.",
                content: {
                    "application/json": {
                        schema: messageResponseSchema,
                        example: { message: "Jogo não encontrado na biblioteca do usuário" },
                    },
                },
            },
            422: {
                description:
                    "gameId inválido: deve ser um inteiro positivo. A autenticação é verificada antes do parâmetro.",
                content: {
                    "application/json": { schema: validationErrorResponseSchema },
                },
            },
            500: {
                description: "Falha interna ao autenticar, consultar ou remover a entrada.",
                content: {
                    "application/json": {
                        schema: messageResponseSchema,
                        example: { message: "Erro interno do servidor" },
                    },
                },
            },
        },
    });

    registry.registerPath({
        method: "patch",
        path: "/library/{gameId}",
        operationId: "updateLibraryEntry",
        tags: ["Biblioteca"],
        summary: "Atualizar um jogo da biblioteca",
        description:
            "Atualiza somente os campos enviados; informe pelo menos um. Use game.id como gameId. rating aceita de 0 a 5, com no máximo uma casa decimal, ou null para remover a nota. playtimeMinutes é um inteiro não negativo em minutos. platforms recebe IDs de availablePlatforms, não nomes, e substitui toda a seleção; [] remove todas as plataformas. Datas devem ser enviadas preferencialmente em ISO 8601 e são normalizadas para 00:00:00 UTC. null remove a data. Não são permitidas datas futuras ou conclusão anterior ao início, considerando também as datas já salvas. Alterar o status não preenche datas automaticamente. A resposta contém updatedLibraryEntry, com game e plataformas selecionadas, sem availablePlatforms. Para executar pelo Swagger, faça login no frontend, abra http://localhost:5173/api/docs/, selecione o servidor /api e envie X-QuestLog-Request: true.",
        security: [{ cookieAuth: [] }],
        request: {
            params: gameIdParamsSchema.extend({
                gameId: gameIdParamsSchema.shape.gameId.meta({
                    description: "ID interno do jogo (game.id), inteiro positivo.",
                    example: 1,
                }),
            }),
            headers: z.object({
                "X-QuestLog-Request": z.literal("true").meta({
                    description: "Cabeçalho obrigatório da proteção CSRF.",
                    example: "true",
                }),
            }),
            body: {
                required: true,
                content: {
                    "application/json": {
                        schema: updateLibraryEntryRequestSchema,
                        examples: {
                            progress: {
                                summary: "Atualizar progresso, nota e tempo jogado",
                                value: { status: "PLAYING", rating: 4.5, playtimeMinutes: 180 },
                            },
                            dates: {
                                summary: "Registrar início e conclusão",
                                value: {
                                    status: "COMPLETED",
                                    startedAt: "2026-01-01T00:00:00.000Z",
                                    completedAt: "2026-01-10T00:00:00.000Z",
                                },
                            },
                            platforms: {
                                summary: "Substituir plataformas (use IDs de availablePlatforms)",
                                value: { platforms: [1] },
                            },
                            clear: {
                                summary: "Remover nota, datas e plataformas",
                                value: {
                                    rating: null,
                                    startedAt: null,
                                    completedAt: null,
                                    platforms: [],
                                },
                            },
                        },
                    },
                },
            },
        },
        responses: {
            200: {
                description: "Entrada atualizada com sucesso.",
                content: {
                    "application/json": {
                        schema: z.object({ updatedLibraryEntry: libraryEntryResponseSchema }),
                        example: {
                            updatedLibraryEntry: {
                                status: "PLAYING",
                                rating: 4.5,
                                playtimeMinutes: 180,
                                startedAt: null,
                                completedAt: null,
                                createdAt: "2026-10-01T12:00:00.000Z",
                                updatedAt: "2026-10-02T12:00:00.000Z",
                                game: {
                                    id: 1,
                                    externalId: 58175,
                                    title: "Elden Ring",
                                    coverUrl: null,
                                    releaseDate: "2022-02-25T00:00:00.000Z",
                                },
                                platforms: [{ id: 1, name: "PC" }],
                            },
                        },
                    },
                },
            },
            400: {
                description:
                    "Datas incompatíveis, plataforma não suportada pelo jogo ou JSON malformado.",
                content: {
                    "application/json": {
                        schema: messageResponseSchema,
                        examples: {
                            futureStart: {
                                value: { message: "A data de início não pode estar no futuro" },
                            },
                            futureEnd: {
                                value: { message: "A data de conclusão não pode estar no futuro" },
                            },
                            dateOrder: {
                                value: {
                                    message:
                                        "A data de conclusão não pode ser anterior à data de início",
                                },
                            },
                            platform: {
                                value: {
                                    message:
                                        "Uma ou mais plataformas informadas não são suportadas por este jogo",
                                },
                            },
                            json: { value: { message: "JSON malformado" } },
                        },
                    },
                },
            },
            401: {
                description: "Cookie de acesso ausente, inválido, expirado ou sessão revogada.",
                content: {
                    "application/json": {
                        schema: messageResponseSchema,
                        example: { message: "Não autenticado" },
                    },
                },
            },
            403: {
                description:
                    "Origem ou cabeçalho CSRF inválido, ou acesso rejeitado pela proteção de origem.",
                content: {
                    "application/json": {
                        schema: messageResponseSchema,
                        examples: {
                            csrf: { value: { message: "Origem da requisição não permitida." } },
                            origin: { value: { message: "Acesso à API não permitido." } },
                        },
                    },
                },
            },
            404: {
                description: "O jogo não está na biblioteca do usuário autenticado.",
                content: {
                    "application/json": {
                        schema: messageResponseSchema,
                        example: { message: "Jogo não encontrado na biblioteca do usuário" },
                    },
                },
            },
            415: {
                description: "Corpo enviado com Content-Type diferente de application/json.",
                content: {
                    "application/json": {
                        schema: messageResponseSchema,
                        example: { message: "O corpo da requisição deve ser enviado em JSON." },
                    },
                },
            },
            422: {
                description:
                    "gameId ou corpo inválido: exige ao menos um campo, rejeita campos desconhecidos, notas fora dos limites, tempo inválido, plataformas repetidas e datas não convertíveis. A autenticação é verificada antes dos parâmetros e do corpo.",
                content: { "application/json": { schema: validationErrorResponseSchema } },
            },
            500: {
                description: "Falha interna ao autenticar, consultar ou atualizar a entrada.",
                content: {
                    "application/json": {
                        schema: messageResponseSchema,
                        example: { message: "Erro interno do servidor" },
                    },
                },
            },
        },
    });

    registry.registerPath({
        method: "post",
        path: "/library",
        operationId: "addGameToLibrary",
        tags: ["Biblioteca"],
        summary: "Adicionar um jogo à biblioteca",
        description:
            "Adiciona um jogo pelo externalId da RAWG. Se ainda não existir no banco local, consulta a RAWG para salvar o jogo e suas plataformas. status é opcional (padrão WANT_TO_PLAY) e platforms é uma lista opcional de nomes, sem repetições (padrão []). Os nomes são comparados exatamente com as plataformas disponíveis, após remover espaços nas extremidades. A resposta retorna os campos da entrada criada e os nomes das plataformas selecionadas, sem o objeto game. Nota e datas começam nulas, e o tempo jogado começa em zero. Para executar pelo Swagger, faça login no frontend, abra http://localhost:5173/api/docs/ e selecione o servidor /api (proxy local do Vite). Envie X-QuestLog-Request: true. A origem e o cabeçalho são conferidos pela proteção CSRF.",
        security: [{ cookieAuth: [] }],
        request: {
            headers: z.object({
                "X-QuestLog-Request": z.literal("true").meta({
                    description: "Cabeçalho obrigatório da proteção CSRF.",
                    example: "true",
                }),
            }),
            body: {
                required: true,
                content: {
                    "application/json": {
                        schema: addGameToLibrarySchema,
                        examples: {
                            minimal: {
                                summary: "Adicionar com status padrão e sem plataformas",
                                value: { externalId: 58175 },
                            },
                            withPlatforms: {
                                summary: "Escolher status e plataformas",
                                value: {
                                    externalId: 58175,
                                    status: "PLAYING",
                                    platforms: ["PC"],
                                },
                            },
                        },
                    },
                },
            },
        },
        responses: {
            201: {
                description: "Jogo adicionado à biblioteca.",
                content: {
                    "application/json": {
                        schema: z.object({ libraryEntry: createdLibraryEntryResponseSchema }),
                        example: {
                            libraryEntry: {
                                userId: 1,
                                gameId: 1,
                                status: "PLAYING",
                                rating: null,
                                playtimeMinutes: 0,
                                startedAt: null,
                                completedAt: null,
                                createdAt: "2026-10-01T12:00:00.000Z",
                                updatedAt: "2026-10-01T12:00:00.000Z",
                                platforms: ["PC"],
                            },
                        },
                    },
                },
            },
            400: {
                description: "Plataforma não disponível para o jogo ou JSON malformado.",
                content: {
                    "application/json": {
                        schema: messageResponseSchema,
                        examples: {
                            platform: {
                                value: {
                                    message: "Plataforma(s) não disponível(is) para este jogo: NES",
                                },
                            },
                            json: { value: { message: "JSON malformado" } },
                        },
                    },
                },
            },
            401: {
                description: "Cookie de acesso ausente, inválido, expirado ou sessão revogada.",
                content: {
                    "application/json": {
                        schema: messageResponseSchema,
                        example: { message: "Não autenticado" },
                    },
                },
            },
            403: {
                description:
                    "Origem ou cabeçalho CSRF inválido, ou acesso rejeitado pela proteção de origem.",
                content: {
                    "application/json": {
                        schema: messageResponseSchema,
                        examples: {
                            csrf: { value: { message: "Origem da requisição não permitida." } },
                            origin: { value: { message: "Acesso à API não permitido." } },
                        },
                    },
                },
            },
            404: {
                description: "Jogo não encontrado na RAWG ao importar para o banco local.",
                content: {
                    "application/json": {
                        schema: messageResponseSchema,
                        example: { message: "Jogo não encontrado" },
                    },
                },
            },
            409: {
                description: "O jogo já está na biblioteca do usuário.",
                content: {
                    "application/json": {
                        schema: messageResponseSchema,
                        example: { message: "Este jogo já está na sua biblioteca" },
                    },
                },
            },
            415: {
                description: "Corpo enviado com Content-Type diferente de application/json.",
                content: {
                    "application/json": {
                        schema: messageResponseSchema,
                        example: { message: "O corpo da requisição deve ser enviado em JSON." },
                    },
                },
            },
            422: {
                description:
                    "Corpo inválido: externalId deve ser inteiro positivo, status deve ser válido e plataformas não podem se repetir. Campos desconhecidos são rejeitados.",
                content: { "application/json": { schema: validationErrorResponseSchema } },
            },
            429: {
                description:
                    "Limite compartilhado de 250 chamadas por usuário em cinco minutos entre busca, detalhes de jogos e adição à biblioteca.",
                content: {
                    "application/json": {
                        schema: messageResponseSchema,
                        example: {
                            message:
                                "Muitas consultas em pouco tempo. Aguarde alguns minutos e tente novamente.",
                        },
                    },
                },
            },
            500: {
                description: "Falha interna ao autenticar ou persistir os dados.",
                content: {
                    "application/json": {
                        schema: messageResponseSchema,
                        example: { message: "Erro interno do servidor" },
                    },
                },
            },
            502: {
                description:
                    "Falha na comunicação ou resposta inválida da RAWG ao importar o jogo.",
                content: {
                    "application/json": {
                        schema: messageResponseSchema,
                        example: { message: "Erro ao buscar jogo na RAWG" },
                    },
                },
            },
            504: {
                description: "A consulta à RAWG excedeu o timeout de dez segundos.",
                content: {
                    "application/json": {
                        schema: messageResponseSchema,
                        example: { message: "A RAWG demorou para responder. Tente novamente." },
                    },
                },
            },
        },
    });

    registry.registerPath({
        method: "get",
        path: "/library",
        operationId: "getLibraryEntries",
        tags: ["Biblioteca"],
        summary: "Listar a biblioteca do usuário autenticado",
        description:
            "Retorna os jogos da biblioteca, sem paginação ou ordenação garantida. Os filtros são opcionais e podem ser combinados. A busca considera parte do título, ignora diferenças entre maiúsculas e minúsculas e remove espaços nas extremidades. search vazio e parâmetros desconhecidos são rejeitados. Sem resultados, retorna uma lista vazia. O tempo jogado é expresso em minutos; as datas são strings ISO 8601 em UTC.",
        security: [{ cookieAuth: [] }],
        request: {
            query: libraryQuerySchema.extend({
                search: libraryQuerySchema.shape.search.meta({
                    description: "Parte do título do jogo. Não pode conter apenas espaços.",
                    example: "Elden",
                }),
                status: libraryQuerySchema.shape.status.meta({
                    description: "Status do jogo na biblioteca.",
                    example: "PLAYING",
                }),
            }),
        },
        responses: {
            200: {
                description: "Biblioteca consultada com sucesso.",
                content: {
                    "application/json": {
                        schema: z.object({ libraryEntries: z.array(libraryEntryResponseSchema) }),
                        examples: {
                            populated: {
                                summary: "Biblioteca com um jogo",
                                value: {
                                    libraryEntries: [
                                        {
                                            status: "PLAYING",
                                            rating: 4.5,
                                            playtimeMinutes: 120,
                                            startedAt: "2026-10-01T00:00:00.000Z",
                                            completedAt: null,
                                            createdAt: "2026-10-01T12:00:00.000Z",
                                            updatedAt: "2026-10-02T12:00:00.000Z",
                                            game: {
                                                id: 1,
                                                externalId: 58175,
                                                title: "Elden Ring",
                                                coverUrl: null,
                                                releaseDate: "2022-02-25T00:00:00.000Z",
                                            },
                                            platforms: [{ id: 1, name: "PC" }],
                                        },
                                    ],
                                },
                            },
                            empty: {
                                summary: "Biblioteca vazia ou sem resultados para os filtros",
                                value: { libraryEntries: [] },
                            },
                        },
                    },
                },
            },
            401: {
                description: "Cookie de acesso ausente, inválido, expirado ou sessão revogada.",
                content: {
                    "application/json": {
                        schema: messageResponseSchema,
                        example: { message: "Não autenticado" },
                    },
                },
            },
            403: {
                description: "Requisição rejeitada pela proteção de origem, quando configurada.",
                content: {
                    "application/json": {
                        schema: messageResponseSchema,
                        example: { message: "Acesso à API não permitido." },
                    },
                },
            },
            422: {
                description: "Filtros inválidos. A autenticação é verificada antes dos filtros.",
                content: {
                    "application/json": {
                        schema: validationErrorResponseSchema,
                    },
                },
            },
            500: {
                description: "Falha interna ao autenticar o usuário ou consultar a biblioteca.",
                content: {
                    "application/json": {
                        schema: messageResponseSchema,
                        example: { message: "Erro interno do servidor" },
                    },
                },
            },
        },
    });

    registry.registerPath({
        method: "get",
        path: "/library/{gameId}",
        operationId: "getLibraryEntryDetails",
        tags: ["Biblioteca"],
        summary: "Consultar os detalhes de um jogo da biblioteca",
        description:
            "Retorna a entrada do jogo na biblioteca do usuário autenticado. platforms contém as plataformas selecionadas pelo usuário; availablePlatforms contém todas as plataformas associadas ao jogo no banco local. Use game.id retornado pela listagem como gameId, não o externalId da RAWG. O tempo jogado é expresso em minutos e as datas são strings ISO 8601 em UTC. Jogos fora da biblioteca do usuário retornam 404, mesmo que existam no catálogo ou na biblioteca de outra pessoa.",
        security: [{ cookieAuth: [] }],
        request: {
            params: gameIdParamsSchema.extend({
                gameId: gameIdParamsSchema.shape.gameId.meta({
                    description: "ID interno do jogo (game.id), inteiro positivo.",
                    example: 1,
                }),
            }),
        },
        responses: {
            200: {
                description: "Detalhes do jogo na biblioteca consultados com sucesso.",
                content: {
                    "application/json": {
                        schema: z.object({ libraryEntry: libraryEntryDetailsResponseSchema }),
                        example: {
                            libraryEntry: {
                                status: "PLAYING",
                                rating: 4.5,
                                playtimeMinutes: 120,
                                startedAt: "2026-10-01T00:00:00.000Z",
                                completedAt: null,
                                createdAt: "2026-10-01T12:00:00.000Z",
                                updatedAt: "2026-10-02T12:00:00.000Z",
                                game: {
                                    id: 1,
                                    externalId: 58175,
                                    title: "Elden Ring",
                                    coverUrl: null,
                                    releaseDate: "2022-02-25T00:00:00.000Z",
                                },
                                platforms: [{ id: 1, name: "PC" }],
                                availablePlatforms: [
                                    { id: 1, name: "PC" },
                                    { id: 2, name: "PlayStation 5" },
                                ],
                            },
                        },
                    },
                },
            },
            401: {
                description: "Cookie de acesso ausente, inválido, expirado ou sessão revogada.",
                content: {
                    "application/json": {
                        schema: messageResponseSchema,
                        example: { message: "Não autenticado" },
                    },
                },
            },
            403: {
                description: "Requisição rejeitada pela proteção de origem, quando configurada.",
                content: {
                    "application/json": {
                        schema: messageResponseSchema,
                        example: { message: "Acesso à API não permitido." },
                    },
                },
            },
            404: {
                description: "O jogo não está na biblioteca do usuário autenticado.",
                content: {
                    "application/json": {
                        schema: messageResponseSchema,
                        example: { message: "Jogo não encontrado na biblioteca do usuário" },
                    },
                },
            },
            422: {
                description:
                    "gameId inválido: deve ser um inteiro positivo. A autenticação é verificada antes do parâmetro.",
                content: {
                    "application/json": {
                        schema: validationErrorResponseSchema,
                    },
                },
            },
            500: {
                description: "Falha interna ao autenticar o usuário ou consultar os detalhes.",
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
