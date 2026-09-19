import z from "zod";
import { GAME_STATUSES } from "../types/game.types";


export const addGameToLibraryFormSchema = z.object({
    status: z.enum(GAME_STATUSES, { error: "Selecione um status válido" }),

    platforms: z
        .array(z.string())
        .min(1, { error: "Selecione pelo menos uma plataforma" })
});

export type AddGameToLibraryFormData = z.infer<typeof addGameToLibraryFormSchema>;
