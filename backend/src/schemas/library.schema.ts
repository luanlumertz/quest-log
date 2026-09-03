import z from "zod";

const platformSchema = z.enum(
    [
        "PC",
        "PLAYSTATION_5",
        "PLAYSTATION_4",
        "XBOX_SERIES",
        "XBOX_ONE",
        "NINTENDO_SWITCH",
        "NINTENDO_SWITCH_2",
        "ANDROID",
        "IOS",
        "OTHER"
    ],
    {
        error: "Plataforma inválida"
    }
);

export const addGameToLibrarySchema = z
    .object({
        externalId: z
            .number({
                error: "O externalId deve ser um número"
            })
            .int({
                error: "O externalId deve ser um número inteiro"
            }),

        status: z.enum(
            [
                "WANT_TO_PLAY",
                "PLAYING",
                "COMPLETED",
                "ABANDONED"
            ],
            {
                error: "Status inválido"
            }
        ),

        platforms: z
            .array(platformSchema, {
                error: "As plataformas devem ser enviadas em uma lista"
            })
            .min(1, {
                error: "Informe pelo menos uma plataforma"
            })
            .refine(
                (platforms) =>
                    new Set(platforms).size === platforms.length,
                {
                    error: "Não é permitido repetir plataformas"
                }
            ),

        otherPlatforms: z
            .array(
                z
                    .string({
                        error: "A outra plataforma deve ser um texto"
                    })
                    .trim()
                    .min(1, {
                        error: "Informe o nome da outra plataforma"
                    })
            )
            .min(1, {
                error: "Informe pelo menos uma outra plataforma"
            })
            .refine(
                (platforms) => {
                    const normalizedPlatforms = platforms.map((platform) => platform.toLowerCase());
                    return (new Set(normalizedPlatforms).size === normalizedPlatforms.length);
                },
                {
                    error: "Não é permitido repetir outras plataformas"
                }
            )
            .optional()
    })
    .strict()
    .refine(
        (data) => {
            if (data.platforms.includes("OTHER")) {
                return data.otherPlatforms !== undefined;
            }

            return true;
        },
        {
            error: "Informe pelo menos uma outra plataforma",
            path: ["otherPlatforms"]
        }
    )
    .refine(
        (data) => {
            if (!data.platforms.includes("OTHER")) {
                return data.otherPlatforms === undefined;
            }

            return true;
        },
        {
            error: "Outras plataformas só podem ser informadas quando OTHER estiver selecionado",
            path: ["otherPlatforms"]
        }
    );