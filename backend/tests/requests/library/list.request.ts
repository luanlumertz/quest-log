import request from "supertest";

import type { LibraryQueryData } from "../../../src/schemas/library.schema.js";
import app from "../../../src/app.js";

import type { AppTestAgent } from "../../types/http.types.js";

export function listLibrary(agent: AppTestAgent, query: Partial<LibraryQueryData> = {}) {
    return agent.get("/library").query(query);
}

export function listLibraryWithoutCookies(query: Partial<LibraryQueryData> = {}) {
    return request(app).get("/library").query(query);
}
