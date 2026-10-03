import request from "supertest";
import app from "../../src/app.js";
import type {
    RegisterUserPayload,
    LoginUserPayload,
} from "../../src/schemas/auth.schema.js";
import { makeRegisterUserPayload } from "../factories/auth.factory.js";

type AppTestAgent = ReturnType<typeof request.agent>;

export function registerUser(payload: RegisterUserPayload) {
    return request(app).post("/auth/register").send(payload);
}

export function loginUser(payload: LoginUserPayload) {
    return request(app).post("/auth/login").send(payload);
}

export function refreshUser(agent: AppTestAgent) {
    return agent.post("/auth/refresh");
}

export function refreshUserWithToken(refreshToken: string) {
    return request(app)
        .post("/auth/refresh")
        .set("Cookie", `refreshToken=${refreshToken}`);
}

export function refreshUserWithoutToken() {
    return request(app).post("/auth/refresh");
}

export async function createRegisteredUser(
    overrides: Partial<RegisterUserPayload> = {},
) {
    const payload = makeRegisterUserPayload(overrides);
    const response = await registerUser(payload);

    if (response.status !== 201) {
        throw new Error(
            `Falha ao preparar usuário para o teste. Status recebido: ${response.status}`,
        );
    }

    return {
        payload,
        user: response.body.user,
    };
}

export async function createAuthenticatedAgent() {
    const agent = request.agent(app);

    const { payload: registerPayload, user: registeredUser } =
        await createRegisteredUser();

    const loginResponse = await agent.post("/auth/login").send({
        email: registerPayload.email,
        password: registerPayload.password,
    });

    if (loginResponse.status !== 200) {
        throw new Error(
            `Falha ao autenticar usuário para o teste. Status recebido: ${loginResponse.status}`,
        );
    }

    return {
        agent,
        registerPayload,
        user: registeredUser,
        loginResponse,
    };
}
