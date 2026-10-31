import type { GameDetailsResult, GameSearchResult } from "../../src/types/game.types";
import { demoLibraryEntry, demoPlatforms } from "./library";

export const demoSearchGame = {
    externalId: demoLibraryEntry.game.externalId,
    title: demoLibraryEntry.game.title,
    coverUrl: demoLibraryEntry.game.coverUrl,
    releaseDate: demoLibraryEntry.game.releaseDate.slice(0, 10),
    platforms: demoPlatforms.map((platform) => platform.name),
} satisfies GameSearchResult;

export const demoGameDetails = {
    ...demoSearchGame,
    description:
        "Explore um mundo de fantasia, descubra novas regiões e acompanhe sua própria jornada.",
    genres: ["Ação", "RPG"],
    developers: ["FromSoftware"],
    publishers: ["Bandai Namco Entertainment"],
} satisfies GameDetailsResult;

export const demoSearchResults: GameSearchResult[] = [
    demoSearchGame,
    { ...demoSearchGame, externalId: 2, title: "Jornada de demonstração", coverUrl: null },
    { ...demoSearchGame, externalId: 3, title: "Aventura nas estrelas", platforms: ["PC"] },
    { ...demoSearchGame, externalId: 4, title: "Mistérios do vale", releaseDate: null },
    {
        ...demoSearchGame,
        externalId: 5,
        title: "Uma história muito longa em um universo distante",
        platforms: [],
    },
    { ...demoSearchGame, externalId: 6, title: "Corrida de demonstração", coverUrl: null },
];

export const longGameDescription = [
    "### Explore no seu ritmo",
    "**Uma aventura de demonstração** para observar a apresentação de descrições extensas no QuestLog.",
    ...Array.from(
        { length: 6 },
        (_, index) =>
            `Região ${index + 1}: percorra cenários diferentes, encontre personagens e descubra desafios. O texto é apenas ilustrativo e não representa uma descrição oficial do jogo.`,
    ),
    "### Recursos",
    "- Exploração e descobertas\n- Combates e desafios\n- Progressão ao longo da jornada",
].join("\n\n");
