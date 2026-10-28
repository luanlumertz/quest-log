import request from "supertest";

import app from "../../../src/app.js";
import { csrfHeaders } from "../../helpers/http/csrf.helper.js";
import type {
    VerifyRegistrationData,
    ResendRegistrationCodeData,
} from "../../../src/schemas/auth.schema.js";

export function verifyRegistration(payload: VerifyRegistrationData) {
    return request(app).post("/auth/register/verify").set(csrfHeaders).send(payload);
}

export function resendRegistrationCode(payload: ResendRegistrationCodeData) {
    return request(app).post("/auth/register/resend").set(csrfHeaders).send(payload);
}
