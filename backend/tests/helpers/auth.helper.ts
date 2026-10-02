import request from "supertest";
import app from "../../src/app.js";
import type {
  RegisterUserPayload,
  LoginUserPayload,
} from "../../src/schemas/auth.schema.js";

export function registerUser(payload: RegisterUserPayload) {
  return request(app).post("/auth/register").send(payload);
}

export function loginUser(payload: LoginUserPayload) {
  return request(app).post("/auth/login").send(payload);
}
