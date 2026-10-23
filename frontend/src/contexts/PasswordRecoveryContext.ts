import { createContext, useContext } from "react";
import type {
    PasswordRecovery,
    PasswordResetAuthorization,
    PasswordResetResponse,
} from "../types/auth.types";

type PasswordRecoveryContextType = {
    recovery: PasswordRecovery | null;
    authorization: PasswordResetAuthorization | null;
    saveRecovery: (email: string) => void;
    renewResendCooldown: (expected: PasswordRecovery) => void;
    saveAuthorization: (expected: PasswordRecovery, response: PasswordResetResponse) => boolean;
    discardAuthorization: () => void;
    clearRecovery: () => void;
};

export const PasswordRecoveryContext = createContext<PasswordRecoveryContextType | null>(null);

export function usePasswordRecovery() {
    const context = useContext(PasswordRecoveryContext);
    if (!context) {
        throw new Error("usePasswordRecovery deve ser usado dentro de PasswordRecoveryProvider");
    }

    return context;
}
