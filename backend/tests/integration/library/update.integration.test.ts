import { assert, describe, test } from "vitest";

import type { GameStatus } from "@prisma/client";
import { findLibraryEntryByUserAndGameId } from "../../../src/repositories/library.repository.js";
import { createPlatform } from "../../../src/repositories/platform.repository.js";

import type { UpdatedLibraryEntryResponse } from "../../types/library.types.js";
import { createAuthenticatedAgent, createRegisteredUser } from "../../fixtures/auth.fixture.js";
import {
    createLibraryDataForUser,
    findLibraryEntryPlatformsByUserIdAndGameId,
} from "../../fixtures/library.fixture.js";
import { findGamePlatformsByGameId } from "../../fixtures/game.fixture.js";
import {
    updateLibraryEntry,
    updateLibraryEntryWithoutCookies,
} from "../../requests/library/update.request.js";

describe("PATCH /library/:gameId", () => {
    test("deve atualizar o status de um jogo da biblioteca do usuário", async () => {
        const { agent, user } = await createAuthenticatedAgent();

        const updatedStatus: GameStatus = "PLAYING";

        const { game } = await createLibraryDataForUser(user.id);

        const response = await updateLibraryEntry(agent, game.id, { status: updatedStatus });

        assert.equal(response.status, 200);

        const { updatedLibraryEntry } = response.body as UpdatedLibraryEntryResponse;

        assert.ok(updatedLibraryEntry);
        assert.equal(updatedLibraryEntry.status, updatedStatus);
        assert.ok(updatedLibraryEntry.startedAt);
        assert.isNull(updatedLibraryEntry.completedAt);

        const persistedEntry = await findLibraryEntryByUserAndGameId(user.id, game.id);

        assert.ok(persistedEntry);
        assert.equal(persistedEntry.status, updatedStatus);
        assert.ok(persistedEntry.startedAt);
        assert.isNull(persistedEntry.completedAt);
        assert.equal(persistedEntry.startedAt.toISOString(), updatedLibraryEntry.startedAt);
    });

    test("deve preencher completedAt ao atualizar status para COMPLETED", async () => {
        const { agent, user } = await createAuthenticatedAgent();

        const updatedStatus: GameStatus = "COMPLETED";
        const startedAt = new Date("2026-01-10T12:00:00.000Z");

        const { game } = await createLibraryDataForUser(user.id, {
            libraryEntry: {
                status: "PLAYING",
                startedAt,
                completedAt: null,
            },
        });

        const response = await updateLibraryEntry(agent, game.id, { status: updatedStatus });

        assert.equal(response.status, 200);

        const { updatedLibraryEntry } = response.body as UpdatedLibraryEntryResponse;

        assert.ok(updatedLibraryEntry);
        assert.equal(updatedLibraryEntry.status, updatedStatus);
        assert.equal(updatedLibraryEntry.startedAt, startedAt.toISOString());
        assert.exists(updatedLibraryEntry.completedAt);

        const persistedEntry = await findLibraryEntryByUserAndGameId(user.id, game.id);

        assert.ok(persistedEntry);
        assert.equal(persistedEntry.status, updatedStatus);
        assert.ok(persistedEntry.startedAt);
        assert.equal(persistedEntry.startedAt.toISOString(), startedAt.toISOString());
        assert.ok(persistedEntry.completedAt);
        assert.equal(persistedEntry.completedAt.toISOString(), updatedLibraryEntry.completedAt);
    });

    test("deve limpar completedAt ao atualizar status de COMPLETED para PLAYING", async () => {
        const { agent, user } = await createAuthenticatedAgent();

        const updatedStatus: GameStatus = "PLAYING";
        const startedAt = new Date("2026-01-10T12:00:00.000Z");
        const completedAt = new Date("2026-02-10T12:00:00.000Z");

        const { game } = await createLibraryDataForUser(user.id, {
            libraryEntry: {
                status: "COMPLETED",
                startedAt,
                completedAt,
            },
        });

        const response = await updateLibraryEntry(agent, game.id, { status: updatedStatus });

        assert.equal(response.status, 200);

        const { updatedLibraryEntry } = response.body as UpdatedLibraryEntryResponse;

        assert.ok(updatedLibraryEntry);
        assert.equal(updatedLibraryEntry.status, updatedStatus);
        assert.equal(updatedLibraryEntry.startedAt, startedAt.toISOString());
        assert.isNull(updatedLibraryEntry.completedAt);

        const persistedEntry = await findLibraryEntryByUserAndGameId(user.id, game.id);

        assert.ok(persistedEntry);
        assert.equal(persistedEntry.status, updatedStatus);
        assert.ok(persistedEntry.startedAt);
        assert.equal(persistedEntry.startedAt.toISOString(), startedAt.toISOString());
        assert.isNull(persistedEntry.completedAt);
    });

    test("deve limpar rating e datas ao atualizar status para WANT_TO_PLAY sem apagar o tempo jogado", async () => {
        const { agent, user } = await createAuthenticatedAgent();

        const updatedStatus: GameStatus = "WANT_TO_PLAY";
        const initialPlaytimeMinutes = 1200;
        const startedAt = new Date("2026-01-10T12:00:00.000Z");
        const completedAt = new Date("2026-02-10T12:00:00.000Z");

        const { game } = await createLibraryDataForUser(user.id, {
            libraryEntry: {
                status: "COMPLETED",
                rating: 4.5,
                playtimeMinutes: initialPlaytimeMinutes,
                startedAt,
                completedAt,
            },
        });

        const response = await updateLibraryEntry(agent, game.id, { status: updatedStatus });

        assert.equal(response.status, 200);

        const { updatedLibraryEntry } = response.body as UpdatedLibraryEntryResponse;

        assert.ok(updatedLibraryEntry);
        assert.equal(updatedLibraryEntry.status, updatedStatus);
        assert.isNull(updatedLibraryEntry.rating);
        assert.isNull(updatedLibraryEntry.startedAt);
        assert.isNull(updatedLibraryEntry.completedAt);
        assert.equal(updatedLibraryEntry.playtimeMinutes, initialPlaytimeMinutes);

        const persistedEntry = await findLibraryEntryByUserAndGameId(user.id, game.id);

        assert.ok(persistedEntry);
        assert.equal(persistedEntry.status, updatedStatus);
        assert.isNull(persistedEntry.rating);
        assert.isNull(persistedEntry.startedAt);
        assert.isNull(persistedEntry.completedAt);
        assert.equal(persistedEntry.playtimeMinutes, initialPlaytimeMinutes);
    });

    test("deve limpar completedAt e preservar startedAt ao atualizar status para ABANDONED", async () => {
        const { agent, user } = await createAuthenticatedAgent();

        const updatedStatus: GameStatus = "ABANDONED";
        const initialRating = 4.5;
        const startedAt = new Date("2026-01-10T12:00:00.000Z");
        const completedAt = new Date("2026-02-10T12:00:00.000Z");

        const { game } = await createLibraryDataForUser(user.id, {
            libraryEntry: {
                status: "COMPLETED",
                rating: initialRating,
                startedAt,
                completedAt,
            },
        });

        const response = await updateLibraryEntry(agent, game.id, { status: updatedStatus });

        assert.equal(response.status, 200);

        const { updatedLibraryEntry } = response.body as UpdatedLibraryEntryResponse;

        assert.ok(updatedLibraryEntry);
        assert.equal(updatedLibraryEntry.status, updatedStatus);
        assert.equal(updatedLibraryEntry.rating, initialRating);
        assert.equal(updatedLibraryEntry.startedAt, startedAt.toISOString());
        assert.isNull(updatedLibraryEntry.completedAt);

        const persistedEntry = await findLibraryEntryByUserAndGameId(user.id, game.id);

        assert.ok(persistedEntry);
        assert.equal(persistedEntry.status, updatedStatus);
        assert.isNotNull(persistedEntry.rating);
        assert.equal(persistedEntry.rating.toNumber(), initialRating);
        assert.ok(persistedEntry.startedAt);
        assert.equal(persistedEntry.startedAt.toISOString(), startedAt.toISOString());
        assert.isNull(persistedEntry.completedAt);
    });

    test("deve atualizar a avaliação de um jogo com status PLAYING", async () => {
        const { agent, user } = await createAuthenticatedAgent();

        const updatedRating = 4.5;
        const initialStatus: GameStatus = "PLAYING";

        const { game } = await createLibraryDataForUser(user.id, {
            libraryEntry: {
                status: initialStatus,
                rating: null,
            },
        });

        const response = await updateLibraryEntry(agent, game.id, { rating: updatedRating });

        assert.equal(response.status, 200);

        const { updatedLibraryEntry } = response.body as UpdatedLibraryEntryResponse;

        assert.ok(updatedLibraryEntry);
        assert.equal(updatedLibraryEntry.rating, updatedRating);
        assert.equal(updatedLibraryEntry.status, initialStatus);

        const persistedEntry = await findLibraryEntryByUserAndGameId(user.id, game.id);

        assert.ok(persistedEntry);
        assert.isNotNull(persistedEntry.rating);
        assert.equal(persistedEntry.rating.toNumber(), updatedRating);
        assert.equal(persistedEntry.status, initialStatus);
    });

    test("deve remover a avaliação ao atualizar rating para null", async () => {
        const { agent, user } = await createAuthenticatedAgent();

        const initialRating = 4.5;
        const initialStatus: GameStatus = "PLAYING";

        const { game } = await createLibraryDataForUser(user.id, {
            libraryEntry: {
                status: initialStatus,
                rating: initialRating,
            },
        });

        const response = await updateLibraryEntry(agent, game.id, { rating: null });

        assert.equal(response.status, 200);

        const { updatedLibraryEntry } = response.body as UpdatedLibraryEntryResponse;

        assert.ok(updatedLibraryEntry);
        assert.isNull(updatedLibraryEntry.rating);
        assert.equal(updatedLibraryEntry.status, initialStatus);

        const persistedEntry = await findLibraryEntryByUserAndGameId(user.id, game.id);

        assert.ok(persistedEntry);
        assert.isNull(persistedEntry.rating);
        assert.equal(persistedEntry.status, initialStatus);
    });

    test("deve atualizar o tempo jogado sem alterar o status", async () => {
        const { agent, user } = await createAuthenticatedAgent();

        const updatedPlaytimeMinutes = 450;
        const initialStatus: GameStatus = "PLAYING";

        const { game } = await createLibraryDataForUser(user.id, {
            libraryEntry: {
                status: initialStatus,
                playtimeMinutes: 120,
            },
        });

        const response = await updateLibraryEntry(agent, game.id, {
            playtimeMinutes: updatedPlaytimeMinutes,
        });

        assert.equal(response.status, 200);

        const { updatedLibraryEntry } = response.body as UpdatedLibraryEntryResponse;

        assert.ok(updatedLibraryEntry);
        assert.equal(updatedLibraryEntry.playtimeMinutes, updatedPlaytimeMinutes);
        assert.equal(updatedLibraryEntry.status, initialStatus);

        const persistedEntry = await findLibraryEntryByUserAndGameId(user.id, game.id);

        assert.ok(persistedEntry);
        assert.equal(persistedEntry.playtimeMinutes, updatedPlaytimeMinutes);
        assert.equal(persistedEntry.status, initialStatus);
    });

    test("deve atualizar manualmente a data de início e normalizá-la para UTC", async () => {
        const { agent, user } = await createAuthenticatedAgent();

        const initialStartedAt = "2026-02-15T12:00:00.000Z";
        const expectedStartedAt = "2026-02-15T00:00:00.000Z";
        const initialStatus: GameStatus = "PLAYING";

        const { game } = await createLibraryDataForUser(user.id, {
            libraryEntry: {
                status: initialStatus,
                startedAt: new Date("2026-01-10T12:00:00.000Z"),
            },
        });

        const response = await updateLibraryEntry(agent, game.id, { startedAt: initialStartedAt });

        assert.equal(response.status, 200);

        const { updatedLibraryEntry } = response.body as UpdatedLibraryEntryResponse;

        assert.ok(updatedLibraryEntry);
        assert.equal(updatedLibraryEntry.startedAt, expectedStartedAt);
        assert.equal(updatedLibraryEntry.status, initialStatus);

        const persistedEntry = await findLibraryEntryByUserAndGameId(user.id, game.id);

        assert.ok(persistedEntry);
        assert.ok(persistedEntry.startedAt);
        assert.equal(persistedEntry.startedAt.toISOString(), expectedStartedAt);
        assert.equal(persistedEntry.status, initialStatus);
    });

    test("deve atualizar manualmente a data de conclusão e normalizá-la para UTC", async () => {
        const { agent, user } = await createAuthenticatedAgent();

        const initialCompletedAt = "2026-03-20T18:45:00.000Z";
        const expectedCompletedAt = "2026-03-20T00:00:00.000Z";
        const initialStatus: GameStatus = "COMPLETED";
        const initialStartedAt = "2026-01-10T12:00:00.000Z";

        const { game } = await createLibraryDataForUser(user.id, {
            libraryEntry: {
                status: initialStatus,
                startedAt: new Date("2026-01-10T12:00:00.000Z"),
                completedAt: new Date("2026-02-10T12:00:00.000Z"),
            },
        });

        const response = await updateLibraryEntry(agent, game.id, {
            completedAt: initialCompletedAt,
        });

        assert.equal(response.status, 200);

        const { updatedLibraryEntry } = response.body as UpdatedLibraryEntryResponse;

        assert.ok(updatedLibraryEntry);
        assert.equal(updatedLibraryEntry.completedAt, expectedCompletedAt);
        assert.equal(updatedLibraryEntry.startedAt, initialStartedAt);
        assert.equal(updatedLibraryEntry.status, initialStatus);

        const persistedEntry = await findLibraryEntryByUserAndGameId(user.id, game.id);

        assert.ok(persistedEntry);
        assert.ok(persistedEntry.completedAt);
        assert.equal(persistedEntry.completedAt.toISOString(), expectedCompletedAt);
        assert.ok(persistedEntry.startedAt);
        assert.equal(persistedEntry.startedAt.toISOString(), initialStartedAt);
        assert.equal(persistedEntry.status, initialStatus);
    });

    test("não deve aceitar data de início no futuro", async () => {
        const { agent, user } = await createAuthenticatedAgent();

        const initialStartedAt = new Date("2026-01-10T12:00:00.000Z");
        const initialStatus: GameStatus = "PLAYING";
        const futureStartedAt = new Date();
        futureStartedAt.setDate(futureStartedAt.getDate() + 1);

        const { game } = await createLibraryDataForUser(user.id, {
            libraryEntry: {
                status: initialStatus,
                startedAt: initialStartedAt,
            },
        });

        const response = await updateLibraryEntry(agent, game.id, {
            startedAt: futureStartedAt.toISOString(),
        });

        assert.equal(response.status, 400);
        assert.equal(response.body.message, "A data de início não pode estar no futuro");

        const persistedEntry = await findLibraryEntryByUserAndGameId(user.id, game.id);

        assert.ok(persistedEntry);
        assert.ok(persistedEntry.startedAt);
        assert.equal(persistedEntry.startedAt.toISOString(), initialStartedAt.toISOString());
        assert.equal(persistedEntry.status, initialStatus);
    });

    test("não deve aceitar data de conclusão no futuro", async () => {
        const { agent, user } = await createAuthenticatedAgent();

        const initialStartedAt = new Date("2026-01-10T12:00:00.000Z");
        const initialCompletedAt = new Date("2026-02-10T12:00:00.000Z");
        const initialStatus: GameStatus = "COMPLETED";
        const futureCompletedAt = new Date();
        futureCompletedAt.setDate(futureCompletedAt.getDate() + 1);

        const { game } = await createLibraryDataForUser(user.id, {
            libraryEntry: {
                status: initialStatus,
                startedAt: initialStartedAt,
                completedAt: initialCompletedAt,
            },
        });

        const response = await updateLibraryEntry(agent, game.id, {
            completedAt: futureCompletedAt.toISOString(),
        });

        assert.equal(response.status, 400);
        assert.equal(response.body.message, "A data de conclusão não pode estar no futuro");

        const persistedEntry = await findLibraryEntryByUserAndGameId(user.id, game.id);

        assert.ok(persistedEntry);
        assert.ok(persistedEntry.completedAt);
        assert.equal(persistedEntry.completedAt.toISOString(), initialCompletedAt.toISOString());
        assert.ok(persistedEntry.startedAt);
        assert.equal(persistedEntry.startedAt.toISOString(), initialStartedAt.toISOString());
        assert.equal(persistedEntry.status, initialStatus);
    });

    test("não deve aceitar data de conclusão anterior à data de início", async () => {
        const { agent, user } = await createAuthenticatedAgent();

        const initialStartedAt = new Date("2026-01-10T12:00:00.000Z");
        const initialCompletedAt = new Date("2026-02-10T12:00:00.000Z");
        const initialStatus: GameStatus = "COMPLETED";
        const invalidCompletedAt = new Date("2025-12-31T12:00:00.000Z");

        const { game } = await createLibraryDataForUser(user.id, {
            libraryEntry: {
                status: initialStatus,
                startedAt: initialStartedAt,
                completedAt: initialCompletedAt,
            },
        });

        const response = await updateLibraryEntry(agent, game.id, {
            completedAt: invalidCompletedAt.toISOString(),
        });

        assert.equal(response.status, 400);
        assert.equal(
            response.body.message,
            "A data de conclusão não pode ser anterior à data de início",
        );

        const persistedEntry = await findLibraryEntryByUserAndGameId(user.id, game.id);

        assert.ok(persistedEntry);
        assert.ok(persistedEntry.completedAt);
        assert.equal(persistedEntry.completedAt.toISOString(), initialCompletedAt.toISOString());
        assert.ok(persistedEntry.startedAt);
        assert.equal(persistedEntry.startedAt.toISOString(), initialStartedAt.toISOString());
        assert.equal(persistedEntry.status, initialStatus);
    });

    test("deve substituir as plataformas selecionadas por outras plataformas disponíveis", async () => {
        const { agent, user } = await createAuthenticatedAgent();

        const { game, selectedPlatforms, unselectedPlatforms } = await createLibraryDataForUser(
            user.id,
            {
                selectedPlatforms: ["PC"],
                unselectedPlatforms: ["PlayStation 5", "Xbox Series X/S"],
            },
        );

        const pc = selectedPlatforms[0];
        const playStation = unselectedPlatforms[0];
        const xbox = unselectedPlatforms[1];

        assert.ok(pc);
        assert.ok(playStation);
        assert.ok(xbox);

        const expectedPlatformIds = [playStation.id, xbox.id];

        const response = await updateLibraryEntry(agent, game.id, {
            platforms: expectedPlatformIds,
        });

        assert.equal(response.status, 200);

        const { updatedLibraryEntry } = response.body as UpdatedLibraryEntryResponse;

        assert.ok(updatedLibraryEntry);
        assert.sameMembers(
            updatedLibraryEntry.platforms.map((p) => p.id),
            expectedPlatformIds,
        );

        const persistedLibraryPlatforms = await findLibraryEntryPlatformsByUserIdAndGameId(
            user.id,
            game.id,
        );
        const persistedGamePlatforms = await findGamePlatformsByGameId(game.id);

        assert.sameMembers(
            persistedLibraryPlatforms.map((p) => p.platformId),
            expectedPlatformIds,
        );
        assert.sameMembers(
            persistedGamePlatforms.map((p) => p.platformId),
            [pc.id, ...expectedPlatformIds],
        );
    });

    test("não deve atualizar para uma plataforma que não está disponível para o jogo", async () => {
        const { agent, user } = await createAuthenticatedAgent();

        const { game, selectedPlatforms, unselectedPlatforms } = await createLibraryDataForUser(
            user.id,
            {
                selectedPlatforms: ["PC"],
                unselectedPlatforms: ["PlayStation 5"],
            },
        );

        const pc = selectedPlatforms[0];
        const playStation = unselectedPlatforms[0];

        assert.ok(pc);
        assert.ok(playStation);

        const xbox = await createPlatform("Xbox");

        const response = await updateLibraryEntry(agent, game.id, { platforms: [xbox.id] });

        assert.equal(response.status, 400);
        assert.equal(
            response.body.message,
            "Uma ou mais plataformas informadas não são suportadas por este jogo",
        );

        const persistedLibraryPlatforms = await findLibraryEntryPlatformsByUserIdAndGameId(
            user.id,
            game.id,
        );

        const persistedGamePlatforms = await findGamePlatformsByGameId(game.id);

        assert.sameMembers(
            persistedLibraryPlatforms.map((p) => p.platformId),
            [pc.id],
        );
        assert.sameMembers(
            persistedGamePlatforms.map((p) => p.platformId),
            [pc.id, playStation.id],
        );
    });

    test("não deve atualizar jogo que pertence à biblioteca de outro usuário", async () => {
        const { agent: agentA } = await createAuthenticatedAgent();
        const { user: userB } = await createRegisteredUser({ email: "userB@email.com" });

        const { game, libraryEntry } = await createLibraryDataForUser(userB.id);

        const response = await updateLibraryEntry(agentA, game.id, { status: "PLAYING" });

        assert.equal(response.status, 404);
        assert.equal(response.body.message, "Jogo não encontrado na biblioteca do usuário");

        const persistedEntry = await findLibraryEntryByUserAndGameId(userB.id, game.id);

        assert.ok(persistedEntry);
        assert.equal(persistedEntry.status, libraryEntry.status);
        assert.deepEqual(persistedEntry.startedAt, libraryEntry.startedAt);
        assert.deepEqual(persistedEntry.completedAt, libraryEntry.completedAt);
    });

    test("não deve atualizar jogo com gameId inválido", async () => {
        const { agent } = await createAuthenticatedAgent();

        const response = await updateLibraryEntry(agent, 0, { status: "PLAYING" });

        assert.equal(response.status, 422);
        assert.equal(response.body.error, "Erro de Validação");
    });

    test("não deve atualizar jogo com payload inválido", async () => {
        const { agent, user } = await createAuthenticatedAgent();

        const { game, libraryEntry } = await createLibraryDataForUser(user.id);

        const response = await updateLibraryEntry(agent, game.id, { playtimeMinutes: -10 });

        assert.equal(response.status, 422);
        assert.equal(response.body.error, "Erro de Validação");

        const persistedEntry = await findLibraryEntryByUserAndGameId(user.id, game.id);

        assert.ok(persistedEntry);
        assert.equal(persistedEntry.playtimeMinutes, libraryEntry.playtimeMinutes);
    });

    test("não deve atualizar jogo sem access token", async () => {
        const { user } = await createRegisteredUser();

        const { game } = await createLibraryDataForUser(user.id);

        const response = await updateLibraryEntryWithoutCookies(game.id, { status: "PLAYING" });

        assert.equal(response.status, 401);
        assert.equal(response.body.message, "Não autenticado");
        assert.notExists(response.headers["set-cookie"]);
    });
});
