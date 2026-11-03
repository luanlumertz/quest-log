import type { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import z from "zod";
import { getRawgGameSchema, searchGameSchema } from "../../schemas/game.schema.js";
import { messageResponseSchema, validationErrorResponseSchema } from "../shared/error.schemas.js";
import { registerGameSchemas } from "./game.schemas.js";

export function registerGamePaths(registry: OpenAPIRegistry) {
    const { gameDetails, gameSearchResponse } = registerGameSchemas(registry);
    const messageResponse = (description: string, message: string) => ({
        description,
        content: { "application/json": { schema: messageResponseSchema, example: { message } } },
    });
    const commonResponses = {
        401: messageResponse(
            "Cookie de acesso ausente, inválido ou expirado, conta removida ou sessão revogada. Faça login neste ambiente antes de consultar jogos.",
            "Não autenticado",
        ),
        403: messageResponse(
            "Requisição rejeitada pela proteção de origem, quando configurada. Não se aplica ao acesso direto do sandbox. Consultas GET não exigem o cabeçalho CSRF.",
            "Acesso à API não permitido.",
        ),
        422: {
            description:
                "Parâmetros inválidos. A autenticação e o limite de consultas são verificados antes dos parâmetros.",
            content: { "application/json": { schema: validationErrorResponseSchema } },
        },
        429: messageResponse(
            "Limite compartilhado de 250 chamadas por usuário em cinco minutos entre busca, detalhes de jogos e adição à biblioteca. Requisições com parâmetros inválidos também contam após a autenticação.",
            "Muitas consultas em pouco tempo. Aguarde alguns minutos e tente novamente.",
        ),
        500: messageResponse(
            "Falha interna ao autenticar ou processar a consulta.",
            "Erro interno do servidor",
        ),
        504: messageResponse(
            "A consulta à RAWG excedeu o timeout de dez segundos.",
            "A RAWG demorou para responder. Tente novamente.",
        ),
    };
    const gameExample = {
        externalId: 58175,
        title: "Elden Ring",
        releaseDate: "2022-02-25",
        coverUrl: null,
        platforms: ["PC", "PlayStation 5"],
    };

    registry.registerPath({
        method: "get",
        path: "/games/search",
        operationId: "searchGames",
        tags: ["Jogos"],
        summary: "Buscar jogos no catálogo da RAWG",
        description:
            "Consulta a RAWG pelo termo informado, removendo espaços nas extremidades. Não consulta apenas sua biblioteca e não salva jogos no banco local. Retorna páginas de até 20 jogos; page começa em 1 e assume 1 quando omitido. hasPrevious e hasNext indicam a existência de páginas anterior e seguinte segundo a RAWG; não há total de resultados na resposta. Sem resultados, games é uma lista vazia. Parâmetros desconhecidos são ignorados. Os jogos usam externalId da RAWG e nomes de plataformas. A data de lançamento é normalmente YYYY-MM-DD, diferente das datas completas da biblioteca. Não exige corpo nem cabeçalho CSRF.",
        security: [{ cookieAuth: [] }],
        request: {
            query: searchGameSchema.extend({
                query: searchGameSchema.shape.query.meta({
                    description:
                        "Termo obrigatório; não pode ficar vazio após remover espaços nas extremidades.",
                    example: "Elden Ring",
                }),
                page: z.number().int().positive().default(1).meta({
                    description: "Página desejada, como inteiro positivo. Padrão: 1.",
                    example: 1,
                }),
            }),
        },
        responses: {
            200: {
                description: "Página de resultados consultada com sucesso.",
                content: {
                    "application/json": {
                        schema: gameSearchResponse,
                        examples: {
                            populated: {
                                summary: "Página com resultado",
                                value: {
                                    games: [gameExample],
                                    page: 1,
                                    hasPrevious: false,
                                    hasNext: true,
                                },
                            },
                            empty: {
                                summary: "Busca sem resultados",
                                value: { games: [], page: 1, hasPrevious: false, hasNext: false },
                            },
                        },
                    },
                },
            },
            ...commonResponses,
            502: messageResponse(
                "Falha de comunicação, resposta inválida ou resposta HTTP de erro da RAWG durante a busca. Uma página inexistente rejeitada pela RAWG também é tratada como falha da integração.",
                "Erro ao buscar jogos na RAWG",
            ),
        },
    });

    registry.registerPath({
        method: "get",
        path: "/games/{externalId}",
        operationId: "getGameDetails",
        tags: ["Jogos"],
        summary: "Consultar os detalhes de um jogo na RAWG",
        description:
            "Consulta diretamente a RAWG pelo externalId retornado na busca, não pelo game.id interno da biblioteca. Não exige que o jogo esteja na biblioteca e não o salva no banco local. Retorna o objeto do jogo diretamente, sem um campo game envolvendo a resposta. Plataformas, gêneros, desenvolvedores e editoras são listas de nomes, vazias quando ausentes; description é texto sem HTML e pode ser vazio. coverUrl e releaseDate podem ser null. Não exige corpo nem cabeçalho CSRF.",
        security: [{ cookieAuth: [] }],
        request: {
            params: getRawgGameSchema.extend({
                externalId: getRawgGameSchema.shape.externalId.meta({
                    description:
                        "ID da RAWG, inteiro positivo. Use externalId da busca, não o ID interno da biblioteca.",
                    example: 58175,
                }),
            }),
        },
        responses: {
            200: {
                description: "Detalhes do jogo consultados com sucesso.",
                content: {
                    "application/json": {
                        schema: gameDetails,
                        example: {
                            ...gameExample,
                            description: "Explore um mundo de fantasia e enfrente seus desafios.",
                            genres: ["Action", "RPG"],
                            developers: ["FromSoftware"],
                            publishers: ["Bandai Namco Entertainment"],
                        },
                    },
                },
            },
            ...commonResponses,
            404: messageResponse("A RAWG respondeu que o jogo não existe.", "Jogo não encontrado"),
            502: messageResponse(
                "Falha de comunicação, resposta inválida ou resposta HTTP de erro da RAWG, exceto 404.",
                "Erro ao buscar jogo na RAWG",
            ),
        },
    });
}
