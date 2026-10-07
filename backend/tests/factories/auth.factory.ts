import type { RegisterUserPayload, LoginUserPayload } from "../../src/schemas/auth.schema.js";

const defaultUser = {
    name: "User",
    email: "teste@email.com",
    password: "12345678",
};

export function makeRegisterUserPayload(
    overrides: Partial<RegisterUserPayload> = {},
): RegisterUserPayload {
    const password = overrides.password ?? defaultUser.password;

    return {
        name: defaultUser.name,
        email: defaultUser.email,
        password,
        confirmPassword: password,
        ...overrides,
    };
}

export function makeLoginUserPayload(overrides: Partial<LoginUserPayload> = {}): LoginUserPayload {
    return {
        email: defaultUser.email,
        password: defaultUser.password,
        ...overrides,
    };
}
