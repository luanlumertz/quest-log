import { describe, test, assert, vi } from "vitest";
import request from "supertest";

import app from "../../../src/app.js";

import { createRegisteredUser, createAuthenticatedAgent } from "../../fixtures/auth.fixture.js";
import { mockRawgGameDetails, mockRawgSearch } from "../../fixtures/rawg.fixture.js";
import { createLibraryPayload } from "../../factories/library.factory.js";
import { loginUser } from "../../requests/auth/login.request.js";
import { changePassword } from "../../requests/auth/password.request.js";
import { searchGames } from "../../requests/games/search.request.js";
import { getGameDetails } from "../../requests/games/details.request.js";
import { addGameToLibrary } from "../../requests/library/create.request.js";
import { listLibrary } from "../../requests/library/list.request.js";
import { refreshUser, refreshUserWithoutToken } from "../../requests/auth/refresh.request.js";

describe("rateLimit.middleware.ts", () => {
    test("logins bem-sucedidos não devem acumular no limite de falhas", async () => {
        const { payload } = await createRegisteredUser();

        for (let attempt = 0; attempt < 12; attempt++) {
            assert.equal(
                (await loginUser({ email: payload.email, password: payload.password })).status,
                200,
            );
        }
    });

    test.each([
        { route: "/auth/register", limit: 10 },
        { route: "/auth/login", limit: 10 },
        { route: "/auth/register/verify", limit: 30 },
        { route: "/auth/register/resend", limit: 10 },
        { route: "/auth/password/forgot", limit: 10 },
        { route: "/auth/password/verify", limit: 30 },
        { route: "/auth/password/reset", limit: 10 },
    ])("deve bloquear $route após $limit chamadas malsucedidas", async ({ route, limit }) => {
        for (let attempt = 0; attempt < limit; attempt++) {
            assert.equal((await request(app).post(route).send({})).status, 422);
        }

        const response = await request(app).post(route).send({});

        assert.equal(response.status, 429);
        assert.exists(response.headers["retry-after"]);
    });

    test("solicitação e reenvio de recuperação devem compartilhar o limite por IP", async () => {
        for (let attempt = 0; attempt < 10; attempt++) {
            const route = attempt % 2 === 0 ? "/auth/password/forgot" : "/auth/password/resend";
            const response = await request(app).post(route).send({});

            assert.equal(response.status, 422);
        }

        const response = await request(app).post("/auth/password/resend").send({});

        assert.equal(response.status, 429);
        assert.exists(response.headers["retry-after"]);
    });

    test("deve limitar erros de senha atual por usuário sem bloquear outra conta no mesmo IP", async () => {
        const first = await createAuthenticatedAgent();
        const second = await createAuthenticatedAgent({ email: "outro@email.com" });
        const payload = { currentPassword: "senha incorreta", password: "nova senha" };

        for (let attempt = 0; attempt < 10; attempt++) {
            assert.equal((await changePassword(first.agent, payload)).status, 400);
        }

        const blocked = await changePassword(first.agent, payload);
        const otherAccount = await changePassword(second.agent, payload);

        assert.equal(blocked.status, 429);
        assert.exists(blocked.headers["retry-after"]);
        assert.equal(otherAccount.status, 400);
    });

    test("deve compartilhar 250 buscas, detalhes e adições por usuário e liberar após cinco minutos", async () => {
        const first = await createAuthenticatedAgent();
        const second = await createAuthenticatedAgent({ email: "outro@email.com" });
        const mockedSearch = mockRawgSearch();
        const mockedDetails = mockRawgGameDetails();
        const payload = createLibraryPayload();

        vi.useFakeTimers({ toFake: ["Date"] });

        try {
            for (let attempt = 0; attempt < 249; attempt++) {
                const response =
                    attempt % 2 === 0
                        ? await searchGames(first.agent, "Test Game")
                        : await getGameDetails(first.agent, 123);

                assert.equal(response.status, 200);
            }

            const added = await addGameToLibrary(first.agent, payload);

            assert.equal(added.status, 201);

            const blockedSearch = await searchGames(first.agent, "Test Game");
            const blockedDetails = await getGameDetails(first.agent, 123);
            const blockedAddition = await addGameToLibrary(
                first.agent,
                createLibraryPayload({ externalId: 999 }),
            );

            for (const response of [blockedSearch, blockedDetails, blockedAddition]) {
                assert.equal(response.status, 429);
                assert.equal(
                    response.body.message,
                    "Muitas consultas em pouco tempo. Aguarde alguns minutos e tente novamente.",
                );
                assert.equal(Number(response.headers["retry-after"]), 300);
            }

            assert.equal(mockedSearch.mock.calls.length, 125);
            assert.equal(mockedDetails.mock.calls.length, 125);

            const otherSearch = await searchGames(second.agent, "Test Game");
            const otherDetails = await getGameDetails(second.agent, 123);
            const otherAddition = await addGameToLibrary(second.agent, payload);
            const library = await listLibrary(first.agent);

            assert.equal(otherSearch.status, 200);
            assert.equal(otherDetails.status, 200);
            assert.equal(otherAddition.status, 201);
            assert.equal(library.status, 200);
            assert.equal(library.body.libraryEntries.length, 1);

            vi.setSystemTime(Date.now() + 5 * 60 * 1000 + 1);

            const renewedSearch = await searchGames(first.agent, "Test Game");
            const renewedDetails = await getGameDetails(first.agent, 123);
            const duplicateAddition = await addGameToLibrary(first.agent, payload);

            assert.equal(renewedSearch.status, 200);
            assert.equal(renewedDetails.status, 200);
            assert.equal(duplicateAddition.status, 409);
            assert.equal(mockedSearch.mock.calls.length, 127);
            assert.equal(mockedDetails.mock.calls.length, 127);
        } finally {
            vi.useRealTimers();
        }
    });

    test("deve limitar refresh a 100 chamadas por IP e preservar as sessões durante o bloqueio", async () => {
        const first = await createAuthenticatedAgent();
        const second = await createAuthenticatedAgent({ email: "outro@email.com" });

        vi.useFakeTimers({ toFake: ["Date"] });

        try {
            for (let attempt = 0; attempt < 100; attempt++) {
                const response =
                    attempt % 2 === 0
                        ? await refreshUserWithoutToken()
                        : await refreshUser(first.agent);

                assert.equal(response.status, attempt % 2 === 0 ? 401 : 204);
            }

            const blocked = await refreshUser(first.agent);
            const blockedOtherAccount = await refreshUser(second.agent);
            const blockedWithoutToken = await refreshUserWithoutToken();

            for (const response of [blocked, blockedOtherAccount, blockedWithoutToken]) {
                assert.equal(response.status, 429);
                assert.equal(
                    response.body.message,
                    "Muitas solicitações de renovação de sessão. Aguarde alguns minutos e tente novamente.",
                );
                assert.equal(Number(response.headers["retry-after"]), 300);
                assert.notExists(response.headers["set-cookie"]);
            }

            vi.setSystemTime(Date.now() + 60 * 1000);

            const stillBlocked = await refreshUser(first.agent);

            assert.equal(stillBlocked.status, 429);
            assert.equal(Number(stillBlocked.headers["retry-after"]), 240);

            vi.setSystemTime(Date.now() + 4 * 60 * 1000 + 1);

            const renewed = await refreshUser(first.agent);
            const otherRenewed = await refreshUser(second.agent);

            assert.equal(renewed.status, 204);
            assert.equal(otherRenewed.status, 204);
        } finally {
            vi.useRealTimers();
        }
    });

    test("deve limitar chamadas de alteração por IP antes da autenticação", async () => {
        for (let attempt = 0; attempt < 30; attempt++) {
            assert.equal((await request(app).patch("/auth/me/password").send({})).status, 401);
        }

        const response = await request(app).patch("/auth/me/password").send({});

        assert.equal(response.status, 429);
        assert.exists(response.headers["retry-after"]);
    });
});
