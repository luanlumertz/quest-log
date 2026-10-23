import { useRef, useState } from "react";
import { Outlet } from "react-router";
import { RegistrationContext } from "./RegistrationContext";
import type { RegisterData, RegisterFormData } from "../schema/auth.schema";
import type { RegistrationResponse } from "../types/auth.types";
import {
    readPendingRegistration,
    storePendingRegistration,
    REGISTRATION_LIFETIME_MS,
    REGISTRATION_RESEND_COOLDOWN_MS,
} from "../lib/registrationSession";

export function RegistrationProvider() {
    const [pending, setPending] = useState(readPendingRegistration);
    const pendingRef = useRef(pending);
    const [draft, setDraft] = useState<RegisterFormData | null>(null);
    const [submittedData, setSubmittedData] = useState<RegisterData | null>(null);

    function saveRegistration(response: RegistrationResponse, data: RegisterData) {
        const now = Date.now();
        const next = {
            pendingRegistrationId: response.pendingRegistrationId,
            email: response.email,
            expiresAt: now + REGISTRATION_LIFETIME_MS,
            resendAvailableAt: now + REGISTRATION_RESEND_COOLDOWN_MS,
        };
        pendingRef.current = next;
        setPending(next);
        storePendingRegistration(next);
        setSubmittedData(data);
    }

    function renewResendCooldown(pendingRegistrationId: string) {
        const current = pendingRef.current;
        if (!current || current.pendingRegistrationId !== pendingRegistrationId) return;
        const next = {
            ...current,
            resendAvailableAt: Date.now() + REGISTRATION_RESEND_COOLDOWN_MS,
        };
        pendingRef.current = next;
        setPending(next);
        storePendingRegistration(next);
    }

    function discardPendingRegistration(pendingRegistrationId?: string) {
        // Uma resposta atrasada do reenvio não pode limpar uma tentativa mais recente.
        if (
            pendingRegistrationId &&
            pendingRef.current?.pendingRegistrationId !== pendingRegistrationId
        )
            return;
        pendingRef.current = null;
        setPending(null);
        setSubmittedData(null);
        storePendingRegistration(null);
    }

    function clearRegistration() {
        discardPendingRegistration();
        setDraft(null);
    }

    return (
        <RegistrationContext.Provider
            value={{
                pending,
                draft,
                submittedData,
                setDraft,
                saveRegistration,
                renewResendCooldown,
                discardPendingRegistration,
                clearRegistration,
            }}
        >
            <Outlet />
        </RegistrationContext.Provider>
    );
}
