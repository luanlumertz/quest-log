import { mailDeliveryInstructions } from "../shared/usage.js";
import type { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import z from "zod";
import { messageResponseSchema } from "../shared/error.schemas.js";
import {
    resendRegistrationCodeSchema,
    verifyRegistrationSchema,
} from "../../schemas/auth.schema.js";
import {
    csrfErrorResponse,
    csrfHeadersSchema,
    internalErrorResponse,
    jsonErrorResponses,
    messageResponse,
    swaggerSessionInstructions,
    validationErrorResponse,
} from "./auth.responses.js";
import { registerRequestSchema, userResponseSchema } from "./auth.schemas.js";

export function registerRegistrationPaths(registry: OpenAPIRegistry) {
    registry.registerPath({
        method: "post",
        path: "/auth/register",
        operationId: "registerUser",
        tags: ["Cadastro"],
        summary: "Iniciar cadastro e enviar código de verificação",
        description: `Cria ou atualiza um cadastro pendente e envia um código de seis dígitos. Uma nova solicitação para o mesmo e-mail substitui o ID e o código pendentes anteriores. O código vale dez minutos e o cadastro pendente vale trinta minutos. A conta só é criada após POST /auth/register/verify. Use pendingRegistrationId retornado nas próximas etapas. ${mailDeliveryInstructions} ${swaggerSessionInstructions}`,
        security: [],
        request: {
            headers: csrfHeadersSchema,
            body: {
                required: true,
                content: {
                    "application/json": {
                        schema: registerRequestSchema,
                        example: {
                            name: "Jogador",
                            email: "jogador@example.com",
                            password: "SenhaDeExemplo123!",
                        },
                    },
                },
            },
        },
        responses: {
            202: {
                description: "Cadastro pendente salvo e código enviado. Não autentica o usuário.",
                content: {
                    "application/json": {
                        schema: z.object({ pendingRegistrationId: z.uuid(), email: z.email() }),
                        example: {
                            pendingRegistrationId: "123e4567-e89b-42d3-a456-426614174000",
                            email: "jogador@example.com",
                        },
                    },
                },
            },
            ...jsonErrorResponses,
            403: csrfErrorResponse,
            409: {
                description:
                    "E-mail já cadastrado ou conflito persistente entre solicitações concorrentes.",
                content: {
                    "application/json": {
                        schema: messageResponseSchema,
                        examples: {
                            email: { value: { message: "Este e-mail já está em uso" } },
                            concurrent: {
                                value: {
                                    message:
                                        "Não foi possível iniciar o cadastro neste momento. Tente novamente.",
                                },
                            },
                        },
                    },
                },
            },
            422: validationErrorResponse,
            429: messageResponse(
                "Limite de dez solicitações por IP em uma hora.",
                "Muitas tentativas de cadastro. Tente novamente mais tarde.",
            ),
            500: internalErrorResponse,
            503: messageResponse(
                "Falha no envio do e-mail. O código dessa tentativa é invalidado.",
                "Não foi possível enviar o código de verificação. Tente novamente.",
            ),
        },
    });

    registry.registerPath({
        method: "post",
        path: "/auth/register/verify",
        operationId: "verifyRegistration",
        tags: ["Cadastro"],
        summary: "Verificar código e concluir cadastro",
        description: `Recebe o ID do cadastro pendente e o código de seis dígitos enviado por e-mail. Cria a conta e consome o cadastro pendente. Não define cookies: faça login após a confirmação. Há um limite de cinco tentativas incorretas por código, além do limite por IP. ${swaggerSessionInstructions}`,
        security: [],
        request: {
            headers: csrfHeadersSchema,
            body: {
                required: true,
                content: {
                    "application/json": {
                        schema: verifyRegistrationSchema,
                        example: {
                            pendingRegistrationId: "123e4567-e89b-42d3-a456-426614174000",
                            code: "123456",
                        },
                    },
                },
            },
        },
        responses: {
            201: {
                description: "Conta criada e e-mail verificado.",
                content: {
                    "application/json": {
                        schema: z.object({ user: userResponseSchema }),
                        example: { user: { id: 1, name: "Jogador", email: "jogador@example.com" } },
                    },
                },
            },
            ...jsonErrorResponses,
            400: {
                description:
                    "JSON malformado, código incorreto ou cadastro/código expirado ou inexistente.",
                content: {
                    "application/json": {
                        schema: messageResponseSchema,
                        examples: {
                            json: { value: { message: "JSON malformado" } },
                            invalid: { value: { message: "Código inválido." } },
                            expired: { value: { message: "Código inválido ou expirado." } },
                        },
                    },
                },
            },
            403: csrfErrorResponse,
            409: messageResponse(
                "O e-mail já pertence a uma conta ao concluir o cadastro.",
                "Este e-mail já está em uso",
            ),
            422: validationErrorResponse,
            429: {
                description:
                    "Limite de cinco tentativas incorretas por código ou 30 requisições por IP em quinze minutos.",
                content: {
                    "application/json": {
                        schema: messageResponseSchema,
                        examples: {
                            code: { value: { message: "Limite de tentativas excedido." } },
                            ip: {
                                value: {
                                    message:
                                        "Muitas tentativas de verificação. Tente novamente mais tarde.",
                                },
                            },
                        },
                    },
                },
            },
            500: internalErrorResponse,
        },
    });

    registry.registerPath({
        method: "post",
        path: "/auth/register/resend",
        operationId: "resendRegistrationCode",
        tags: ["Cadastro"],
        summary: "Reenviar código de cadastro",
        description: `Envia um novo código, invalida o anterior e reinicia as tentativas de verificação. Aguarde sessenta segundos entre envios. O novo código vale até dez minutos, respeitando a expiração do cadastro pendente. ${swaggerSessionInstructions}`,
        security: [],
        request: {
            headers: csrfHeadersSchema,
            body: {
                required: true,
                content: {
                    "application/json": {
                        schema: resendRegistrationCodeSchema,
                        example: { pendingRegistrationId: "123e4567-e89b-42d3-a456-426614174000" },
                    },
                },
            },
        },
        responses: {
            200: messageResponse("Novo código enviado.", "Novo código de verificação enviado."),
            ...jsonErrorResponses,
            400: {
                description: "Cadastro expirado ou inexistente, ou JSON malformado.",
                content: {
                    "application/json": {
                        schema: messageResponseSchema,
                        examples: {
                            expired: { value: { message: "Cadastro expirado ou não encontrado." } },
                            json: { value: { message: "JSON malformado" } },
                        },
                    },
                },
            },
            403: csrfErrorResponse,
            422: validationErrorResponse,
            429: {
                description:
                    "Cooldown de sessenta segundos, disputa entre reenvios ou limite de dez requisições por IP em quinze minutos.",
                content: {
                    "application/json": {
                        schema: messageResponseSchema,
                        examples: {
                            cooldown: {
                                value: {
                                    message: "Aguarde 60 segundos antes de reenviar o código.",
                                },
                            },
                            concurrent: {
                                value: {
                                    message: "Não foi possível reenviar o código neste momento.",
                                },
                            },
                            ip: {
                                value: {
                                    message:
                                        "Muitas solicitações de reenvio. Tente novamente mais tarde.",
                                },
                            },
                        },
                    },
                },
            },
            500: internalErrorResponse,
            503: messageResponse(
                "Falha ao enviar o novo código.",
                "Não foi possível reenviar o código. Tente novamente.",
            ),
        },
    });
}
