import request from "supertest";

import app from "../../../src/app.js";
import { csrfHeaders } from "../../helpers/http/csrf.helper.js";

import type { AppTestAgent } from "../../types/http.types.js";

export function deleteLibraryEntry(agent: AppTestAgent, gameId: number) {
    return agent.delete(`/library/${gameId}`).set(csrfHeaders);
}

export function deleteLibraryEntryWithoutCookies(gameId: number) {
    return request(app).delete(`/library/${gameId}`).set(csrfHeaders);
}
