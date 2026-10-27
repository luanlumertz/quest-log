import request from "supertest";

import app from "../../../src/app.js";
import { csrfHeaders } from "../../helpers/http/csrf.helper.js";
import type { AppTestAgent } from "../../types/http.types.js";

export function refreshUser(agent: AppTestAgent) {
    return agent.post("/auth/refresh").set(csrfHeaders);
}

export function refreshUserWithToken(refreshToken: string) {
    return request(app)
        .post("/auth/refresh")
        .set(csrfHeaders)
        .set("Cookie", `refreshToken=${refreshToken}`);
}

export function refreshUserWithoutToken() {
    return request(app).post("/auth/refresh").set(csrfHeaders);
}
