import request from "supertest";

import app from "../../../src/app.js";
import { csrfHeaders } from "../../helpers/http/csrf.helper.js";

import type { AppTestAgent } from "../../types/http.types.js";
import type { AddGameToLibraryPayload } from "../../../src/schemas/library.schema.js";

export function addGameToLibrary(agent: AppTestAgent, payload: AddGameToLibraryPayload) {
    return agent.post("/library").set(csrfHeaders).send(payload);
}

export function addGameToLibraryWithoutCookies(payload: AddGameToLibraryPayload) {
    return request(app).post("/library").set(csrfHeaders).send(payload);
}
