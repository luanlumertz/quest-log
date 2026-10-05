import request from "supertest";

import app from "../../src/app.js";
import type { PublicUser } from "../../src/types/auth.types.js";
import type {
    RegisterUserPayload,
    LoginUserPayload,
    UpdateUserPayload,
} from "../../src/schemas/auth.schema.js";

import { makeRegisterUserPayload } from "../factories/auth.factory.js";

type AppTestAgent = ReturnType<typeof request.agent>;

export function getCurrentUserResponse(agent: AppTestAgent) {
    return agent.get("/auth/me");
}

export function getCurrentUserResponseWithoutCookies() {
    return request(app).get("/auth/me");
}

export function getCurrentUserResponseWithToken(accessToken: string) {
    return request(app).get("/auth/me").set("Cookie", `accessToken=${accessToken}`);
}

export function registerUser(payload: RegisterUserPayload) {
    return request(app).post("/auth/register").send(payload);
}

export function loginUser(payload: LoginUserPayload) {
    return request(app).post("/auth/login").send(payload);
}

export function updateCurrentUser(agent: AppTestAgent, payload: UpdateUserPayload) {
    return agent.patch("/auth/me").send(payload);
}

export function updateCurrentUserWithoutCookies(payload: UpdateUserPayload) {
    return request(app).patch("/auth/me").send(payload);
}

export function updateCurrentUserWithInvalidPayload(agent: AppTestAgent, payload: object) {
    return agent.patch("/auth/me").send(payload);
}

export function logoutUser(agent: AppTestAgent) {
    return agent.post("/auth/logout");
}

export function logoutUserWithoutCookies() {
    return request(app).post("/auth/logout");
}

export function logoutUserWithToken(refreshToken: string) {
    return request(app).post("/auth/logout").set("Cookie", `refreshToken=${refreshToken}`);
}

export function refreshUser(agent: AppTestAgent) {
    return agent.post("/auth/refresh");
}

export function refreshUserWithToken(refreshToken: string) {
    return request(app).post("/auth/refresh").set("Cookie", `refreshToken=${refreshToken}`);
}

export function refreshUserWithoutToken() {
    return request(app).post("/auth/refresh");
}

export async function createRegisteredUser(overrides: Partial<RegisterUserPayload> = {}): Promise<{
    payload: RegisterUserPayload;
    user: PublicUser;
}> {
    const payload = makeRegisterUserPayload(overrides);
    const response = await registerUser(payload);

    if (response.status !== 201) {
        throw new Error(`Falha ao preparar usuário para o teste. Status recebido: ${response.status}`);
    }

    return {
        payload,
        user: response.body.user,
    };
}

export async function createAuthenticatedAgent() {
    const agent = request.agent(app);

    const { payload: registerPayload, user: registeredUser } = await createRegisteredUser();

    const loginResponse = await agent.post("/auth/login").send({
        email: registerPayload.email,
        password: registerPayload.password,
    });

    if (loginResponse.status !== 200) {
        throw new Error(`Falha ao autenticar usuário para o teste. Status recebido: ${loginResponse.status}`);
    }

    return {
        agent,
        registerPayload,
        user: registeredUser,
        loginResponse,
    };
}
