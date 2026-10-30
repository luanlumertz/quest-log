import type { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import z from "zod";
import { PASSWORD_RESET_TOKEN_EXPIRES_IN_MS } from "../../constants/auth.js";
import { messageResponseSchema } from "../shared/error.schemas.js";
import {
    clearedSessionCookieHeaders,
    csrfErrorResponse,
    csrfHeadersSchema,
    internalErrorResponse,
    jsonErrorResponses,
    messageResponse,
    passwordValidationErrorResponse,
    sessionCookieHeaders,
    swaggerSessionInstructions,
    validationErrorResponse,
} from "./auth.responses.js";
import {
    changePasswordRequestSchema,
    requestPasswordRecoveryRequestSchema,
    resetPasswordRequestSchema,
    verifyPasswordRecoveryRequestSchema,
} from "./auth.schemas.js";

export function registerPasswordPaths(registry: OpenAPIRegistry) {
    for (const operation of [
        {
            path: "/auth/password/forgot",
            operationId: "requestPasswordRecovery",
            summary: "Solicitar recuperação de senha",
        },
        {
            path: "/auth/password/resend",
            operationId: "resendPasswordRecoveryCode",
            summary: "Reenviar código de recuperação de senha",
        },
    ]) {
        registry.registerPath({
            method: "post",
            ...operation,
            tags: ["Senha"],
            description: `Solicita o envio de um código de seis dígitos, válido por dez minutos. Retorna a mesma resposta 202 para e-mail existente ou inexistente, cooldown, limite por conta e falhas posteriores de envio. O processamento ocorre em segundo plano; 202 não garante que um e-mail foi enviado. Solicitação e reenvio compartilham o limite por IP. Por conta, há cooldown de sessenta segundos e limite de dez envios por hora. Um novo envio válido substitui o código e a autorização de redefinição anteriores. No ambiente local, consulte o Mailpit em http://localhost:8025. ${swaggerSessionInstructions}`,
            security: [],
            request: {
                headers: csrfHeadersSchema,
                body: {
                    required: true,
                    content: {
                        "application/json": {
                            schema: requestPasswordRecoveryRequestSchema,
                            example: { email: "jogador@example.com" },
                        },
                    },
                },
            },
            responses: {
                202: messageResponse(
                    "Solicitação recebida sem revelar se a conta existe.",
                    "Se houver uma conta com este e-mail, enviaremos um código de recuperação. Aguarde 60 segundos antes de solicitar outro.",
                ),
                ...jsonErrorResponses,
                403: csrfErrorResponse,
                422: validationErrorResponse,
                429: messageResponse(
                    "Dez solicitações por IP em uma hora, compartilhadas entre solicitação e reenvio.",
                    "Muitas solicitações de recuperação. Tente novamente mais tarde.",
                ),
            },
        });
    }

    registry.registerPath({
        method: "post",
        path: "/auth/password/verify",
        operationId: "verifyPasswordRecovery",
        tags: ["Senha"],
        summary: "Verificar código de recuperação",
        description: `Confere o código de seis dígitos, consome-o e retorna resetToken para /auth/password/reset. O token é de uso único e vale dez minutos; expiresIn é informado em segundos. Após cinco tentativas incorretas, o código é rejeitado com 400, sem diferenciar conta inexistente, código inválido, expirado ou consumido. Não autentica a conta e não define cookies. ${swaggerSessionInstructions}`,
        security: [],
        request: {
            headers: csrfHeadersSchema,
            body: {
                required: true,
                content: {
                    "application/json": {
                        schema: verifyPasswordRecoveryRequestSchema,
                        example: { email: "jogador@example.com", code: "123456" },
                    },
                },
            },
        },
        responses: {
            200: {
                description: "Redefinição autorizada. Guarde o token para a próxima etapa.",
                headers: { "Cache-Control": { schema: { type: "string" }, example: "no-store" } },
                content: {
                    "application/json": {
                        schema: z.object({
                            resetToken: z.string().regex(/^[a-f0-9]{64}$/),
                            expiresIn: z.literal(PASSWORD_RESET_TOKEN_EXPIRES_IN_MS / 1000),
                        }),
                        example: {
                            resetToken: "a".repeat(64),
                            expiresIn: PASSWORD_RESET_TOKEN_EXPIRES_IN_MS / 1000,
                        },
                    },
                },
            },
            ...jsonErrorResponses,
            400: {
                description:
                    "Código inválido, expirado, consumido, limite de tentativas do código atingido, conta inexistente ou JSON malformado.",
                content: {
                    "application/json": {
                        schema: messageResponseSchema,
                        examples: {
                            code: { value: { message: "Código inválido ou expirado." } },
                            json: { value: { message: "JSON malformado" } },
                        },
                    },
                },
            },
            403: csrfErrorResponse,
            422: validationErrorResponse,
            429: messageResponse(
                "Trinta requisições por IP em quinze minutos.",
                "Muitas tentativas de verificação. Tente novamente mais tarde.",
            ),
            500: internalErrorResponse,
        },
    });

    registry.registerPath({
        method: "post",
        path: "/auth/password/reset",
        operationId: "resetPassword",
        tags: ["Senha"],
        summary: "Redefinir senha com autorização de recuperação",
        description: `Usa resetToken de /auth/password/verify e uma nova senha diferente da atual. Consome o token, troca a senha, revoga todas as sessões, remove os dados de recuperação e limpa os cookies locais. Não faz login automaticamente: entre novamente. Um aviso de alteração é enviado por e-mail; falhas nesse aviso não desfazem a operação. ${swaggerSessionInstructions}`,
        security: [],
        request: {
            headers: csrfHeadersSchema,
            body: {
                required: true,
                content: {
                    "application/json": {
                        schema: resetPasswordRequestSchema,
                        example: { resetToken: "a".repeat(64), password: "NovaSenhaDeExemplo123!" },
                    },
                },
            },
        },
        responses: {
            204: {
                description: "Senha redefinida, sessões revogadas e cookies limpos. Sem corpo.",
                headers: clearedSessionCookieHeaders,
            },
            ...jsonErrorResponses,
            400: {
                description: "Autorização inválida, expirada ou já consumida, ou JSON malformado.",
                content: {
                    "application/json": {
                        schema: messageResponseSchema,
                        examples: {
                            token: {
                                value: {
                                    message:
                                        "Autorização inválida ou expirada. Solicite um novo código.",
                                },
                            },
                            json: { value: { message: "JSON malformado" } },
                        },
                    },
                },
            },
            403: csrfErrorResponse,
            422: passwordValidationErrorResponse,
            429: messageResponse(
                "Dez requisições por IP em quinze minutos.",
                "Muitas tentativas de redefinição de senha. Tente novamente mais tarde.",
            ),
            500: internalErrorResponse,
        },
    });

    registry.registerPath({
        method: "patch",
        path: "/auth/me/password",
        operationId: "changePassword",
        tags: ["Senha"],
        summary: "Alterar senha da conta autenticada",
        description: `Exige sessão autenticada, senha atual correta e nova senha diferente da atual. Troca a senha, revoga as outras sessões e autorizações de recuperação e mantém o navegador atual conectado com novos cookies. Envia um aviso por e-mail; falhas no aviso não desfazem a alteração. ${swaggerSessionInstructions}`,
        security: [{ cookieAuth: [] }],
        request: {
            headers: csrfHeadersSchema,
            body: {
                required: true,
                content: {
                    "application/json": {
                        schema: changePasswordRequestSchema,
                        example: {
                            currentPassword: "SenhaDeExemplo123!",
                            password: "NovaSenhaDeExemplo123!",
                        },
                    },
                },
            },
        },
        responses: {
            204: {
                description: "Senha alterada e sessão atual renovada. Sem corpo.",
                headers: sessionCookieHeaders,
            },
            ...jsonErrorResponses,
            400: {
                description: "Senha atual incorreta ou JSON malformado.",
                content: {
                    "application/json": {
                        schema: messageResponseSchema,
                        examples: {
                            password: { value: { message: "Senha atual incorreta." } },
                            json: { value: { message: "JSON malformado" } },
                        },
                    },
                },
            },
            401: {
                description: "Sessão não autenticada ou invalidada durante a troca de senha.",
                content: {
                    "application/json": {
                        schema: messageResponseSchema,
                        examples: {
                            unauthenticated: { value: { message: "Não autenticado" } },
                            changed: {
                                value: {
                                    message:
                                        "Sessão inválida. Entre novamente para alterar a senha.",
                                },
                            },
                        },
                    },
                },
            },
            403: csrfErrorResponse,
            422: passwordValidationErrorResponse,
            429: messageResponse(
                "Dez requisições por usuário e trinta por IP em quinze minutos. O limite por IP é verificado antes da autenticação.",
                "Muitas tentativas de alteração de senha. Tente novamente mais tarde.",
            ),
            500: internalErrorResponse,
        },
    });
}
