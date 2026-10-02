import request from "supertest";
import app from "../../src/app.js";
import type { RegisterUserPayload } from "../factories/user.factory.js";

export function registerUser(payload: RegisterUserPayload) {
  return request(app).post("/auth/register").send(payload);
}
