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
        vi.unstubAllGlobals();
    });

    describe("searchRawgGames", () => {
        test("deve buscar jogos na RAWG e mapear corretamente os resultados", async () => {
            const fetchMock = mockFetchResponse(rawgSearchApiResponse);

            const result = await searchRawgGames("Elden Ring");

            assert.equal(fetchMock.mock.calls.length, 1);

            assert.ok(fetchMock.mock.calls[0]);
            const calledUrl = fetchMock.mock.calls[0][0] as string;

            assert.include(calledUrl, "search=Elden%20Ring");
            assert.include(calledUrl, "page_size=10");

            assert.deepEqual(result, [
                {
                    externalId: 123,
                    title: "Elden Ring",
                    coverUrl: "https://example.com/cover.jpg",
                    releaseDate: "2022-02-25",
                    platforms: ["PC", "PlayStation 5"],
                },
            ]);
        });

        test("deve mapear corretamente jogos com campos opcionais ausentes", async () => {
            const fetchMock = mockFetchResponse({
                results: [{ id: 456, name: "Jogo Sem Detalhes" }],
            });

            const result = await searchRawgGames("Jogo Sem Detalhes");

            assert.equal(result.length, 1);
            assert.deepEqual(result[0], {
                externalId: 456,
                title: "Jogo Sem Detalhes",
                releaseDate: null,
                coverUrl: null,
                platforms: [],
            });
            assert.equal(fetchMock.mock.calls.length, 1);
        });

        test("deve retornar um array vazio quando a RAWG não encontrar jogos", async () => {
            const fetchMock = mockFetchResponse({ results: [] });

            const result = await searchRawgGames("Pesquisa sem jogos encontrados");

            assert.deepEqual(result, []);
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
