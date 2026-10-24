import { assert, describe, test } from "vitest";

import { AppError } from "../../../src/errors/AppError.js";
import { findGameByExternalId } from "../../../src/repositories/game.repository.js";
import { findPlatformByName } from "../../../src/repositories/platform.repository.js";
import { findLibraryEntryByUserAndGameId } from "../../../src/repositories/library.repository.js";

import {
    countLibraryEntries,
    countLibraryEntriesByUserIdAndGameId,
    countLibraryEntryPlatformsByUserIdAndGameId,
    countLibraryEntryPlatformsByUserIdGameIdPlatformId,
    findLibraryEntryPlatformByUserIdGameIdAndPlatformId,
} from "../../helpers/database/library.helper.js";
import {
    countGamePlatformsByGameId,
    countGamePlatformsByGameIdAndPlatformId,
    countGamesByExternalId,
    countPlatformsByName,
    findGamePlatformByGameIdAndPlatformId,
} from "../../helpers/database/game.helper.js";
import { createAuthenticatedAgent } from "../../fixtures/auth.fixture.js";
import { mockRawgGameDetails, mockRawgGameDetailsError } from "../../fixtures/rawg.fixture.js";
import { createLibraryPayload } from "../../factories/library.factory.js";
import {
    addGameToLibrary,
    addGameToLibraryWithoutCookies,
} from "../../requests/library/create.request.js";

describe("POST /library", () => {
    test.each(["WANT_TO_PLAY", "PLAYING", "PAUSED", "COMPLETED", "ABANDONED"] as const)(
        "deve adicionar um jogo como %s sem exigir plataformas nem preencher datas",
        async (status) => {
            const { agent, user } = await createAuthenticatedAgent();

            mockRawgGameDetails({ platforms: [] });

            const response = await addGameToLibrary(agent, { externalId: 123, status });

            assert.equal(response.status, 201);

            const { libraryEntry } = response.body;

            assert.equal(libraryEntry.status, status);
            assert.isEmpty(libraryEntry.platforms);
            assert.isNull(libraryEntry.startedAt);
            assert.isNull(libraryEntry.completedAt);
            assert.isNull(libraryEntry.rating);
            assert.equal(libraryEntry.playtimeMinutes, 0);

            const game = await findGameByExternalId(123);

            assert.ok(game);

            const persistedEntry = await findLibraryEntryByUserAndGameId(user.id, game.id);
            const selectedPlatformsCount = await countLibraryEntryPlatformsByUserIdAndGameId(
                user.id,
                game.id,
            );
            const availablePlatformsCount = await countGamePlatformsByGameId(game.id);

            assert.ok(persistedEntry);
            assert.equal(persistedEntry.status, status);
            assert.isNull(persistedEntry.startedAt);
            assert.isNull(persistedEntry.completedAt);
            assert.equal(selectedPlatformsCount, 0);
            assert.equal(availablePlatformsCount, 0);
        },
    );

    test("deve aceitar plataformas vazias mesmo quando o jogo possui plataformas disponíveis", async () => {
        const { agent, user } = await createAuthenticatedAgent();

        mockRawgGameDetails({ platforms: ["PC"] });

        const response = await addGameToLibrary(agent, { externalId: 123, platforms: [] });

        assert.equal(response.status, 201);
        assert.equal(response.body.libraryEntry.status, "WANT_TO_PLAY");
        assert.isEmpty(response.body.libraryEntry.platforms);

        const game = await findGameByExternalId(123);

        assert.ok(game);

        const selectedPlatformsCount = await countLibraryEntryPlatformsByUserIdAndGameId(
            user.id,
            game.id,
        );
        const availablePlatformsCount = await countGamePlatformsByGameId(game.id);

        assert.equal(selectedPlatformsCount, 0);
        assert.equal(availablePlatformsCount, 1);
    });

    test("deve adicionar um jogo como WANT_TO_PLAY à biblioteca do usuário", async () => {
        const { agent, user } = await createAuthenticatedAgent();

        const mockedDetails = mockRawgGameDetails();

        const payload = createLibraryPayload();

        const response = await addGameToLibrary(agent, payload);

        assert.equal(response.status, 201);

        const libraryEntryResponse = response.body.libraryEntry;

        assert.ok(libraryEntryResponse);

        assert.equal(libraryEntryResponse.userId, user.id);
        assert.equal(libraryEntryResponse.status, "WANT_TO_PLAY");
        assert.deepEqual(libraryEntryResponse.platforms, ["PC"]);

        assert.equal(libraryEntryResponse.rating, null);
        assert.equal(libraryEntryResponse.playtimeMinutes, 0);
        assert.equal(libraryEntryResponse.startedAt, null);
        assert.equal(libraryEntryResponse.completedAt, null);

        assert.equal(mockedDetails.mock.calls.length, 1);
        assert.equal(mockedDetails.mock.calls[0]?.[0], payload.externalId);

        const game = await findGameByExternalId(payload.externalId);

        assert.ok(game);

        assert.equal(libraryEntryResponse.gameId, game.id);
        assert.equal(game.externalId, payload.externalId);

        const platform = await findPlatformByName("PC");

        assert.ok(platform);

        const gamePlatform = await findGamePlatformByGameIdAndPlatformId(game.id, platform.id);

        assert.ok(gamePlatform);

        const libraryEntry = await findLibraryEntryByUserAndGameId(user.id, game.id);

        assert.ok(libraryEntry);
        assert.equal(libraryEntry.status, "WANT_TO_PLAY");

        const libraryEntryPlatform = await findLibraryEntryPlatformByUserIdGameIdAndPlatformId(
            user.id,
            game.id,
            platform.id,
        );

        assert.ok(libraryEntryPlatform);
    });

    test("deve adicionar jogo sem data de lançamento", async () => {
        const { agent } = await createAuthenticatedAgent();

        const payload = createLibraryPayload();

        const mockedDetails = mockRawgGameDetails({ releaseDate: null });

        const response = await addGameToLibrary(agent, payload);

        assert.equal(response.status, 201);

        assert.equal(mockedDetails.mock.calls.length, 1);
        assert.equal(mockedDetails.mock.calls[0]?.[0], payload.externalId);

        const game = await findGameByExternalId(payload.externalId);

        assert.exists(game);
        assert.isNull(game.releaseDate);

        assert.equal(response.body.libraryEntry.gameId, game.id);
    });

    test("não deve adicionar o mesmo jogo duas vezes à biblioteca do mesmo usuário", async () => {
        const { agent, user } = await createAuthenticatedAgent();

        const mockedDetails = mockRawgGameDetails();

        const payload = createLibraryPayload();

        const firstResponse = await addGameToLibrary(agent, payload);

        assert.equal(firstResponse.status, 201);

        const response = await addGameToLibrary(agent, payload);

        assert.equal(response.status, 409);
        assert.equal(response.body.message, "Este jogo já está na sua biblioteca");

        assert.equal(mockedDetails.mock.calls.length, 1);
        assert.equal(mockedDetails.mock.calls[0]?.[0], payload.externalId);

        const game = await findGameByExternalId(payload.externalId);

        assert.ok(game);

        const libraryEntriesCount = await countLibraryEntriesByUserIdAndGameId(user.id, game.id);

        assert.equal(libraryEntriesCount, 1);

        const platform = await findPlatformByName("PC");

        assert.ok(platform);

        const libraryEntryPlatformsCount = await countLibraryEntryPlatformsByUserIdGameIdPlatformId(
            user.id,
            game.id,
            platform.id,
        );

        assert.equal(libraryEntryPlatformsCount, 1);
    });

    test("deve permitir que usuários diferentes adicionem o mesmo jogo à biblioteca", async () => {
        const { agent: agentA, user: userA } = await createAuthenticatedAgent({
            email: "userA@email.com",
        });

        const { agent: agentB, user: userB } = await createAuthenticatedAgent({
            email: "userB@email.com",
        });

        const mockedDetails = mockRawgGameDetails();

        const payload = createLibraryPayload();

        const firstResponse = await addGameToLibrary(agentA, payload);

        assert.equal(firstResponse.status, 201);

        const secondResponse = await addGameToLibrary(agentB, payload);

        assert.equal(secondResponse.status, 201);

        const firstGameId = firstResponse.body.libraryEntry.gameId;
        const secondGameId = secondResponse.body.libraryEntry.gameId;

        assert.equal(firstGameId, secondGameId);

        assert.equal(mockedDetails.mock.calls.length, 1);
        assert.equal(mockedDetails.mock.calls[0]?.[0], payload.externalId);

        const gameCount = await countGamesByExternalId(payload.externalId);

        assert.equal(gameCount, 1);

        const libraryEntriesCountuserA = await countLibraryEntriesByUserIdAndGameId(
            userA.id,
            firstGameId,
        );

        assert.equal(libraryEntriesCountuserA, 1);

        const libraryEntriesCountuserB = await countLibraryEntriesByUserIdAndGameId(
            userB.id,
            secondGameId,
        );

        assert.equal(libraryEntriesCountuserB, 1);
    });

    test("não deve adicionar jogo com plataforma não disponível", async () => {
        const { agent, user } = await createAuthenticatedAgent();

        const mockedDetails = mockRawgGameDetails();

        const payload = createLibraryPayload({
            platforms: ["PlayStation 5"],
        });

        const response = await addGameToLibrary(agent, payload);

        assert.equal(response.status, 400);
        assert.equal(
            response.body.message,
            "Plataforma(s) não disponível(is) para este jogo: PlayStation 5",
        );

        assert.equal(mockedDetails.mock.calls.length, 1);
        assert.equal(mockedDetails.mock.calls[0]?.[0], payload.externalId);

        const game = await findGameByExternalId(payload.externalId);

        assert.ok(game);

        const platform = await findPlatformByName("PC");

        assert.ok(platform);

        const unavailablePlatform = await findPlatformByName("PlayStation 5");

        assert.equal(unavailablePlatform, null);

        const gamePlatformCount = await countGamePlatformsByGameIdAndPlatformId(
            game.id,
            platform.id,
        );

        assert.equal(gamePlatformCount, 1);

        const libraryEntriesCount = await countLibraryEntriesByUserIdAndGameId(user.id, game.id);

        assert.equal(libraryEntriesCount, 0);

        const libraryEntriesPlatformsCount = await countLibraryEntryPlatformsByUserIdAndGameId(
            user.id,
            game.id,
        );

        assert.equal(libraryEntriesPlatformsCount, 0);
    });

    test("deve adicionar um jogo com múltiplas plataformas à mesma entrada da biblioteca", async () => {
        const { agent, user } = await createAuthenticatedAgent();

        const platforms = ["PC", "PlayStation 5"];

        const mockedDetails = mockRawgGameDetails({ platforms });

        const payload = createLibraryPayload({ platforms });

        const response = await addGameToLibrary(agent, payload);

        assert.equal(response.status, 201);

        assert.deepEqual([...response.body.libraryEntry.platforms].sort(), [...platforms].sort());

        assert.equal(mockedDetails.mock.calls.length, 1);
        assert.equal(mockedDetails.mock.calls[0]?.[0], payload.externalId);

        const game = await findGameByExternalId(payload.externalId);

        assert.ok(game);

        const gameCount = await countGamesByExternalId(payload.externalId);

        assert.equal(gameCount, 1);

        const pcPlatform = await findPlatformByName("PC");

        assert.ok(pcPlatform);

        const playStationPlatform = await findPlatformByName("PlayStation 5");

        assert.ok(playStationPlatform);

        const gamePcPlatform = await findGamePlatformByGameIdAndPlatformId(game.id, pcPlatform.id);

        assert.ok(gamePcPlatform);

        const gamePlayStationPlatform = await findGamePlatformByGameIdAndPlatformId(
            game.id,
            playStationPlatform.id,
        );

        assert.ok(gamePlayStationPlatform);

        const gamePlatformsCount = await countGamePlatformsByGameId(game.id);

        assert.equal(gamePlatformsCount, 2);

        const libraryEntry = await findLibraryEntryByUserAndGameId(user.id, game.id);

        assert.ok(libraryEntry);
        assert.equal(libraryEntry.status, "WANT_TO_PLAY");

        const libraryEntriesCount = await countLibraryEntriesByUserIdAndGameId(user.id, game.id);

        assert.equal(libraryEntriesCount, 1);

        const pcLibraryEntryPlatform = await findLibraryEntryPlatformByUserIdGameIdAndPlatformId(
            user.id,
            game.id,
            pcPlatform.id,
        );

        assert.ok(pcLibraryEntryPlatform);

        const playStationLibraryEntryPlatform =
            await findLibraryEntryPlatformByUserIdGameIdAndPlatformId(
                user.id,
                game.id,
                playStationPlatform.id,
            );

        assert.ok(playStationLibraryEntryPlatform);

        const libraryEntryPlatformsCount = await countLibraryEntryPlatformsByUserIdAndGameId(
            user.id,
            game.id,
        );

        assert.equal(libraryEntryPlatformsCount, 2);
    });

    test("deve reutilizar uma plataforma existente ao adicionar jogos diferentes", async () => {
        const { agent } = await createAuthenticatedAgent();

        const payloadA = createLibraryPayload({ externalId: 123 });
        const payloadB = createLibraryPayload({ externalId: 456 });

        mockRawgGameDetails({
            externalId: payloadA.externalId,
            title: "Jogo A",
        });

        const responseA = await addGameToLibrary(agent, payloadA);

        assert.equal(responseA.status, 201);

        mockRawgGameDetails({
            externalId: payloadB.externalId,
            title: "Jogo B",
        });

        const responseB = await addGameToLibrary(agent, payloadB);

        assert.equal(responseB.status, 201);

        const gameA = await findGameByExternalId(payloadA.externalId);
        const gameB = await findGameByExternalId(payloadB.externalId);

        assert.exists(gameA);
        assert.exists(gameB);
        assert.notEqual(gameA.id, gameB.id);

        const platform = await findPlatformByName("PC");

        assert.exists(platform);

        const platformsCount = await countPlatformsByName("PC");

        assert.equal(platformsCount, 1);

        const gamePlatformA = await findGamePlatformByGameIdAndPlatformId(gameA.id, platform.id);

        const gamePlatformB = await findGamePlatformByGameIdAndPlatformId(gameB.id, platform.id);

        assert.exists(gamePlatformA);
        assert.exists(gamePlatformB);
    });

    test("não deve adicionar jogo sem access token", async () => {
        const mockedDetails = mockRawgGameDetails();

        const payload = createLibraryPayload();

        const response = await addGameToLibraryWithoutCookies(payload);

        assert.equal(response.status, 401);
        assert.equal(response.body.message, "Não autenticado");

        assert.equal(mockedDetails.mock.calls.length, 0);

        const game = await findGameByExternalId(payload.externalId);

        assert.equal(game, null);

        const libraryEntriesCount = await countLibraryEntries();

        assert.equal(libraryEntriesCount, 0);
    });

    test("não deve adicionar jogo com payload inválido", async () => {
        const { agent } = await createAuthenticatedAgent();

        const mockedDetails = mockRawgGameDetails();

        const payload = createLibraryPayload({
            externalId: 0,
        });

        const response = await addGameToLibrary(agent, payload);

        assert.equal(response.status, 422);
        assert.equal(response.body.error, "Erro de Validação");

        assert.equal(mockedDetails.mock.calls.length, 0);

        const game = await findGameByExternalId(payload.externalId);

        assert.equal(game, null);

        const libraryEntriesCount = await countLibraryEntries();

        assert.equal(libraryEntriesCount, 0);
    });

    test("deve retornar erro quando a RAWG falhar ao buscar o jogo", async () => {
        const { agent } = await createAuthenticatedAgent();

        const mockedDetails = mockRawgGameDetailsError(
            new AppError("Erro ao buscar jogo na RAWG", 502),
        );

        const payload = createLibraryPayload();

        const response = await addGameToLibrary(agent, payload);

        assert.equal(response.status, 502);
        assert.equal(response.body.message, "Erro ao buscar jogo na RAWG");

        assert.equal(mockedDetails.mock.calls.length, 1);
        assert.equal(mockedDetails.mock.calls[0]?.[0], payload.externalId);

        const game = await findGameByExternalId(payload.externalId);

        assert.equal(game, null);

        const libraryEntriesCount = await countLibraryEntries();

        assert.equal(libraryEntriesCount, 0);
    });

    test("deve retornar 404 quando o jogo não for encontrado na RAWG", async () => {
        const { agent } = await createAuthenticatedAgent();

        const mockedDetails = mockRawgGameDetailsError(new AppError("Jogo não encontrado", 404));

        const payload = createLibraryPayload();

        const response = await addGameToLibrary(agent, payload);

        assert.equal(response.status, 404);
        assert.equal(response.body.message, "Jogo não encontrado");

        assert.equal(mockedDetails.mock.calls.length, 1);
        assert.equal(mockedDetails.mock.calls[0]?.[0], payload.externalId);

        const game = await findGameByExternalId(payload.externalId);

        assert.equal(game, null);

        const libraryEntriesCount = await countLibraryEntries();

        assert.equal(libraryEntriesCount, 0);
    });
});
