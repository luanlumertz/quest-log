import request from "supertest";

import type { AppTestAgent } from "../../types/http.types.js";
import app from "../../../src/app.js";

export function getGameDetails(agent: AppTestAgent, externalId: number) {
    return agent.get(`/games/${externalId}`);
}

export function getGameDetailsWithoutCookies(externalId: number) {
    return request(app).get(`/games/${externalId}`);
}
