import request from "supertest";

import type { AppTestAgent } from "../../types/http.types.js";
import app from "../../../src/app.js";

export function searchGames(agent: AppTestAgent, query: string, page?: string | number) {
    return agent.get("/games/search").query({ query, ...(page !== undefined ? { page } : {}) });
}

export function searchGamesWithoutCookies(query: string) {
    return request(app).get("/games/search").query({ query });
}
