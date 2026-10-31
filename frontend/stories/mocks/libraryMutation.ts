import { mocked } from "storybook/test";
import { addGameToLibrary } from "../../src/services/library.service";

export function configureLibraryMutation(mode: "success" | "slow" | "error" = "success") {
    mocked(addGameToLibrary).mockImplementation(async () => {
        await new Promise((resolve) => window.setTimeout(resolve, mode === "slow" ? 2500 : 350));
        if (mode === "error")
            throw new Error("Não foi possível adicionar o jogo. Este é um erro simulado.");
    });
}
