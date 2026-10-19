import { assert, describe, test } from "vitest";

import { loginSchema, registerSchema, updateSchema } from "../../../src/schema/auth.schema";

describe("auth.schema.ts", () => {
    describe("registerSchema", () => {
        const validPayload = {
            name: "João Silva",
            email: "teste@email.com",
            password: "12345678",
            confirmPassword: "12345678",
        };

        test("deve normalizar os dados do usuário", () => {
            const result = registerSchema.parse({
                name: "  João   Silva  ",
                email: "  TESTE@EMAIL.COM  ",
                password: "12345678",
                confirmPassword: "12345678",
            });

            assert.deepEqual(result, {
                name: "João Silva",
                email: "teste@email.com",
                password: "12345678",
            });
        });

        test("deve rejeitar propriedades não permitidas no cadastro do usuário", () => {
            const result = registerSchema.safeParse({
                ...validPayload,
                isAdmin: true,
            });

            assert.isFalse(result.success);

            assert.isTrue(
                result.error.issues.some(
                    (issue) => issue.code === "unrecognized_keys" && issue.keys.includes("isAdmin"),
                ),
            );
        });

        test.each([
            {
                scenario: "nome muito curto",
                override: { name: "A" },
                field: "name",
                message: "Nome deve ter pelo menos 2 caracteres",
            },
            {
                scenario: "nome muito longo",
                override: { name: "A".repeat(65) },
                field: "name",
                message: "Nome muito grande. Máximo: 64 caracteres",
            },
            {
                scenario: "nome contendo apenas espaços",
                override: { name: "     " },
                field: "name",
                message: "Nome deve ter pelo menos 2 caracteres",
            },
            {
                scenario: "nome com caracteres inválidos",
                override: { name: "123" },
                field: "name",
                message: "Nome contém caracteres inválidos",
            },
            {
                scenario: "e-mail com formato inválido",
                override: { email: "email-invalido" },
                field: "email",
                message: "Email inválido",
            },
            {
                scenario: "senha muito curta",
                override: {
                    password: "1234567",
                    confirmPassword: "1234567",
                },
                field: "password",
                message: "Senha deve ter pelo menos 8 caracteres",
            },
            {
                scenario: "senha muito longa",
                override: {
                    password: "1".repeat(71),
                    confirmPassword: "1".repeat(71),
                },
                field: "password",
                message: "Senha muito grande. Máximo: 70 caracteres",
            },
            {
                scenario: "senha contendo apenas espaços",
                override: {
                    password: "        ",
                    confirmPassword: "        ",
                },
                field: "password",
                message: "A senha não pode conter apenas espaços",
            },
            {
                scenario: "senhas que não coincidem",
                override: {
                    password: "12345678",
                    confirmPassword: "87654321",
                },
                field: "confirmPassword",
                message: "As senhas não coincidem",
            },
        ])("deve rejeitar $scenario", ({ override, field, message }) => {
            const result = registerSchema.safeParse({
                ...validPayload,
                ...override,
            });

            assert.isFalse(result.success);

            assert.isTrue(
                result.error.issues.some(
                    (issue) => issue.path[0] === field && issue.message === message,
                ),
            );
        });

        test.each(["confirmPassword"] as const)(
            "deve rejeitar registro sem o campo %s",
            (field) => {
                const payload: Partial<typeof validPayload> = { ...validPayload };

                delete payload[field];

                const result = registerSchema.safeParse(payload);

                assert.isFalse(result.success);

                assert.isTrue(result.error.issues.some((issue) => issue.path[0] === field));
            },
        );

        test.each([
            {
                scenario: "nome com caracteres especiais",
                override: { name: "João D'Ávila-Silva" },
            },
        ])("deve aceitar $scenario", ({ override }) => {
            const payload = {
                ...validPayload,
                ...override,
            };

            const result = registerSchema.safeParse(payload);

            assert.isTrue(result.success);

            assert.deepEqual(result.data, {
                name: payload.name,
                email: payload.email,
                password: payload.password,
            });
        });
    });

    describe("loginSchema", () => {
        const validPayload = {
            email: "teste@email.com",
            password: "12345678",
        };

        test("deve normalizar o e-mail e preservar a senha no login", () => {
            const result = loginSchema.parse({
                email: "  TESTE@EMAIL.COM  ",
                password: "12345678",
            });

            assert.deepEqual(result, {
                email: "teste@email.com",
                password: "12345678",
            });
        });

        test("deve rejeitar propriedades não permitidas no login do usuário", () => {
            const result = loginSchema.safeParse({
                ...validPayload,
                isAdmin: true,
            });

            assert.isFalse(result.success);

            assert.isTrue(
                result.error.issues.some(
                    (issue) => issue.code === "unrecognized_keys" && issue.keys.includes("isAdmin"),
                ),
            );
        });

        test.each([
            {
                scenario: "e-mail com formato inválido",
                override: { email: "email-invalido" },
                field: "email",
                message: "Email inválido",
            },
            {
                scenario: "senha vazia",
                override: { password: "" },
                field: "password",
                message: "Senha é obrigatória",
            },
            {
                scenario: "senha contendo apenas espaços",
                override: { password: "        " },
                field: "password",
                message: "Senha é obrigatória",
            },
            {
                scenario: "senha com mais de 70 caracteres",
                override: { password: "1".repeat(71) },
                field: "password",
                message: "Senha inválida",
            },
        ])("deve rejeitar $scenario", ({ override, field, message }) => {
            const result = loginSchema.safeParse({
                ...validPayload,
                ...override,
            });

            assert.isFalse(result.success);

            assert.isTrue(
                result.error.issues.some(
                    (issue) => issue.path[0] === field && issue.message === message,
                ),
            );
        });

        test("deve rejeitar login sem a senha", () => {
            const field = "password";
            const payload: Partial<typeof validPayload> = { ...validPayload };

            delete payload[field];

            const result = loginSchema.safeParse(payload);

            assert.isFalse(result.success);

            assert.isTrue(result.error.issues.some((issue) => issue.path[0] === field));
        });

        test.each([
            {
                scenario: "senha com espaços nas extremidades",
                override: { password: "  senha123  " },
            },
        ])("deve aceitar $scenario", ({ override }) => {
            const payload = {
                ...validPayload,
                ...override,
            };

            const result = loginSchema.safeParse(payload);

            assert.isTrue(result.success);

            assert.deepEqual(result.data, {
                email: payload.email,
                password: payload.password,
            });
        });
    });

    describe("updateSchema", () => {
        test("deve normalizar o nome do usuário ao atualizar o perfil", () => {
            const result = updateSchema.parse({ name: "  João   Silva  " });

            assert.deepEqual(result, { name: "João Silva" });
        });

        test("deve rejeitar propriedades não permitidas na atualização do perfil", () => {
            const result = updateSchema.safeParse({
                name: "João Silva",
                email: "teste@email.com",
            });

            assert.isFalse(result.success);

            assert.isTrue(
                result.error.issues.some(
                    (issue) => issue.code === "unrecognized_keys" && issue.keys.includes("email"),
                ),
            );
        });

        test("deve rejeitar atualização sem nome", () => {
            const payload = {};
            const result = updateSchema.safeParse(payload);

            assert.isFalse(result.success);

            assert.isTrue(result.error.issues.some((issue) => issue.path[0] === "name"));
        });
    });
});
