import { assert, describe, test } from "vitest";

import { AppError } from "../../../src/errors/AppError.js";
import { findGameByExternalId } from "../../../src/repositories/game.repository.js";
import { findPlatformByName } from "../../../src/repositories/platform.repository.js";
import { findLibraryEntryByUserAndGameId } from "../../../src/repositories/library.repository.js";

import { createAuthenticatedAgent } from "../../fixtures/auth.fixture.js";
import {
    countLibraryEntries,
    countLibraryEntriesByUserIdAndGameId,
    countLibraryEntryPlatformsByUserIdAndGameId,
    countLibraryEntryPlatformsByUserIdGameIdPlatformId,
    findLibraryEntryPlatformByUserIdGameIdAndPlatformId,
} from "../../fixtures/library.fixture.js";
import {
    countGamePlatformsByGameId,
    countGamePlatformsByGameIdAndPlatformId,
    countGamesByExternalId,
    findGamePlatformByGameIdAndPlatformId,
} from "../../fixtures/game.fixture.js";
import { mockRawgGameDetails, mockRawgGameDetailsError } from "../../fixtures/rawg.fixture.js";
import {
    addGameToLibrary,
    addGameToLibraryWithoutCookies,
} from "../../requests/library/create.request.js";
import { createLibraryPayload } from "../../factories/library.factory.js";

describe("POST /library", () => {
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
        const { agent: agent1, user: user1 } = await createAuthenticatedAgent({
            email: "user1@email.com",
        });

        const { agent: agent2, user: user2 } = await createAuthenticatedAgent({
            email: "user2@email.com",
        });

        const mockedDetails = mockRawgGameDetails();

        const payload = createLibraryPayload();

        const firstResponse = await addGameToLibrary(agent1, payload);

        assert.equal(firstResponse.status, 201);

        const secondResponse = await addGameToLibrary(agent2, payload);

        assert.equal(secondResponse.status, 201);

        const firstGameId = firstResponse.body.libraryEntry.gameId;
        const secondGameId = secondResponse.body.libraryEntry.gameId;

        assert.equal(firstGameId, secondGameId);

        assert.equal(mockedDetails.mock.calls.length, 1);
        assert.equal(mockedDetails.mock.calls[0]?.[0], payload.externalId);

        const gameCount = await countGamesByExternalId(payload.externalId);

        assert.equal(gameCount, 1);

        const libraryEntriesCountUser1 = await countLibraryEntriesByUserIdAndGameId(
            user1.id,
            firstGameId,
        );

        assert.equal(libraryEntriesCountUser1, 1);

        const libraryEntriesCountUser2 = await countLibraryEntriesByUserIdAndGameId(
            user2.id,
            secondGameId,
        );

        assert.equal(libraryEntriesCountUser2, 1);
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
