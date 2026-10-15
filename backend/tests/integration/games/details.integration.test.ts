import { assert, describe, test } from "vitest";

import { AppError } from "../../../src/errors/AppError.js";

import { createAuthenticatedAgent } from "../../fixtures/auth.fixture.js";
import { mockRawgGameDetails, mockRawgGameDetailsError } from "../../fixtures/rawg.fixture.js";
import { genericGameDetailsResult } from "../../factories/rawg.factory.js";
import {
    getGameDetails,
    getGameDetailsWithoutCookies,
} from "../../requests/games/details.request.js";

describe("GET /games/:externalId", () => {
    test("deve retornar os detalhes de um jogo com externalId válido", async () => {
        const { agent } = await createAuthenticatedAgent();

        const mockedDetails = mockRawgGameDetails();

        const response = await getGameDetails(agent, 123);

        assert.equal(response.status, 200);
        assert.deepEqual(response.body, genericGameDetailsResult);

        assert.equal(mockedDetails.mock.calls.length, 1);
        assert.equal(mockedDetails.mock.calls[0]?.[0], 123);
    });

    test("não deve retornar detalhes de jogo sem access token", async () => {
        const mockedDetails = mockRawgGameDetails();

        const response = await getGameDetailsWithoutCookies(123);

        assert.equal(response.status, 401);
        assert.equal(response.body.message, "Não autenticado");

        assert.equal(mockedDetails.mock.calls.length, 0);
    });

    test("não deve retornar detalhes de jogo com externalId inválido", async () => {
        const { agent } = await createAuthenticatedAgent();

        const mockedDetails = mockRawgGameDetails();

        const response = await getGameDetails(agent, 0);

        assert.equal(response.status, 422);
        assert.equal(response.body.error, "Erro de Validação");

        assert.equal(mockedDetails.mock.calls.length, 0);
    });

    test("deve retornar 404 quando o jogo não for encontrado", async () => {
        const { agent } = await createAuthenticatedAgent();

        const mockedDetails = mockRawgGameDetailsError(new AppError("Jogo não encontrado", 404));

        const response = await getGameDetails(agent, 999999);

        assert.equal(response.status, 404);
        assert.equal(response.body.message, "Jogo não encontrado");

        assert.equal(mockedDetails.mock.calls.length, 1);
        assert.equal(mockedDetails.mock.calls[0]?.[0], 999999);
    });

    test("deve retornar 502 quando a RAWG falhar ao buscar os detalhes do jogo", async () => {
        const { agent } = await createAuthenticatedAgent();

        const mockedDetails = mockRawgGameDetailsError(
            new AppError("Erro ao buscar jogo na RAWG", 502),
        );

        const response = await getGameDetails(agent, 123);

        assert.equal(response.status, 502);
        assert.equal(response.body.message, "Erro ao buscar jogo na RAWG");

        assert.equal(mockedDetails.mock.calls.length, 1);
        assert.equal(mockedDetails.mock.calls[0]?.[0], 123);
    });
});
