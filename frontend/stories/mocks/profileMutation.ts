import { mocked } from "storybook/test";
import {
    changePassword,
    deleteCurrentUser,
    logout,
    updateCurrentUser,
} from "../../src/services/auth.service";
import { ApiError } from "../../src/services/api";
import type { User } from "../../src/types/auth.types";
import { demoProfileUser } from "../fixtures/profile";

type Mode = "success" | "slow" | "error";
let profileUser = { ...demoProfileUser };

export function setProfileDemoUser(user: User) {
    profileUser = { ...user };
}

async function simulateRequest(mode: Mode) {
    await new Promise((resolve) => window.setTimeout(resolve, mode === "slow" ? 2500 : 350));
    if (mode === "error") throw new Error("Falha simulada do serviço.");
}

export function configureAccountUpdate(mode: Mode = "success") {
    mocked(updateCurrentUser).mockImplementation(async (data) => {
        await simulateRequest(mode);
        profileUser = { ...profileUser, name: data.name };
        return { ...profileUser };
    });
}

export function configurePasswordChange(
    mode: Mode | "current-password-error" | "rejected-password" = "success",
) {
    mocked(changePassword).mockImplementation(async () => {
        await simulateRequest(mode === "slow" ? "slow" : "success");
        if (mode === "current-password-error")
            throw new ApiError("Senha atual incorreta. Resposta simulada.", 401);
        if (mode === "rejected-password")
            throw new ApiError(
                "Esta senha não pode ser utilizada. Escolha outra. Resposta simulada.",
                422,
            );
        if (mode === "error") throw new Error("Falha simulada do serviço.");
    });
}

export function configureProfileLogout(mode: Mode = "success") {
    mocked(logout).mockImplementation(() => simulateRequest(mode));
}

export function configureAccountDeletion(mode: Mode = "success") {
    mocked(deleteCurrentUser).mockImplementation(() => simulateRequest(mode));
}
