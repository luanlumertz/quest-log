import request from "supertest";

import app from "../../../src/app.js";

import type { AppTestAgent } from "../../types/http.types.js";
import type { UpdateLibraryEntryPayload } from "../../types/library.types.js";

export function updateLibraryEntry(
    agent: AppTestAgent,
    gameId: number,
    payload: UpdateLibraryEntryPayload,
) {
    return agent.patch(`/library/${gameId}`).send(payload);
}

export function updateLibraryEntryWithoutCookies(
    gameId: number,
    payload: UpdateLibraryEntryPayload,
) {
    return request(app).patch(`/library/${gameId}`).send(payload);
}
