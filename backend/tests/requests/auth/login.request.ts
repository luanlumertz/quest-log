import request from "supertest";

import app from "../../../src/app.js";
import type { LoginUserPayload } from "../../../src/schemas/auth.schema.js";

import type { AppTestAgent } from "../../types/http.types.js";

export function loginUser(payload: LoginUserPayload) {
    return request(app).post("/auth/login").send(payload);
}

export function loginUserWithAgent(agent: AppTestAgent, payload: LoginUserPayload) {
    return agent.post("/auth/login").send(payload);
}
