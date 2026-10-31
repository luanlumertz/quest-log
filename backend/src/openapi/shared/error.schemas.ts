import z from "zod";
import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";

extendZodWithOpenApi(z);

export const messageResponseSchema = z.object({ message: z.string() }).openapi("MessageResponse", {
    description:
        "Resposta com mensagem. Usada nos erros e nas operações que retornam uma confirmação textual.",
});

export const validationErrorResponseSchema = z
    .object({
        error: z.literal("Erro de Validação"),
        issues: z.array(
            z.looseObject({
                code: z.string(),
                path: z.array(z.union([z.string(), z.number()])),
                message: z.string(),
            }),
        ),
    })
    .openapi("ValidationErrorResponse", {
        description:
            "Falha de validação com uma lista de problemas. Cada item identifica o código, o caminho do campo e a mensagem; pode incluir informações adicionais do Zod.",
    });
