import request from "supertest";

import app from "../../../src/app.js";
import { csrfHeaders } from "../../helpers/http/csrf.helper.js";
import type { RegisterUserPayload } from "../../../src/schemas/auth.schema.js";

export function registerUser(payload: RegisterUserPayload) {
    return request(app).post("/auth/register").set(csrfHeaders).send(payload);
}
