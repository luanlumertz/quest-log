import request from "supertest";

import app from "../../../src/app.js";

import type { AppTestAgent } from "../../types/http.types.js";

export function getDashboardStats(agent: AppTestAgent) {
    return agent.get("/dashboard");
}

export function getDashboardStatsWithoutCookies() {
    return request(app).get("/dashboard");
}
