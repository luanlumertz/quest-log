import { assert, describe, test } from "vitest";

import type { GameStatus } from "../../../src/generated/prisma/client.js";
import { findLibraryEntryByUserAndGameId } from "../../../src/repositories/library.repository.js";
import { createPlatform } from "../../../src/repositories/platform.repository.js";

import type { UpdatedLibraryEntryResponse } from "../../types/library.types.js";
import { findGamePlatformsByGameId } from "../../helpers/database/game.helper.js";
import { findLibraryEntryPlatformsByUserIdAndGameId } from "../../helpers/database/library.helper.js";
import { createAuthenticatedAgent, createRegisteredUser } from "../../fixtures/auth.fixture.js";
import { createLibraryDataForUser } from "../../fixtures/library.fixture.js";
import {
    updateLibraryEntry,
    updateLibraryEntryWithoutCookies,
} from "../../requests/library/update.request.js";

describe("PATCH /library/:gameId", () => {
    test.each(["WANT_TO_PLAY", "PLAYING", "PAUSED", "COMPLETED", "ABANDONED"] as const)(
        "deve preservar os demais campos ao mudar o status para %s",
        async (status) => {
            const { agent, user } = await createAuthenticatedAgent();

            const startedAt = new Date("2026-01-10T12:00:00.000Z");
            const completedAt = new Date("2026-02-10T12:00:00.000Z");

            const { game, selectedPlatforms } = await createLibraryDataForUser(user.id, {
                selectedPlatforms: ["PC", "PlayStation 5"],
                libraryEntry: {
                    status: status === "PLAYING" || status === "COMPLETED" ? "PAUSED" : "COMPLETED",
                    rating: 4.5,
                    playtimeMinutes: 95,
                    startedAt,
                    completedAt,
                },
            });

            const response = await updateLibraryEntry(agent, game.id, { status });

            assert.equal(response.status, 200);

            const { updatedLibraryEntry } = response.body as UpdatedLibraryEntryResponse;

            assert.equal(updatedLibraryEntry.status, status);
            assert.equal(updatedLibraryEntry.rating, 4.5);
            assert.equal(updatedLibraryEntry.playtimeMinutes, 95);
            assert.equal(updatedLibraryEntry.startedAt, startedAt.toISOString());
            assert.equal(updatedLibraryEntry.completedAt, completedAt.toISOString());
            assert.sameDeepMembers(updatedLibraryEntry.platforms, selectedPlatforms);

            const persistedEntry = await findLibraryEntryByUserAndGameId(user.id, game.id);

            assert.ok(persistedEntry);
            assert.equal(persistedEntry.status, status);
            assert.equal(persistedEntry.rating?.toNumber(), 4.5);
            assert.equal(persistedEntry.playtimeMinutes, 95);
            assert.equal(persistedEntry.startedAt?.toISOString(), startedAt.toISOString());
            assert.equal(persistedEntry.completedAt?.toISOString(), completedAt.toISOString());

            const persistedPlatforms = await findLibraryEntryPlatformsByUserIdAndGameId(
                user.id,
                game.id,
            );

            assert.sameMembers(
                persistedPlatforms.map((platform) => platform.platformId),
                selectedPlatforms.map((platform) => platform.id),
            );
        },
    );

    test.each(["WANT_TO_PLAY", "PLAYING", "PAUSED", "COMPLETED", "ABANDONED"] as const)(
        "não deve preencher datas nem plataformas ao mudar o status para %s",
        async (status) => {
            const { agent, user } = await createAuthenticatedAgent();

            const { game } = await createLibraryDataForUser(user.id, {
                selectedPlatforms: [],
                libraryEntry: {
                    status: status === "COMPLETED" ? "PLAYING" : "COMPLETED",
                },
            });

            const response = await updateLibraryEntry(agent, game.id, { status });

            assert.equal(response.status, 200);

            const { updatedLibraryEntry } = response.body as UpdatedLibraryEntryResponse;

            assert.equal(updatedLibraryEntry.status, status);
            assert.isNull(updatedLibraryEntry.startedAt);
            assert.isNull(updatedLibraryEntry.completedAt);
            assert.isEmpty(updatedLibraryEntry.platforms);

            const persistedEntry = await findLibraryEntryByUserAndGameId(user.id, game.id);

            assert.ok(persistedEntry);
            assert.equal(persistedEntry.status, status);
            assert.isNull(persistedEntry.startedAt);
            assert.isNull(persistedEntry.completedAt);
        },
    );

    test.each(["WANT_TO_PLAY", "PLAYING", "PAUSED", "COMPLETED", "ABANDONED"] as const)(
        "deve aceitar avaliação e ambas as datas no status %s",
        async (status) => {
            const { agent, user } = await createAuthenticatedAgent();

            const { game } = await createLibraryDataForUser(user.id, {
                libraryEntry: { status },
            });

            const response = await updateLibraryEntry(agent, game.id, {
                rating: 4.5,
                startedAt: "2026-01-10T12:00:00.000Z",
                completedAt: "2026-02-10T18:30:00.000Z",
            });

            assert.equal(response.status, 200);

            const { updatedLibraryEntry } = response.body as UpdatedLibraryEntryResponse;

            assert.equal(updatedLibraryEntry.status, status);
            assert.equal(updatedLibraryEntry.rating, 4.5);
            assert.equal(updatedLibraryEntry.startedAt, "2026-01-10T00:00:00.000Z");
            assert.equal(updatedLibraryEntry.completedAt, "2026-02-10T00:00:00.000Z");

            const persistedEntry = await findLibraryEntryByUserAndGameId(user.id, game.id);

            assert.ok(persistedEntry);
            assert.equal(persistedEntry.status, status);
            assert.equal(persistedEntry.rating?.toNumber(), 4.5);
            assert.equal(persistedEntry.startedAt?.toISOString(), updatedLibraryEntry.startedAt);
            assert.equal(
                persistedEntry.completedAt?.toISOString(),
                updatedLibraryEntry.completedAt,
            );
        },
    );

    test.each(["startedAt", "completedAt"] as const)(
        "deve limpar somente %s quando informado como null",
        async (field) => {
            const { agent, user } = await createAuthenticatedAgent();

            const startedAt = new Date("2026-01-10T12:00:00.000Z");
            const completedAt = new Date("2026-02-10T12:00:00.000Z");

            const { game, selectedPlatforms } = await createLibraryDataForUser(user.id, {
                libraryEntry: {
                    status: "COMPLETED",
                    rating: 4.5,
                    playtimeMinutes: 95,
                    startedAt,
                    completedAt,
                },
            });

            const response = await updateLibraryEntry(agent, game.id, { [field]: null });

            assert.equal(response.status, 200);

            const { updatedLibraryEntry } = response.body as UpdatedLibraryEntryResponse;

            assert.isNull(updatedLibraryEntry[field]);
            assert.equal(updatedLibraryEntry.status, "COMPLETED");
            assert.equal(updatedLibraryEntry.rating, 4.5);
            assert.equal(updatedLibraryEntry.playtimeMinutes, 95);
            assert.sameDeepMembers(updatedLibraryEntry.platforms, selectedPlatforms);

            const otherField = field === "startedAt" ? "completedAt" : "startedAt";
            const otherDate = field === "startedAt" ? completedAt : startedAt;

            assert.equal(updatedLibraryEntry[otherField], otherDate.toISOString());

            const persistedEntry = await findLibraryEntryByUserAndGameId(user.id, game.id);

            assert.ok(persistedEntry);
            assert.isNull(persistedEntry[field]);
            assert.equal(persistedEntry[otherField]?.toISOString(), otherDate.toISOString());
        },
    );

    test("deve aceitar conclusão sem uma data de início", async () => {
        const { agent, user } = await createAuthenticatedAgent();

        const { game } = await createLibraryDataForUser(user.id, {
            libraryEntry: { status: "COMPLETED" },
        });

        const response = await updateLibraryEntry(agent, game.id, {
            completedAt: "2026-02-10T12:00:00.000Z",
        });

        assert.equal(response.status, 200);

        const { updatedLibraryEntry } = response.body as UpdatedLibraryEntryResponse;

        assert.isNull(updatedLibraryEntry.startedAt);
        assert.equal(updatedLibraryEntry.completedAt, "2026-02-10T00:00:00.000Z");

        const persistedEntry = await findLibraryEntryByUserAndGameId(user.id, game.id);

        assert.ok(persistedEntry);
        assert.isNull(persistedEntry.startedAt);
        assert.equal(persistedEntry.completedAt?.toISOString(), updatedLibraryEntry.completedAt);
    });

    test("deve remover as plataformas selecionadas sem alterar os demais dados ou o catálogo", async () => {
        const { agent, user } = await createAuthenticatedAgent();

        const startedAt = new Date("2026-01-10T12:00:00.000Z");
        const completedAt = new Date("2026-02-10T12:00:00.000Z");

        const { game, selectedPlatforms, unselectedPlatforms } = await createLibraryDataForUser(
            user.id,
            {
                selectedPlatforms: ["PC"],
                unselectedPlatforms: ["PlayStation 5"],
                libraryEntry: {
                    status: "COMPLETED",
                    rating: 4.5,
                    playtimeMinutes: 95,
                    startedAt,
                    completedAt,
                },
            },
        );

        const response = await updateLibraryEntry(agent, game.id, { platforms: [] });

        assert.equal(response.status, 200);

        const { updatedLibraryEntry } = response.body as UpdatedLibraryEntryResponse;

        assert.isEmpty(updatedLibraryEntry.platforms);
        assert.equal(updatedLibraryEntry.status, "COMPLETED");
        assert.equal(updatedLibraryEntry.rating, 4.5);
        assert.equal(updatedLibraryEntry.playtimeMinutes, 95);
        assert.equal(updatedLibraryEntry.startedAt, startedAt.toISOString());
        assert.equal(updatedLibraryEntry.completedAt, completedAt.toISOString());

        const persistedPlatforms = await findLibraryEntryPlatformsByUserIdAndGameId(
            user.id,
            game.id,
        );
        const gamePlatforms = await findGamePlatformsByGameId(game.id);

        assert.isEmpty(persistedPlatforms);
        assert.sameMembers(
            gamePlatforms.map((platform) => platform.platformId),
            [...selectedPlatforms, ...unselectedPlatforms].map((platform) => platform.id),
        );
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
