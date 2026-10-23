import { MemoryRouter, Route, Routes } from "react-router";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { Register } from "../../src/pages/Register";
import { VerifyRegistration } from "../../src/pages/VerifyRegistration";
import { Login } from "../../src/pages/Login";
import { AuthContext } from "../../src/contexts/AuthContext";
import { RegistrationProvider } from "../../src/contexts/RegistrationProvider";
import type { PendingRegistration } from "../../src/types/auth.types";

import { createAuthContextMock } from "../mocks/authContext.mock";

export const registrationResponse = {
    pendingRegistrationId: "11111111-1111-4111-8111-111111111111",
    email: "joao@email.com",
};

export function makePendingRegistration(
    overrides: Partial<PendingRegistration> = {},
): PendingRegistration {
    return {
        ...registrationResponse,
        expiresAt: Date.now() + 30 * 60 * 1000,
        resendAvailableAt: Date.now() + 60 * 1000,
        ...overrides,
    };
}

export function renderRegistrationFlow(initialPath = "/register") {
    return render(
        <AuthContext.Provider value={createAuthContextMock()}>
            <MemoryRouter initialEntries={[initialPath]}>
                <Routes>
                    <Route element={<RegistrationProvider />}>
                        <Route path="/register" element={<Register />} />
                        <Route path="/register/verify" element={<VerifyRegistration />} />
                    </Route>
                    <Route path="/login" element={<Login />} />
                </Routes>
            </MemoryRouter>
        </AuthContext.Provider>,
    );
}

export async function fillRegistrationForm(user: ReturnType<typeof userEvent.setup>) {
    await user.type(screen.getByRole("textbox", { name: "Nome" }), "João Silva");
    await user.type(screen.getByRole("textbox", { name: "Email" }), "joao@email.com");
    await user.type(screen.getByLabelText("Senha"), "12345678");
    await user.type(screen.getByLabelText("Confirme sua senha"), "12345678");
}
