import { describe, expect, test } from "vitest";

import { queryClient } from "../../../src/lib/queryClient";
import { ApiError, NetworkError } from "../../../src/services/api";

function shouldRetry(failureCount: number, error: Error) {
    const retry = queryClient.getDefaultOptions().queries?.retry;
    if (typeof retry !== "function") throw new Error("Política de retry não configurada");
    return retry(failureCount, error);
}

describe("queryClient.ts", () => {
    test.each([400, 401, 403, 404, 422])("não deve repetir erros HTTP %s", (status) => {
        expect(shouldRetry(0, new ApiError("Requisição inválida", status))).toBe(false);
    });

    test.each([
        { scenario: "timeout HTTP", error: new ApiError("Timeout", 408) },
        { scenario: "limite de requisições", error: new ApiError("Limite", 429) },
        { scenario: "erro interno", error: new ApiError("Erro interno", 500) },
        { scenario: "serviço indisponível", error: new ApiError("Indisponível", 503) },
        { scenario: "falha de rede", error: new NetworkError() },
    ])("deve permitir apenas uma nova tentativa para $scenario", ({ error }) => {
        expect(shouldRetry(0, error)).toBe(true);
        expect(shouldRetry(1, error)).toBe(false);
        expect(shouldRetry(2, error)).toBe(false);
    });
});
