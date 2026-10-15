import request from "supertest";

import app from "../../../src/app.js";
import type { AppTestAgent } from "../../types/http.types.js";

export function refreshUser(agent: AppTestAgent) {
    return agent.post("/auth/refresh");
}

export function refreshUserWithToken(refreshToken: string) {
    return request(app).post("/auth/refresh").set("Cookie", `refreshToken=${refreshToken}`);
}

export function refreshUserWithoutToken() {
    return request(app).post("/auth/refresh");
}
