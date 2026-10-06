import request from "supertest";

import type { AppTestAgent } from "../../types/http.types.js";
import app from "../../../src/app.js";

export function searchGames(agent: AppTestAgent, query: string) {
    return agent.get("/games/search").query({ query });
}

export function searchGamesWithoutCookies(query: string) {
    return request(app).get("/games/search").query({ query });
}
