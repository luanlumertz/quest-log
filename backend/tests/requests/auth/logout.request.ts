import request from "supertest";

import app from "../../../src/app.js";
import { csrfHeaders } from "../../helpers/http/csrf.helper.js";
import type { AppTestAgent } from "../../types/http.types.js";

export function logoutUser(agent: AppTestAgent) {
    return agent.post("/auth/logout").set(csrfHeaders);
}

export function logoutUserWithoutCookies() {
    return request(app).post("/auth/logout").set(csrfHeaders);
}

export function logoutUserWithToken(refreshToken: string) {
    return request(app)
        .post("/auth/logout")
        .set(csrfHeaders)
        .set("Cookie", `refreshToken=${refreshToken}`);
}
