import { assert, describe, expect, test, vi } from "vitest";
import { MemoryRouter, Route, Routes } from "react-router";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { Login } from "../../../src/pages/Login";
import { AuthContext } from "../../../src/contexts/AuthContext";

import { mockApiResponse } from "../../mocks/api.mock";
import { createAuthContextMock } from "../../mocks/authContext.mock";

function renderLogin() {
    const setUser = vi.fn();

    const authValue = createAuthContextMock({
        user: null,
        status: "unauthenticated",
        setUser,
    });

    render(
        <AuthContext.Provider value={authValue}>
            <MemoryRouter initialEntries={["/login"]}>
                <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route path="/dashboard" element={<div>Página de dashboard</div>} />
                </Routes>
            </MemoryRouter>
        </AuthContext.Provider>,
    );

    return { setUser };
}

describe("Login.tsx", () => {
    test("deve autenticar o usuário e redirecionar para o dashboard", async () => {
        const user = userEvent.setup();

        const { requests } = mockApiResponse({
            method: "POST",
            endpoint: "/auth/login",
            responseBody: {
                user: {
                    id: 1,
                    name: "João Silva",
                    email: "joao@email.com",
                },
            },
        });

        const { setUser } = renderLogin();

        await user.type(screen.getByRole("textbox", { name: "Email" }), "joao@email.com");
        await user.type(screen.getByLabelText("Senha"), "12345678");
        await user.click(screen.getByRole("button", { name: "Entrar" }));

        expect(await screen.findByText("Página de dashboard")).toBeInTheDocument();
        expect(setUser).toHaveBeenCalledWith({
            id: 1,
            name: "João Silva",
            email: "joao@email.com",
        });
        assert.equal(requests.length, 1);
        assert.deepEqual(requests[0]?.body, {
            email: "joao@email.com",
            password: "12345678",
        });
    });

    test("deve exibir uma mensagem de erro quando as credenciais forem inválidas", async () => {
        const user = userEvent.setup();

        mockApiResponse({
            method: "POST",
            endpoint: "/auth/login",
            responseBody: { message: "Credenciais inválidas" },
            status: 401,
        });

        const { setUser } = renderLogin();

        await user.type(screen.getByRole("textbox", { name: "Email" }), "joao@email.com");
        await user.type(screen.getByLabelText("Senha"), "12345678");
        await user.click(screen.getByRole("button", { name: "Entrar" }));

        expect(await screen.findByText("Credenciais inválidas")).toBeVisible();
        expect(setUser).not.toHaveBeenCalled();
        expect(screen.getByRole("button", { name: "Entrar" })).toBeEnabled();
        expect(screen.getByRole("textbox", { name: "Email" })).toHaveValue("joao@email.com");
        expect(screen.getByLabelText("Senha")).toHaveValue("12345678");
        expect(screen.queryByText("Página de dashboard")).not.toBeInTheDocument();
    });

    test("deve exibir a validação e impedir o envio quando a senha estiver vazia", async () => {
        const user = userEvent.setup();

        const { requests } = mockApiResponse({
            method: "POST",
            endpoint: "/auth/login",
        });

        const { setUser } = renderLogin();

        await user.type(screen.getByRole("textbox", { name: "Email" }), "joao@email.com");
        await user.click(screen.getByRole("button", { name: "Entrar" }));

        expect(await screen.findByText("Senha é obrigatória")).toBeVisible();
        assert.equal(requests.length, 0);
        expect(setUser).not.toHaveBeenCalled();
    });
});
