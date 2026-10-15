import request from "supertest";

import type { AppTestAgent } from "../../types/http.types.js";
import app from "../../../src/app.js";

export function getLibraryDetails(agent: AppTestAgent, gameId: number) {
    return agent.get(`/library/${gameId}`);
}

export function getLibraryDetailsWithoutCookies(gameId: number) {
    return request(app).get(`/library/${gameId}`);
}
