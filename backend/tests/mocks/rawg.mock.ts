import { vi } from "vitest";

vi.mock("../../src/integrations/rawg.js", () => ({
    searchRawgGames: vi.fn(),
    getRawgGameById: vi.fn(),
}));
