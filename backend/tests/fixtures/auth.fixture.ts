import request from "supertest";

import app from "../../src/app.js";
import type { PublicUser } from "../../src/types/auth.types.js";
import type { RegisterUserPayload } from "../../src/schemas/auth.schema.js";

import { makeRegisterUserPayload } from "../factories/auth.factory.js";
import { registerUser } from "../requests/auth/register.request.js";
import { loginUserWithAgent } from "../requests/auth/login.request.js";

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

    const loginResponse = await loginUserWithAgent(agent, {
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
