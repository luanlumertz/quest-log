import { assert, describe, test } from "vitest";

import { AppError } from "../../../src/errors/AppError.js";

import { createAuthenticatedAgent } from "../../fixtures/auth.fixture.js";
import {
    genericGameSearchResult,
    mockRawgSearch,
    mockRawgSearchError,
} from "../../fixtures/rawg.fixture.js";
import { searchGames, searchGamesWithoutCookies } from "../../requests/games/search.request.js";

describe("GET /games/search", () => {
    test("deve pesquisar jogos com usuário autenticado e termo válido", async () => {
        const { agent } = await createAuthenticatedAgent();

        const mockedSearch = mockRawgSearch();

        const response = await searchGames(agent, "Test Game");

        assert.equal(response.status, 200);
        assert.deepEqual(response.body, genericGameSearchResult);

        assert.equal(mockedSearch.mock.calls.length, 1);
        assert.equal(mockedSearch.mock.calls[0]?.[0], "Test Game");
    });

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
        assert.deepEqual(response.body, []);

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
