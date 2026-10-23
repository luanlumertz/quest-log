import type { UseFormRegisterReturn } from "react-hook-form";
import { AuthInput } from "./AuthInput";

type NewPasswordFieldsProps = {
    passwordRegistration: UseFormRegisterReturn;
    confirmationRegistration: UseFormRegisterReturn;
    passwordError?: string;
    confirmationError?: string;
};

export function NewPasswordFields({
    passwordRegistration,
    confirmationRegistration,
    passwordError,
    confirmationError,
}: NewPasswordFieldsProps) {
    return (
        <>
            <AuthInput
                label="Nova senha"
                type="password"
                placeholder="Digite a nova senha"
                autoComplete="new-password"
                registration={passwordRegistration}
                error={passwordError}
            />
            <AuthInput
                label="Confirme a nova senha"
                type="password"
                placeholder="Confirme a nova senha"
                autoComplete="new-password"
                registration={confirmationRegistration}
                error={confirmationError}
            />
        </>
    );
}
