import { assert, afterEach, describe, test, vi, expect } from "vitest";

import { getRawgGameById, searchRawgGames } from "../../../src/integrations/rawg.js";
import { AppError } from "../../../src/errors/AppError.js";

import {
    mockFetchError,
    mockFetchInvalidJson,
    mockFetchResponse,
} from "../../helpers/http/mockFetch.helper.js";
import { rawgDetailsApiResponse, rawgSearchApiResponse } from "../../factories/rawg.factory.js";

describe("rawg.ts", () => {
    afterEach(() => {
        vi.restoreAllMocks();
        vi.unstubAllGlobals();
    });

    test.each([
        { scenario: "busca", run: () => searchRawgGames("gta") },
        { scenario: "detalhes", run: () => getRawgGameById(123) },
    ])("deve interromper a $scenario após o prazo e retornar AppError 504", async ({ run }) => {
        const controller = new AbortController();
        const timeout = vi.spyOn(AbortSignal, "timeout").mockReturnValue(controller.signal);
        const fetchMock = vi.fn<typeof fetch>().mockImplementation(
            (_url, options) =>
                new Promise((_resolve, reject) => {
                    options?.signal?.addEventListener(
                        "abort",
                        () => reject(options.signal?.reason),
                        { once: true },
                    );
                }),
        );
        vi.stubGlobal("fetch", fetchMock);

        const pending = run();
        const rejected = expect(pending).rejects.toMatchObject({
            statusCode: 504,
            message: "A RAWG demorou para responder. Tente novamente.",
        });
        controller.abort(new DOMException("Prazo excedido", "TimeoutError"));

        await rejected;

        assert.equal(fetchMock.mock.calls.length, 1);
        expect(timeout).toHaveBeenCalledWith(10_000);
        expect(fetchMock.mock.calls[0]?.[1]?.signal).toBe(controller.signal);
    });

    test("deve manter o prazo durante a leitura do corpo da resposta", async () => {
        const controller = new AbortController();
        vi.spyOn(AbortSignal, "timeout").mockReturnValue(controller.signal);
        const response = new Response("{}", { status: 200 });
        vi.spyOn(response, "json").mockImplementation(async () => {
            controller.abort(new DOMException("Prazo excedido", "TimeoutError"));
            throw controller.signal.reason;
        });
        vi.stubGlobal("fetch", vi.fn<typeof fetch>().mockResolvedValue(response));

        await expect(searchRawgGames("gta")).rejects.toMatchObject({
            statusCode: 504,
            message: "A RAWG demorou para responder. Tente novamente.",
        });
    });

    describe("searchRawgGames", () => {
        test("deve preservar o status real do provedor como causa sem alterar o erro público", async () => {
            mockFetchResponse({ message: "detalhe privado" }, 401);

            await expect(searchRawgGames("gta")).rejects.toMatchObject({
                statusCode: 502,
                message: "Erro ao buscar jogos na RAWG",
                cause: {
                    context: {
                        service: "rawg",
                        operation: "search",
                        reason: "http",
                        upstreamStatus: 401,
                    },
                },
            });
        });

        test("deve buscar jogos na RAWG e mapear corretamente os resultados", async () => {
            const fetchMock = mockFetchResponse(rawgSearchApiResponse);

            const result = await searchRawgGames("Elden Ring");

            assert.equal(fetchMock.mock.calls.length, 1);

            assert.ok(fetchMock.mock.calls[0]);
            const calledUrl = fetchMock.mock.calls[0][0] as string;

            assert.include(calledUrl, "search=Elden%20Ring");
            assert.include(calledUrl, "page_size=20");

            assert.equal(result.page, 1);
            assert.isFalse(result.hasPrevious);
            assert.isFalse(result.hasNext);
            assert.include(calledUrl, "page=1");

            assert.deepEqual(result.games, [
                {
                    externalId: 123,
                    title: "Elden Ring",
                    coverUrl: "https://example.com/cover.jpg",
                    releaseDate: "2022-02-25",
                    platforms: ["PC", "PlayStation 5"],
                },
            ]);
        });

        test.each([
            {
                page: 1,
                previous: null,
                next: "https://api.rawg.io/api/games?page=2",
                hasPrevious: false,
                hasNext: true,
            },
            {
                page: 2,
                previous: "https://api.rawg.io/api/games?page=1",
                next: "https://api.rawg.io/api/games?page=3",
                hasPrevious: true,
                hasNext: true,
            },
            {
                page: 3,
                previous: "https://api.rawg.io/api/games?page=2",
                next: null,
                hasPrevious: true,
                hasNext: false,
            },
        ])(
            "deve mapear a navegação da página $page sem expor URLs externas",
            async ({ page, previous, next, hasPrevious, hasNext }) => {
                const fetchMock = mockFetchResponse({ ...rawgSearchApiResponse, previous, next });

                const result = await searchRawgGames("a", page);

                const url = new URL(fetchMock.mock.calls[0]![0] as string);
                assert.equal(url.searchParams.get("page"), String(page));
                assert.equal(url.searchParams.get("page_size"), "20");
                assert.equal(url.searchParams.get("search"), "a");
                assert.equal(result.page, page);
                assert.equal(result.hasPrevious, hasPrevious);
                assert.equal(result.hasNext, hasNext);
                assert.notProperty(result, "next");
                assert.notProperty(result, "previous");
            },
        );

        test("deve rejeitar metadados de paginação inválidos da RAWG", async () => {
            mockFetchResponse({ ...rawgSearchApiResponse, next: 123 });

            await expect(searchRawgGames("gta")).rejects.toMatchObject({ statusCode: 502 });
        });

        test("deve mapear corretamente jogos com campos opcionais ausentes", async () => {
            const fetchMock = mockFetchResponse({
                next: null,
                previous: null,
                results: [{ id: 456, name: "Jogo Sem Detalhes" }],
            });

            const result = await searchRawgGames("Jogo Sem Detalhes");

            assert.equal(result.games.length, 1);
            assert.deepEqual(result.games[0], {
                externalId: 456,
                title: "Jogo Sem Detalhes",
                releaseDate: null,
                coverUrl: null,
                platforms: [],
            });
            assert.equal(fetchMock.mock.calls.length, 1);
        });

        test("deve retornar resultados vazios quando a RAWG não encontrar jogos", async () => {
            const fetchMock = mockFetchResponse({ results: [], next: null, previous: null });

            const result = await searchRawgGames("Pesquisa sem jogos encontrados");

            assert.deepEqual(result, { games: [], page: 1, hasPrevious: false, hasNext: false });
            assert.equal(fetchMock.mock.calls.length, 1);
        });

        test("deve lançar AppError 502 quando a RAWG retornar uma resposta HTTP de erro", async () => {
            const fetchMock = mockFetchResponse(undefined, 500);

            const promise = searchRawgGames("Elden Ring");

            await expect(promise).rejects.toBeInstanceOf(AppError);

            await expect(promise).rejects.toMatchObject({
                statusCode: 502,
                message: "Erro ao buscar jogos na RAWG",
            });

            assert.equal(fetchMock.mock.calls.length, 1);
        });

        test("deve lançar AppError 502 quando a requisição à RAWG falhar por erro de rede", async () => {
            const fetchMock = mockFetchError();

            const promise = searchRawgGames("Elden Ring");

            await expect(promise).rejects.toBeInstanceOf(AppError);

            await expect(promise).rejects.toMatchObject({
                statusCode: 502,
                message: "Erro ao buscar jogos na RAWG",
            });

            assert.equal(fetchMock.mock.calls.length, 1);
        });

        test("deve lançar AppError 502 quando a RAWG retornar JSON inválido", async () => {
            const fetchMock = mockFetchInvalidJson();

            const promise = searchRawgGames("Elden Ring");

            await expect(promise).rejects.toBeInstanceOf(AppError);

            await expect(promise).rejects.toMatchObject({
                statusCode: 502,
                message: "Erro ao buscar jogos na RAWG",
            });

            assert.equal(fetchMock.mock.calls.length, 1);
        });

        test("deve lançar AppError 502 quando a RAWG retornar dados em formato inválido", async () => {
            const fetchMock = mockFetchResponse({
                results: [{ id: "123", name: "Elden Ring" }],
            });

            const promise = searchRawgGames("Elden Ring");

            await expect(promise).rejects.toBeInstanceOf(AppError);

            await expect(promise).rejects.toMatchObject({
                statusCode: 502,
                message: "Erro ao buscar jogos na RAWG",
            });

            assert.equal(fetchMock.mock.calls.length, 1);
        });
    });

    describe("getRawgGameById", () => {
        test("deve buscar um jogo pelo ID na RAWG e mapear corretamente seus dados", async () => {
            const fetchMock = mockFetchResponse(rawgDetailsApiResponse);

            const result = await getRawgGameById(123);

            assert.equal(fetchMock.mock.calls.length, 1);

            assert.ok(fetchMock.mock.calls[0]);
            const calledUrl = fetchMock.mock.calls[0][0] as string;

            assert.include(calledUrl, "key=");
            assert.include(calledUrl, "games/123");

            assert.deepEqual(result, {
                externalId: 123,
                title: "Elden Ring",
                coverUrl: "https://example.com/cover.jpg",
                releaseDate: "2022-02-25",
                description: "Um RPG de ação em mundo aberto.",
                genres: ["Action", "RPG"],
                platforms: ["PC", "PlayStation 5"],
                developers: ["FromSoftware"],
                publishers: ["Bandai Namco Entertainment"],
            });
        });

        test("deve mapear corretamente os detalhes de um jogo com campos opcionais ausentes", async () => {
            const fetchMock = mockFetchResponse({
                id: 456,
                name: "Jogo Sem Detalhes",
            });

            const result = await getRawgGameById(456);

            assert.deepEqual(result, {
                externalId: 456,
                title: "Jogo Sem Detalhes",
                coverUrl: null,
                releaseDate: null,
                description: "",
                genres: [],
                platforms: [],
                developers: [],
                publishers: [],
            });

            assert.equal(fetchMock.mock.calls.length, 1);
        });

        test("deve lançar AppError 404 quando a RAWG não encontrar o jogo pelo ID", async () => {
            const fetchMock = mockFetchResponse(undefined, 404);

            const promise = getRawgGameById(999999);

            await expect(promise).rejects.toBeInstanceOf(AppError);

            await expect(promise).rejects.toMatchObject({
                statusCode: 404,
                message: "Jogo não encontrado",
            });

            assert.equal(fetchMock.mock.calls.length, 1);
        });

        test("deve lançar AppError 502 quando a RAWG retornar um erro HTTP 500", async () => {
            const fetchMock = mockFetchResponse(undefined, 500);

            const promise = getRawgGameById(123);

            await expect(promise).rejects.toBeInstanceOf(AppError);

            await expect(promise).rejects.toMatchObject({
                statusCode: 502,
                message: "Erro ao buscar jogo na RAWG",
            });

            assert.equal(fetchMock.mock.calls.length, 1);
        });

        test("deve lançar AppError 502 quando a requisição de detalhes à RAWG falhar por erro de rede", async () => {
            const fetchMock = mockFetchError();

            const promise = getRawgGameById(123);

            await expect(promise).rejects.toBeInstanceOf(AppError);

            await expect(promise).rejects.toMatchObject({
                statusCode: 502,
                message: "Erro ao buscar jogo na RAWG",
            });

            assert.equal(fetchMock.mock.calls.length, 1);
        });

        test("deve lançar AppError 502 quando os detalhes da RAWG vierem com JSON inválido", async () => {
            const fetchMock = mockFetchInvalidJson();

            const promise = getRawgGameById(123);

            await expect(promise).rejects.toBeInstanceOf(AppError);

            await expect(promise).rejects.toMatchObject({
                statusCode: 502,
                message: "Erro ao buscar jogo na RAWG",
            });

            assert.equal(fetchMock.mock.calls.length, 1);
        });

        test("deve lançar AppError 502 quando os detalhes da RAWG vierem em formato inválido", async () => {
            const fetchMock = mockFetchResponse({
                id: 123,
                name: "Elden Ring",
                genres: [{ name: 123 }],
            });

            const promise = getRawgGameById(123);

            await expect(promise).rejects.toBeInstanceOf(AppError);

            await expect(promise).rejects.toMatchObject({
                statusCode: 502,
                message: "Erro ao buscar jogo na RAWG",
            });

            assert.equal(fetchMock.mock.calls.length, 1);
        });
    });
});
