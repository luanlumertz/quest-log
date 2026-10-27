import { assert, describe, test } from "vitest";

import {
    loginSchema,
    registerSchema,
    updateSchema,
    forgotPasswordSchema,
    resetPasswordSchema,
    changePasswordSchema,
} from "../../../src/schema/auth.schema";

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

    describe("Recuperação e troca de senha", () => {
        const passwords = { password: "nova senha123", confirmPassword: "nova senha123" };

        test("deve normalizar o e-mail da recuperação", () => {
            assert.deepEqual(forgotPasswordSchema.parse({ email: "  JOAO@EMAIL.COM  " }), {
                email: "joao@email.com",
            });
        });

        test.each([
            { name: "resetPasswordSchema", schema: resetPasswordSchema, payload: passwords },
            {
                name: "changePasswordSchema",
                schema: changePasswordSchema,
                payload: { ...passwords, currentPassword: "senha anterior123" },
            },
        ])(
            "$name deve remover a confirmação e rejeitar confirmações diferentes",
            ({ schema, payload }) => {
                const parsed = schema.parse(payload);
                const invalid = schema.safeParse({ ...payload, confirmPassword: "outra senha123" });

                assert.equal(parsed.password, passwords.password);
                assert.notProperty(parsed, "confirmPassword");
                assert.isFalse(invalid.success);
                assert.isTrue(
                    invalid.error.issues.some((issue) => issue.path[0] === "confirmPassword"),
                );
            },
        );

        test.each([
            {
                name: "senha atual vazia",
                currentPassword: "",
                password: "nova senha123",
                field: "currentPassword",
            },
            {
                name: "nova senha igual à atual",
                currentPassword: "nova senha123",
                password: "nova senha123",
                field: "password",
            },
        ])("deve rejeitar $name", ({ currentPassword, password, field }) => {
            const result = changePasswordSchema.safeParse({
                currentPassword,
                password,
                confirmPassword: password,
            });

            assert.isFalse(result.success);
            assert.isTrue(result.error.issues.some((issue) => issue.path[0] === field));
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

describe("limite de bytes da nova senha", () => {
    const schemas = [
        {
            name: "cadastro",
            schema: registerSchema,
            payload: { name: "Jogador", email: "teste@email.com" },
        },
        { name: "redefinição", schema: resetPasswordSchema, payload: {} },
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
                const result = schema.safeParse({
                    ...payload,
                    password,
                    confirmPassword: password,
                });

                assert.isTrue(result.success);
                assert.equal(result.data.password, password);
            }
        },
    );

    test.each(schemas)(
        "deve rejeitar mais de 72 bytes no fluxo de $name",
        ({ schema, payload }) => {
            for (const password of ["é".repeat(36) + "a", "🎮".repeat(19)]) {
                const result = schema.safeParse({
                    ...payload,
                    password,
                    confirmPassword: password,
                });

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

        assert.equal(loginSchema.parse({ email: "teste@email.com", password }).password, password);
        assert.equal(
            changePasswordSchema.parse({
                currentPassword: password,
                password: "nova senha123",
                confirmPassword: "nova senha123",
            }).currentPassword,
            password,
        );
    });
});

describe("nome de exibição", () => {
    test.each(["Pedro_99", "xXPedroFodaXx", "_a_", "123", "João D’Ávila", "Ana-Maria"])(
        "deve aceitar e preservar %s no cadastro e na edição",
        (name) => {
            const payload = {
                name,
                email: "teste@email.com",
                password: "12345678",
                confirmPassword: "12345678",
            };

            assert.equal(registerSchema.parse(payload).name, name);
            assert.equal(updateSchema.parse({ name }).name, name);
        },
    );

    test.each(["___", "-- '", "*         a   _!#         ", "<script>", "Pedro🙂"])(
        "deve rejeitar %s no cadastro e na edição",
        (name) => {
            const payload = {
                name,
                email: "teste@email.com",
                password: "12345678",
                confirmPassword: "12345678",
            };

            assert.isFalse(registerSchema.safeParse(payload).success);
            assert.isFalse(updateSchema.safeParse({ name }).success);
        },
    );

    test("deve normalizar espaços sem alterar o apelido", () => {
        const result = updateSchema.parse({ name: "   xXPedro_99   Silva  " });

        assert.equal(result.name, "xXPedro_99 Silva");
    });
});
