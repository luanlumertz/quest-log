import { assert, describe, expect, test, vi } from "vitest";
import { delay, http, HttpResponse } from "msw";

import {
    API_URL,
    ApiError,
    apiRequest,
    AUTH_SESSION_EXPIRED_EVENT,
    NetworkError,
} from "../../../src/services/api";

import { server } from "../../mocks/server.mock";
import { mockApiResponse } from "../../mocks/api.mock";

describe("api.ts", () => {
    test("deve realizar uma requisição GET com credentials include", async () => {
        const { requests } = mockApiResponse({
            method: "GET",
            endpoint: "/healthz",
        });

        const fetchSpy = vi.spyOn(globalThis, "fetch");

        try {
            const response = await apiRequest("/healthz");

            assert.equal(response.status, 200);
            assert.deepEqual(await response.json(), { ok: true });
            assert.equal(requests[0]?.method, "GET");
            assert.equal(fetchSpy.mock.calls[0]?.[1]?.credentials, "include");
        } finally {
            fetchSpy.mockRestore();
        }
    });

    test("deve enviar uma requisição POST com corpo JSON e Content-Type correto", async () => {
        const payload = {
            email: "teste@email.com",
            password: "12345678",
        };

        const { requests } = mockApiResponse({
            method: "POST",
            endpoint: "/auth/login",
        });

        const response = await apiRequest("/auth/login", {
            method: "POST",
            body: JSON.stringify(payload),
        });

        assert.equal(response.status, 200);
        assert.deepEqual(requests[0]?.body, payload);
        assert.equal(requests[0]?.contentType, "application/json");
        assert.deepEqual(await response.json(), { ok: true });
    });

    test("deve preservar o Content-Type informado explicitamente", async () => {
        const { requests } = mockApiResponse({
            method: "POST",
            endpoint: "/auth/login",
        });

        const response = await apiRequest("/auth/login", {
            method: "POST",
            headers: { "Content-Type": "text/plain" },
            body: "mensagem de teste",
        });

        assert.equal(response.status, 200);
        assert.equal(requests[0]?.body, "mensagem de teste");
        assert.equal(requests[0]?.contentType, "text/plain");
    });

    test("deve lançar ApiError preservando status, mensagem e issues", async () => {
        const issues = [{ path: ["email"], message: "Email inválido" }];

        mockApiResponse({
            method: "POST",
            endpoint: "/auth/login",
            responseBody: {
                message: "Dados inválidos",
                issues,
            },
            status: 400,
        });

        const response = apiRequest("/auth/login", { method: "POST" });

        await expect(response).rejects.toBeInstanceOf(ApiError);

        await expect(response).rejects.toMatchObject({
            status: 400,
            message: "Dados inválidos",
            issues,
        });
    });

    test("deve utilizar a propriedade error quando message não estiver presente", async () => {
        mockApiResponse({
            method: "POST",
            endpoint: "/auth/login",
            responseBody: { error: "Credenciais inválidas" },
            status: 400,
        });

        const response = apiRequest("/auth/login", { method: "POST" });

        await expect(response).rejects.toBeInstanceOf(ApiError);

        await expect(response).rejects.toMatchObject({
            status: 400,
            message: "Credenciais inválidas",
        });
    });

    test("deve utilizar a mensagem padrão quando a API não fornecer uma mensagem de erro", async () => {
        mockApiResponse({
            method: "POST",
            endpoint: "/auth/login",
            responseBody: {},
            status: 400,
        });

        const response = apiRequest("/auth/login", { method: "POST" });

        await expect(response).rejects.toBeInstanceOf(ApiError);

        await expect(response).rejects.toMatchObject({
            status: 400,
            message: "Ocorreu um erro na requisição.",
        });
    });

    test("deve utilizar a mensagem padrão quando a resposta de erro não for JSON válido", async () => {
        server.use(
            http.post(`${API_URL}/auth/login`, () => {
                return HttpResponse.text("Erro interno", { status: 500 });
            }),
        );

        const response = apiRequest("/auth/login", { method: "POST" });

        await expect(response).rejects.toBeInstanceOf(ApiError);

        await expect(response).rejects.toMatchObject({
            status: 500,
            message: "Não foi possível processar a resposta do servidor.",
        });
    });

    test("deve lançar NetworkError quando ocorrer uma falha de conexão", async () => {
        server.use(
            http.get(`${API_URL}/healthz`, () => {
                return HttpResponse.error();
            }),
        );

        const response = apiRequest("/healthz");

        await expect(response).rejects.toBeInstanceOf(NetworkError);

        await expect(response).rejects.toMatchObject({
            message: "Não foi possível conectar ao servidor.",
        });
    });

    test("deve renovar a sessão e repetir a requisição após receber 401", async () => {
        let meRequests = 0;

        const { requests: refreshRequests } = mockApiResponse({
            method: "POST",
            endpoint: "/auth/refresh",
        });

        server.use(
            http.get(`${API_URL}/auth/me`, () => {
                meRequests++;

                if (meRequests === 1) {
                    return HttpResponse.json({ message: "Não autorizado" }, { status: 401 });
                }

                return HttpResponse.json({
                    id: 1,
                    name: "João",
                });
            }),
        );

        const response = await apiRequest("/auth/me");

        assert.equal(response.status, 200);
        assert.deepEqual(await response.json(), {
            id: 1,
            name: "João",
        });
        assert.equal(meRequests, 2);
        assert.equal(refreshRequests.length, 1);
    });

    test("deve expirar a sessão quando o refresh retornar 401", async () => {
        const { requests: meRequests } = mockApiResponse({
            method: "GET",
            endpoint: "/auth/me",
            status: 401,
        });

        const { requests: refreshRequests } = mockApiResponse({
            method: "POST",
            endpoint: "/auth/refresh",
            status: 401,
        });

        let expiredEvents = 0;

        const handleSessionExpired = () => {
            expiredEvents++;
        };

        window.addEventListener(AUTH_SESSION_EXPIRED_EVENT, handleSessionExpired);

        try {
            const response = apiRequest("/auth/me");

            await expect(response).rejects.toBeInstanceOf(ApiError);

            await expect(response).rejects.toMatchObject({
                status: 401,
                message: "Sessão inválida.",
            });

            assert.equal(meRequests.length, 1);
            assert.equal(refreshRequests.length, 1);
            assert.equal(expiredEvents, 1);
        } finally {
            window.removeEventListener(AUTH_SESSION_EXPIRED_EVENT, handleSessionExpired);
        }
    });

    test("deve expirar a sessão quando a requisição repetida continuar retornando 401", async () => {
        const { requests: meRequests } = mockApiResponse({
            method: "GET",
            endpoint: "/auth/me",
            status: 401,
        });

        const { requests: refreshRequests } = mockApiResponse({
            method: "POST",
            endpoint: "/auth/refresh",
        });

        let expiredEvents = 0;

        const handleSessionExpired = () => {
            expiredEvents++;
        };

        window.addEventListener(AUTH_SESSION_EXPIRED_EVENT, handleSessionExpired);

        try {
            const response = apiRequest("/auth/me");

            await expect(response).rejects.toBeInstanceOf(ApiError);

            await expect(response).rejects.toMatchObject({
                status: 401,
                message: "Sessão inválida.",
            });

            assert.equal(meRequests.length, 2);
            assert.equal(refreshRequests.length, 1);
            assert.equal(expiredEvents, 1);
        } finally {
            window.removeEventListener(AUTH_SESSION_EXPIRED_EVENT, handleSessionExpired);
        }
    });

    test.each([
        {
            scenario: "login",
            endpoint: "/auth/login",
        },
        {
            scenario: "logout",
            endpoint: "/auth/logout",
        },
        {
            scenario: "cadastro",
            endpoint: "/auth/register",
        },
    ])("não deve tentar renovar a sessão quando $scenario retornar 401", async ({ endpoint }) => {
        const { requests: refreshRequests } = mockApiResponse({
            method: "POST",
            endpoint: "/auth/refresh",
        });

        const { requests: endpointRequests } = mockApiResponse({
            method: "POST",
            endpoint,
            status: 401,
            responseBody: { message: "Não autorizado" },
        });

        const response = apiRequest(endpoint, { method: "POST" });

        await expect(response).rejects.toBeInstanceOf(ApiError);

        await expect(response).rejects.toMatchObject({
            status: 401,
            message: "Não autorizado",
        });

        assert.equal(endpointRequests.length, 1);
        assert.equal(refreshRequests.length, 0);
    });

    test("não deve tentar renovar a sessão quando o próprio endpoint de refresh retornar 401", async () => {
        const { requests } = mockApiResponse({
            method: "POST",
            endpoint: "/auth/refresh",
            status: 401,
            responseBody: { message: "Refresh inválido" },
        });

        const response = apiRequest("/auth/refresh", { method: "POST" });

        await expect(response).rejects.toBeInstanceOf(ApiError);

        await expect(response).rejects.toMatchObject({
            status: 401,
            message: "Refresh inválido",
        });

        assert.equal(requests.length, 1);
    });

    test("deve compartilhar uma única tentativa de refresh entre requisições simultâneas", async () => {
        let meRequests = 0;
        let libraryRequests = 0;
        let refreshRequests = 0;

        server.use(
            http.get(`${API_URL}/auth/me`, () => {
                meRequests++;

                if (meRequests === 1) {
                    return HttpResponse.json({ message: "Não autorizado" }, { status: 401 });
                }

                return HttpResponse.json({ id: 1, name: "João" });
            }),

            http.get(`${API_URL}/library`, () => {
                libraryRequests++;

                if (libraryRequests === 1) {
                    return HttpResponse.json({ message: "Não autorizado" }, { status: 401 });
                }

                return HttpResponse.json({ games: [] });
            }),

            http.post(`${API_URL}/auth/refresh`, async () => {
                refreshRequests++;

                await delay(50);

                return HttpResponse.json({ ok: true });
            }),
        );

        const [meResponse, libraryResponse] = await Promise.all([
            apiRequest("/auth/me"),
            apiRequest("/library"),
        ]);

        assert.equal(meResponse.status, 200);
        assert.equal(libraryResponse.status, 200);
        assert.equal(meRequests, 2);
        assert.equal(libraryRequests, 2);
        assert.equal(refreshRequests, 1);
    });

    test("deve rejeitar as requisições simultâneas quando o refresh compartilhado falhar", async () => {
        let meRequests = 0;
        let libraryRequests = 0;
        let refreshRequests = 0;
        let expiredEvents = 0;

        const onSessionExpired = () => {
            expiredEvents++;
        };

        server.use(
            http.get(`${API_URL}/auth/me`, () => {
                meRequests++;

                return HttpResponse.json({ message: "Sessão inválida." }, { status: 401 });
            }),

            http.get(`${API_URL}/library`, () => {
                libraryRequests++;

                return HttpResponse.json({ message: "Sessão inválida." }, { status: 401 });
            }),

            http.post(`${API_URL}/auth/refresh`, async () => {
                refreshRequests++;

                await delay(50);

                return HttpResponse.json({ message: "Sessão inválida." }, { status: 401 });
            }),
        );

        window.addEventListener(AUTH_SESSION_EXPIRED_EVENT, onSessionExpired);

        try {
            const [meResponse, libraryResponse] = await Promise.allSettled([
                apiRequest("/auth/me"),
                apiRequest("/library"),
            ]);

            assert.equal(meResponse.status, "rejected");
            assert.equal(libraryResponse.status, "rejected");

            if (meResponse.status === "rejected" && libraryResponse.status === "rejected") {
                expect(meResponse.reason).toBeInstanceOf(ApiError);
                expect(meResponse.reason).toMatchObject({
                    status: 401,
                    message: "Sessão inválida.",
                });
                expect(libraryResponse.reason).toBeInstanceOf(ApiError);
                expect(libraryResponse.reason).toMatchObject({
                    status: 401,
                    message: "Sessão inválida.",
                });
            }

            assert.equal(meRequests, 1);
            assert.equal(libraryRequests, 1);
            assert.equal(refreshRequests, 1);
            assert.equal(expiredEvents, 1);
        } finally {
            window.removeEventListener(AUTH_SESSION_EXPIRED_EVENT, onSessionExpired);
        }
    });

    test("deve propagar o erro quando o refresh retornar 500 sem expirar a sessão", async () => {
        let expiredEvents = 0;

        const { requests: meRequests } = mockApiResponse({
            method: "GET",
            endpoint: "/auth/me",
            responseBody: { message: "Não autorizado" },
            status: 401,
        });

        const { requests: refreshRequests } = mockApiResponse({
            method: "POST",
            endpoint: "/auth/refresh",
            responseBody: { message: "Erro interno" },
            status: 500,
        });

        const onSessionExpired = () => {
            expiredEvents++;
        };

        window.addEventListener(AUTH_SESSION_EXPIRED_EVENT, onSessionExpired);

        try {
            const promise = apiRequest("/auth/me");

            await expect(promise).rejects.toBeInstanceOf(ApiError);
            await expect(promise).rejects.toMatchObject({
                status: 500,
                message: "Não foi possível renovar a sessão.",
            });

            assert.equal(meRequests.length, 1);
            assert.equal(refreshRequests.length, 1);
            assert.equal(expiredEvents, 0);
        } finally {
            window.removeEventListener(AUTH_SESSION_EXPIRED_EVENT, onSessionExpired);
        }
    });
});
