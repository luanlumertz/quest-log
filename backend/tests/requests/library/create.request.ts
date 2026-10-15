import request from "supertest";

import app from "../../../src/app.js";

import type { AppTestAgent } from "../../types/http.types.js";
import type { AddGameToLibraryData } from "../../types/library.types.js";

export function addGameToLibrary(agent: AppTestAgent, payload: AddGameToLibraryData) {
    return agent.post("/library").send(payload);
}

export function addGameToLibraryWithoutCookies(payload: AddGameToLibraryData) {
    return request(app).post("/library").send(payload);
}
