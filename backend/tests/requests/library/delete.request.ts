import request from "supertest";

import app from "../../../src/app.js";

import type { AppTestAgent } from "../../types/http.types.js";

export function deleteLibraryEntry(agent: AppTestAgent, gameId: number) {
    return agent.delete(`/library/${gameId}`);
}

export function deleteLibraryEntryWithoutCookies(gameId: number) {
    return request(app).delete(`/library/${gameId}`);
}
