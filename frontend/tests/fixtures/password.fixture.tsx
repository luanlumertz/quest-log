import { MemoryRouter, Route, Routes } from "react-router";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClientProvider } from "@tanstack/react-query";

import { AuthContext, type AuthContextType } from "../../src/contexts/AuthContext";
import { PasswordRecoveryProvider } from "../../src/contexts/PasswordRecoveryProvider";
import { ForgotPassword } from "../../src/pages/ForgotPassword";
import { VerifyPasswordRecovery } from "../../src/pages/VerifyPasswordRecovery";
import { ResetPassword } from "../../src/pages/ResetPassword";
import { Login } from "../../src/pages/Login";
import { Profile } from "../../src/pages/Profile";
import type { PasswordRecovery, PasswordResetResponse } from "../../src/types/auth.types";

import { createAuthContextMock } from "../mocks/authContext.mock";
import { createTestQueryClient } from "../helpers/createTestQueryClient.helper";
import { PasswordAuthorizationSeed, PasswordFlowLocation } from "./PasswordFlowControls";

export const passwordResetResponse = { resetToken: "a".repeat(64), expiresIn: 600 };

export function makePasswordRecovery(overrides: Partial<PasswordRecovery> = {}): PasswordRecovery {
    return {
        email: "joao@email.com",
        resendAvailableAt: Date.now() + 60_000,
        ...overrides,
    };
}

export function renderPasswordRecoveryFlow(
    initialPath = "/forgot-password",
    options: { auth?: Partial<AuthContextType>; authorization?: PasswordResetResponse } = {},
) {
    const authValue = createAuthContextMock(options.auth);
    const queryClient = createTestQueryClient();
    const result = render(
        <AuthContext.Provider value={authValue}>
            <QueryClientProvider client={queryClient}>
                <MemoryRouter initialEntries={[initialPath]}>
                    <Routes>
                        <Route element={<PasswordRecoveryProvider />}>
                            <Route
                                element={
                                    <PasswordAuthorizationSeed response={options.authorization} />
                                }
                            >
                                <Route path="/forgot-password" element={<ForgotPassword />} />
                                <Route
                                    path="/forgot-password/verify"
                                    element={<VerifyPasswordRecovery />}
                                />
                                <Route path="/forgot-password/reset" element={<ResetPassword />} />
                            </Route>
                        </Route>
                        <Route path="/login" element={<Login />} />
                        <Route path="/profile" element={<Profile />} />
                    </Routes>
                    <PasswordFlowLocation />
                </MemoryRouter>
            </QueryClientProvider>
        </AuthContext.Provider>,
    );

    return { ...result, authValue, queryClient };
}

export async function fillNewPasswordForm(
    user: ReturnType<typeof userEvent.setup>,
    password = "nova senha123",
    confirmation = password,
) {
    const passwordField = screen.getByLabelText("Nova senha");
    const confirmationField = screen.getByLabelText("Confirme a nova senha");

    await user.clear(passwordField);
    await user.type(passwordField, password);
    await user.clear(confirmationField);
    await user.type(confirmationField, confirmation);
}
