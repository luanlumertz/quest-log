import request from "supertest";

import app from "../../../src/app.js";
import type { UpdateUserPayload } from "../../../src/schemas/auth.schema.js";
import type { AppTestAgent } from "../../types/http.types.js";

// GET /auth/me

export function getCurrentUserResponse(agent: AppTestAgent) {
    return agent.get("/auth/me");
}

export function getCurrentUserResponseWithoutCookies() {
    return request(app).get("/auth/me");
}

export function getCurrentUserResponseWithToken(accessToken: string) {
    return request(app).get("/auth/me").set("Cookie", `accessToken=${accessToken}`);
}

// PATCH /auth/me

export function updateCurrentUser(agent: AppTestAgent, payload: UpdateUserPayload) {
    return agent.patch("/auth/me").send(payload);
}

export function updateCurrentUserWithoutCookies(payload: UpdateUserPayload) {
    return request(app).patch("/auth/me").send(payload);
}

export function updateCurrentUserWithInvalidPayload(agent: AppTestAgent, payload: object) {
    return agent.patch("/auth/me").send(payload);
}

// DELETE /auth/me

export function deleteCurrentUser(agent: AppTestAgent) {
    return agent.delete("/auth/me");
}

export function deleteCurrentUserWithoutCookies() {
    return request(app).delete("/auth/me");
}
