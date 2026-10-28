import { afterEach, assert, describe, test, vi } from "vitest";

import { prisma } from "../../../src/lib/prisma.js";
import { getRawgGameById } from "../../../src/integrations/rawg.js";
import * as platformRepository from "../../../src/repositories/platform.repository.js";
import { createAuthenticatedAgent } from "../../fixtures/auth.fixture.js";
import { mockRawgGameDetails } from "../../fixtures/rawg.fixture.js";
import { createRawgGameDetails } from "../../factories/rawg.factory.js";
import { addGameToLibrary } from "../../requests/library/create.request.js";

// As duas consultas precisam chegar à RAWG antes de qualquer criação no banco.
function mockConcurrentDetails(platformsByGame: Record<number, string[]>) {
    let arrivals = 0;
    let release!: () => void;
    const ready = new Promise<void>((resolve) => {
        release = resolve;
    });

    vi.mocked(getRawgGameById).mockImplementation(async (externalId) => {
        if (++arrivals === 2) release();
        await ready;

        const platforms = platformsByGame[externalId];

        if (!platforms) {
            throw new Error("Plataformas do jogo não configuradas no teste.");
        }

        return createRawgGameDetails({ externalId, platforms });
    });
}

describe("POST /library: concorrência e rollback", () => {
    afterEach(() => vi.restoreAllMocks());

    test("deve compartilhar um jogo completo entre usuários que o adicionam simultaneamente", async () => {
        const first = await createAuthenticatedAgent();
        const second = await createAuthenticatedAgent({ email: "outro@email.com" });
        mockConcurrentDetails({ 123: ["PC", "PlayStation 5"] });
        const payload = { externalId: 123, platforms: ["PC", "PlayStation 5"] };

        const responses = await Promise.all([
            addGameToLibrary(first.agent, payload),
            addGameToLibrary(second.agent, payload),
        ]);

        const game = await prisma.game.findUnique({
            where: { externalId: 123 },
            include: {
                platforms: true,
                libraryEntries: { include: { libraryEntryPlatforms: true } },
            },
        });

        assert.deepEqual(
            responses.map((response) => response.status),
            [201, 201],
        );
        assert.equal(await prisma.game.count(), 1);
        assert.equal(await prisma.platform.count(), 2);
        assert.ok(game);
        assert.lengthOf(game.platforms, 2);
        assert.lengthOf(game.libraryEntries, 2);
        assert.deepEqual(
            game.libraryEntries.map((entry) => entry.libraryEntryPlatforms.length),
            [2, 2],
        );
    });

    test("deve criar jogos diferentes reutilizando plataformas disputadas em ordens distintas", async () => {
        const { agent } = await createAuthenticatedAgent();
        mockConcurrentDetails({ 123: ["PC", "Xbox"], 456: ["Xbox", "PC"] });

        const responses = await Promise.all([
            addGameToLibrary(agent, { externalId: 123, platforms: ["PC"] }),
            addGameToLibrary(agent, { externalId: 456, platforms: ["Xbox"] }),
        ]);

        const games = await prisma.game.findMany({ include: { platforms: true } });

        assert.deepEqual(
            responses.map((response) => response.status),
            [201, 201],
        );
        assert.lengthOf(games, 2);
        assert.equal(await prisma.platform.count(), 2);
        assert.deepEqual(
            games.map((game) => game.platforms.length),
            [2, 2],
        );
    });

    test("deve retornar 201 e 409 ao adicionar o mesmo jogo simultaneamente para o mesmo usuário", async () => {
        const { agent } = await createAuthenticatedAgent();
        mockConcurrentDetails({ 123: ["PC"] });
        const payload = { externalId: 123, platforms: ["PC"] };

        const responses = await Promise.all([
            addGameToLibrary(agent, payload),
            addGameToLibrary(agent, payload),
        ]);

        assert.deepEqual(responses.map((response) => response.status).sort(), [201, 409]);
        assert.equal(
            responses.find((response) => response.status === 409)?.body.message,
            "Este jogo já está na sua biblioteca",
        );
        assert.equal(await prisma.libraryEntry.count(), 1);
        assert.equal(await prisma.libraryEntryPlatform.count(), 1);
        assert.equal(await prisma.game.count(), 1);
    });

    test("deve desfazer jogo e plataformas se a associação falhar e permitir uma nova tentativa", async () => {
        const { agent } = await createAuthenticatedAgent();
        mockRawgGameDetails({ platforms: ["PC"] });
        const getOrCreatePlatforms = platformRepository.getOrCreatePlatforms;
        vi.spyOn(platformRepository, "getOrCreatePlatforms").mockImplementationOnce(
            async (names, tx) => [
                ...(await getOrCreatePlatforms(names, tx)),
                { id: -1 }, // Força uma violação real de chave estrangeira após criar a plataforma.
            ],
        );
        const payload = { externalId: 123, platforms: ["PC"] };

        const failed = await addGameToLibrary(agent, payload);

        assert.equal(failed.status, 500);
        assert.equal(await prisma.game.count(), 0);
        assert.equal(await prisma.platform.count(), 0);
        assert.equal(await prisma.gamePlatform.count(), 0);
        assert.equal(await prisma.libraryEntry.count(), 0);

        const retried = await addGameToLibrary(agent, payload);

        assert.equal(retried.status, 201);
        assert.equal(await prisma.game.count(), 1);
        assert.equal(await prisma.platform.count(), 1);
        assert.equal(await prisma.gamePlatform.count(), 1);
    });
});
