import { useRef, useState } from "react";
import { Outlet } from "react-router";
import { PasswordRecoveryContext } from "./PasswordRecoveryContext";
import type {
    PasswordRecovery,
    PasswordResetAuthorization,
    PasswordResetResponse,
} from "../types/auth.types";
import {
    readPasswordRecovery,
    storePasswordRecovery,
    PASSWORD_RECOVERY_RESEND_COOLDOWN_MS,
} from "../lib/passwordRecoverySession";

export function PasswordRecoveryProvider() {
    const [recovery, setRecovery] = useState(readPasswordRecovery);
    const recoveryRef = useRef(recovery);
    const [authorization, setAuthorization] = useState<PasswordResetAuthorization | null>(null);

    function saveRecovery(email: string) {
        const current = recoveryRef.current;
        const now = Date.now();
        const next = {
            email,
            resendAvailableAt:
                current?.email === email && current.resendAvailableAt > now
                    ? current.resendAvailableAt
                    : now + PASSWORD_RECOVERY_RESEND_COOLDOWN_MS,
        };
        recoveryRef.current = next;
        setRecovery(next);
        setAuthorization(null);
        storePasswordRecovery(next);
    }

    function renewResendCooldown(expected: PasswordRecovery) {
        if (recoveryRef.current !== expected) return;
        saveRecovery(expected.email);
    }

    function saveAuthorization(expected: PasswordRecovery, response: PasswordResetResponse) {
        // Uma resposta antiga não autoriza uma tentativa iniciada depois dela.
        if (recoveryRef.current !== expected) return false;

        setAuthorization({
            resetToken: response.resetToken,
            expiresAt: Date.now() + response.expiresIn * 1000,
        });
        return true;
    }

    function discardAuthorization() {
        setAuthorization(null);
    }

    function clearRecovery() {
        recoveryRef.current = null;
        setRecovery(null);
        setAuthorization(null);
        storePasswordRecovery(null);
    }

    return (
        <PasswordRecoveryContext.Provider
            value={{
                recovery,
                authorization,
                saveRecovery,
                renewResendCooldown,
                saveAuthorization,
                discardAuthorization,
                clearRecovery,
            }}
        >
            <Outlet />
        </PasswordRecoveryContext.Provider>
    );
}
