import request from "supertest";

import app from "../../../src/app.js";

import type { AppTestAgent } from "../../types/http.types.js";
import type { AddGameToLibraryPayload } from "../../../src/schemas/library.schema.js";

export function addGameToLibrary(agent: AppTestAgent, payload: AddGameToLibraryPayload) {
    return agent.post("/library").send(payload);
}

export function addGameToLibraryWithoutCookies(payload: AddGameToLibraryPayload) {
    return request(app).post("/library").send(payload);
}
