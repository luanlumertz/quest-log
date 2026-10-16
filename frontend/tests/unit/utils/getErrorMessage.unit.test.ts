import { assert, describe, test } from "vitest";

import { getErrorMessage } from "../../../src/utils/getErrorMessage";
import { ApiError, NetworkError } from "../../../src/services/api";

describe("getErrorMessage", () => {
    test("deve retornar a mensagem original para NetworkError", () => {
        const error = new NetworkError();

        const result = getErrorMessage(error, "Fallback genérico");

        assert.equal(result, "Não foi possível conectar ao servidor.");
    });

    test.each([
        {
            scenario: "requisição inválida",
            status: 400,
            message: "Dados inválidos",
        },
        {
            scenario: "recurso não encontrado",
            status: 404,
            message: "Jogo não encontrado",
        },
        {
            scenario: "limite superior dos erros 4xx",
            status: 499,
            message: "Erro do cliente",
        },
    ])("deve retornar a mensagem da API para $scenario", ({ status, message }) => {
        const error = new ApiError(message, status);

        const result = getErrorMessage(error, "Erro genérico");

        assert.equal(result, message);
    });

    test.each([
        {
            scenario: "erro interno",
            status: 500,
            message: "Erro interno do servidor",
        },
        {
            scenario: "bad gateway",
            status: 502,
            message: "Erro ao buscar jogos na RAWG",
        },
        {
            scenario: "status abaixo de 400",
            status: 399,
            message: "Mensagem inesperada",
        },
    ])("deve retornar o fallback para $scenario", ({ status, message }) => {
        const error = new ApiError(message, status);

        const result = getErrorMessage(error, "Erro genérico");

        assert.equal(result, "Erro genérico");
    });

    test.each([
        {
            scenario: "erro genérico",
            entry: new Error("Erro inesperado"),
        },
        {
            scenario: "string",
            entry: "Erro qualquer",
        },
        {
            scenario: "valor nulo",
            entry: null,
        },
        {
            scenario: "valor indefinido",
            entry: undefined,
        },
    ])("deve retornar o fallback para $scenario", ({ entry }) => {
        const result = getErrorMessage(entry, "Erro genérico");

        assert.equal(result, "Erro genérico");
    });
});
