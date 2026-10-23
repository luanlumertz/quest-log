import { createContext, useContext } from "react";
import type { RegisterData, RegisterFormData } from "../schema/auth.schema";
import type { PendingRegistration, RegistrationResponse } from "../types/auth.types";

type RegistrationContextType = {
    pending: PendingRegistration | null;
    draft: RegisterFormData | null;
    submittedData: RegisterData | null;
    setDraft: (draft: RegisterFormData) => void;
    saveRegistration: (response: RegistrationResponse, data: RegisterData) => void;
    renewResendCooldown: (pendingRegistrationId: string) => void;
    discardPendingRegistration: (pendingRegistrationId?: string) => void;
    clearRegistration: () => void;
};

export const RegistrationContext = createContext<RegistrationContextType | null>(null);

export function useRegistration() {
    const context = useContext(RegistrationContext);
    if (!context) {
        throw new Error("useRegistration deve ser usado dentro de RegistrationProvider");
    }
    return context;
}
