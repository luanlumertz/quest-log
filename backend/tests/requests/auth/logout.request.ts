import request from "supertest";

import app from "../../../src/app.js";
import type { AppTestAgent } from "../../types/http.types.js";

export function logoutUser(agent: AppTestAgent) {
    return agent.post("/auth/logout");
}

export function logoutUserWithoutCookies() {
    return request(app).post("/auth/logout");
}

export function logoutUserWithToken(refreshToken: string) {
    return request(app).post("/auth/logout").set("Cookie", `refreshToken=${refreshToken}`);
}
