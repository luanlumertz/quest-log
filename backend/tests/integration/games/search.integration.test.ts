import { assert, describe, test } from "vitest";

import { AppError } from "../../../src/errors/AppError.js";

import { createAuthenticatedAgent } from "../../fixtures/auth.fixture.js";
import { mockRawgSearch, mockRawgSearchError } from "../../fixtures/rawg.fixture.js";
import { genericGameSearchResult } from "../../factories/rawg.factory.js";
import { searchGames, searchGamesWithoutCookies } from "../../requests/games/search.request.js";

describe("GET /games/search", () => {
    test("deve pesquisar jogos com usuário autenticado e termo válido", async () => {
        const { agent } = await createAuthenticatedAgent();

        const mockedSearch = mockRawgSearch();

        const response = await searchGames(agent, "Test Game");

        assert.equal(response.status, 200);
        assert.deepEqual(response.body, {
            games: genericGameSearchResult,
            page: 1,
            hasPrevious: false,
            hasNext: false,
        });
        assert.equal(mockedSearch.mock.calls[0]?.[1], 1);

        assert.equal(mockedSearch.mock.calls.length, 1);
        assert.equal(mockedSearch.mock.calls[0]?.[0], "Test Game");
    });

    test("deve encaminhar a página e manter buscas de um caractere", async () => {
        const { agent } = await createAuthenticatedAgent();
        const mockedSearch = mockRawgSearch(genericGameSearchResult, {
            page: 2,
            hasPrevious: true,
            hasNext: true,
        });

        const response = await searchGames(agent, "a", 2).query({ page_size: 1000 });

        assert.equal(response.status, 200);
        assert.deepEqual(response.body, {
            games: genericGameSearchResult,
            page: 2,
            hasPrevious: true,
            hasNext: true,
        });
        assert.deepEqual(mockedSearch.mock.calls[0], ["a", 2]);
    });

    test.each(["0", "-1", "1.5", "abc"])(
        "deve rejeitar página %s antes de consultar a RAWG",
        async (page) => {
            const { agent } = await createAuthenticatedAgent();
            const mockedSearch = mockRawgSearch();

            const response = await searchGames(agent, "gta", page);

            assert.equal(response.status, 422);
            assert.equal(mockedSearch.mock.calls.length, 0);
        },
    );

    test("não deve pesquisar jogos sem access token", async () => {
        const mockedSearch = mockRawgSearch();

        const response = await searchGamesWithoutCookies("Test Game");

        assert.equal(response.status, 401);
        assert.equal(response.body.message, "Não autenticado");

        assert.equal(mockedSearch.mock.calls.length, 0);
    });

    test("não deve pesquisar jogos com query inválida", async () => {
        const { agent } = await createAuthenticatedAgent();

        const mockedSearch = mockRawgSearch();

        const response = await searchGames(agent, "   ");

        assert.equal(response.status, 422);
        assert.equal(response.body.error, "Erro de Validação");

        assert.equal(mockedSearch.mock.calls.length, 0);
    });

    test("deve retornar lista vazia quando nenhum jogo for encontrado", async () => {
        const { agent } = await createAuthenticatedAgent();

        const mockedSearch = mockRawgSearch([]);

        const response = await searchGames(agent, "JogoInexistente");

        assert.equal(response.status, 200);
        assert.deepEqual(response.body, { games: [], page: 1, hasPrevious: false, hasNext: false });

        assert.equal(mockedSearch.mock.calls.length, 1);
        assert.equal(mockedSearch.mock.calls[0]?.[0], "JogoInexistente");
    });

    test("deve retornar 502 quando a RAWG falhar", async () => {
        const { agent } = await createAuthenticatedAgent();

        const mockedSearch = mockRawgSearchError(new AppError("Erro ao buscar jogos na RAWG", 502));

        const response = await searchGames(agent, "Test Game");

        assert.equal(response.status, 502);
        assert.equal(response.body.message, "Erro ao buscar jogos na RAWG");

        assert.equal(mockedSearch.mock.calls.length, 1);
        assert.equal(mockedSearch.mock.calls[0]?.[0], "Test Game");
    });
});
