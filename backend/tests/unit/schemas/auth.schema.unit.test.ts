import { assert, describe, test } from "vitest";

import {
    loginUserSchema,
    registerUserSchema,
    updateUserSchema,
    resetPasswordSchema,
    changePasswordSchema,
} from "../../../src/schemas/auth.schema.js";

describe("auth.schema.ts", () => {
    describe("registerUserSchema", () => {
        const validPayload = {
            name: "João Silva",
            email: "teste@email.com",
            password: "12345678",
        };

        test("deve normalizar os dados do usuário", () => {
            const result = registerUserSchema.parse({
                name: "  João   Silva  ",
                email: "  TESTE@EMAIL.COM  ",
                password: "12345678",
            });

            assert.deepEqual(result, {
                name: "João Silva",
                email: "teste@email.com",
                password: "12345678",
            });
        });

        test("deve rejeitar propriedades não permitidas no cadastro do usuário", () => {
            const result = registerUserSchema.safeParse({
                ...validPayload,
                confirmPassword: true,
            });

            assert.isFalse(result.success);

            assert.isTrue(
                result.error.issues.some(
                    (issue) =>
                        issue.code === "unrecognized_keys" &&
                        issue.keys.includes("confirmPassword"),
                ),
            );
        });

        test.each([
            {
                scenario: "nome muito curto",
                override: { name: "A" },
                field: "name",
                message: "Nome de exibição deve ter pelo menos 2 caracteres",
            },
            {
                scenario: "nome muito longo",
                override: { name: "A".repeat(65) },
                field: "name",
                message: "Nome de exibição muito grande. Máximo: 64 caracteres",
            },
            {
                scenario: "nome contendo apenas espaços",
                override: { name: "     " },
                field: "name",
                message: "Nome de exibição deve ter pelo menos 2 caracteres",
            },
            {
                scenario: "nome com caracteres inválidos",
                override: { name: "Pedro!" },
                field: "name",
                message: "Use apenas letras, números, espaços, hífens, apóstrofos e sublinhados",
            },
            {
                scenario: "e-mail com formato inválido",
                override: { email: "email-invalido" },
                field: "email",
                message: "Email inválido",
            },
            {
                scenario: "senha muito curta",
                override: { password: "1234567" },
                field: "password",
                message: "Senha deve ter pelo menos 8 caracteres",
            },
            {
                scenario: "senha muito longa",
                override: { password: "1".repeat(71) },
                field: "password",
                message: "Senha muito grande. Máximo: 70 caracteres",
            },
            {
                scenario: "senha contendo apenas espaços",
                override: { password: "        " },
                field: "password",
                message: "A senha não pode conter apenas espaços",
            },
        ])("deve rejeitar $scenario", ({ override, field, message }) => {
            const result = registerUserSchema.safeParse({
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

        test.each([
            {
                scenario: "nome numérico",
                override: { name: 123 },
                field: "name",
            },
            {
                scenario: "e-mail numérico",
                override: { email: 123 },
                field: "email",
            },
            {
                scenario: "senha numérica",
                override: { password: 123 },
                field: "password",
            },
        ])("deve rejeitar $scenario", ({ override, field }) => {
            const result = registerUserSchema.safeParse({
                ...validPayload,
                ...override,
            });

            assert.isFalse(result.success);

            assert.isTrue(
                result.error.issues.some(
                    (issue) => issue.path[0] === field && issue.code === "invalid_type",
                ),
            );
        });

        test.each(["name", "email", "password"] as const)(
            "deve rejeitar registro sem o campo %s",
            (field) => {
                const payload: Partial<typeof validPayload> = { ...validPayload };

                delete payload[field];

                const result = registerUserSchema.safeParse(payload);

                assert.isFalse(result.success);

                assert.isTrue(result.error.issues.some((issue) => issue.path[0] === field));
            },
        );

        test.each([
            {
                scenario: "limites mínimos",
                override: {
                    name: "AB",
                    password: "1".repeat(8),
                },
            },
            {
                scenario: "limites máximos",
                override: {
                    name: "A".repeat(64),
                    password: "1".repeat(70),
                },
            },
            {
                scenario: "nome com caracteres especiais",
                override: { name: "João D'Ávila-Silva" },
            },
        ])("deve aceitar $scenario", ({ override }) => {
            const payload = {
                ...validPayload,
                ...override,
            };

            const result = registerUserSchema.safeParse(payload);

            assert.isTrue(result.success);

            assert.deepEqual(result.data, {
                name: payload.name,
                email: payload.email,
                password: payload.password,
            });
        });
    });

    describe("loginUserSchema", () => {
        const validPayload = {
            email: "teste@email.com",
            password: "12345678",
        };

        test("deve normalizar o e-mail e preservar a senha no login", () => {
            const result = loginUserSchema.parse({
                email: "  TESTE@EMAIL.COM  ",
                password: "12345678",
            });

            assert.deepEqual(result, {
                email: "teste@email.com",
                password: "12345678",
            });
        });

        test("deve rejeitar propriedades não permitidas no login do usuário", () => {
            const result = loginUserSchema.safeParse({
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
            const result = loginUserSchema.safeParse({
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

        test.each([
            {
                scenario: "e-mail numérico",
                override: { email: 123 },
                field: "email",
            },
            {
                scenario: "senha numérica",
                override: { password: 123 },
                field: "password",
            },
        ])("deve rejeitar $scenario", ({ override, field }) => {
            const result = loginUserSchema.safeParse({
                ...validPayload,
                ...override,
            });

            assert.isFalse(result.success);

            assert.isTrue(
                result.error.issues.some(
                    (issue) => issue.path[0] === field && issue.code === "invalid_type",
                ),
            );
        });

        test.each(["email", "password"] as const)("deve rejeitar login sem o campo %s", (field) => {
            const payload: Partial<typeof validPayload> = { ...validPayload };

            delete payload[field];

            const result = loginUserSchema.safeParse(payload);

            assert.isFalse(result.success);

            assert.isTrue(result.error.issues.some((issue) => issue.path[0] === field));
        });

        test.each([
            {
                scenario: "senha com tamanho mínimo",
                override: { password: "1" },
            },
            {
                scenario: "senha com tamanho máximo",
                override: { password: "1".repeat(70) },
            },
            {
                scenario: "senha com espaços nas extremidades",
                override: { password: "  senha123  " },
            },
        ])("deve aceitar $scenario", ({ override }) => {
            const payload = {
                ...validPayload,
                ...override,
            };

            const result = loginUserSchema.safeParse(payload);

            assert.isTrue(result.success);

            assert.deepEqual(result.data, {
                email: payload.email,
                password: payload.password,
            });
        });
    });

    describe("updateUserSchema", () => {
        test("deve normalizar o nome do usuário ao atualizar o perfil", () => {
            const result = updateUserSchema.parse({ name: "  João   Silva  " });

            assert.deepEqual(result, { name: "João Silva" });
        });

        test("deve rejeitar propriedades não permitidas na atualização do perfil", () => {
            const result = updateUserSchema.safeParse({
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

        test.each([
            {
                scenario: "nome numérico",
                payload: { name: 123 },
            },
            {
                scenario: "nome asusente",
                payload: {},
            },
        ])("deve rejeitar $scenario", ({ payload }) => {
            const result = updateUserSchema.safeParse(payload);

            assert.isFalse(result.success);

            assert.isTrue(
                result.error.issues.some(
                    (issue) => issue.path[0] === "name" && issue.code === "invalid_type",
                ),
            );
        });
    });
});

describe("limite de bytes da nova senha", () => {
    const schemas = [
        {
            name: "cadastro",
            schema: registerUserSchema,
            payload: { name: "Jogador", email: "teste@email.com" },
        },
        {
            name: "redefinição",
            schema: resetPasswordSchema,
            payload: { resetToken: "a".repeat(64) },
        },
        {
            name: "alteração",
            schema: changePasswordSchema,
            payload: { currentPassword: "senha antiga123" },
        },
    ];

    test.each(schemas)(
        "deve aceitar exatamente 72 bytes no fluxo de $name",
        ({ schema, payload }) => {
            for (const password of ["é".repeat(36), "🎮".repeat(18)]) {
                const result = schema.safeParse({ ...payload, password });

                assert.isTrue(result.success);
                assert.equal(result.data.password, password);
            }
        },
    );

    test.each(schemas)(
        "deve rejeitar mais de 72 bytes no fluxo de $name",
        ({ schema, payload }) => {
            for (const password of ["é".repeat(36) + "a", "🎮".repeat(19)]) {
                const result = schema.safeParse({ ...payload, password });

                assert.isFalse(result.success);
                assert.isTrue(
                    result.error.issues.some(
                        (issue) =>
                            issue.path[0] === "password" &&
                            issue.message ===
                                "Senha muito grande. Use menos caracteres; acentos e emojis ocupam mais espaço.",
                    ),
                );
            }
        },
    );

    test("deve manter a senha antiga com mais de 72 bytes no login e na confirmação da senha atual", () => {
        const password = "é".repeat(40);

        assert.equal(
            loginUserSchema.parse({ email: "teste@email.com", password }).password,
            password,
        );
        assert.equal(
            changePasswordSchema.parse({ currentPassword: password, password: "nova senha123" })
                .currentPassword,
            password,
        );
    });
});

describe("nome de exibição", () => {
    test.each(["Pedro_99", "xXPedroFodaXx", "_a_", "123", "João D’Ávila", "Ana-Maria"])(
        "deve aceitar e preservar %s no cadastro e na edição",
        (name) => {
            const payload = { name, email: "teste@email.com", password: "12345678" };

            assert.equal(registerUserSchema.parse(payload).name, name);
            assert.equal(updateUserSchema.parse({ name }).name, name);
        },
    );

    test.each(["___", "-- '", "*         a   _!#         ", "<script>", "Pedro🙂"])(
        "deve rejeitar %s no cadastro e na edição",
        (name) => {
            const payload = { name, email: "teste@email.com", password: "12345678" };

            assert.isFalse(registerUserSchema.safeParse(payload).success);
            assert.isFalse(updateUserSchema.safeParse({ name }).success);
        },
    );

    test("deve normalizar espaços sem alterar o apelido", () => {
        const result = updateUserSchema.parse({ name: "   xXPedro_99   Silva  " });

        assert.equal(result.name, "xXPedro_99 Silva");
    });
});
