import { assert, describe, expect, test } from "vitest";
import { MemoryRouter, Route, Routes } from "react-router";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { Register } from "../../../src/pages/Register";

import { mockApiResponse } from "../../mocks/api.mock";

function renderRegister() {
    return render(
        <MemoryRouter initialEntries={["/register"]}>
            <Routes>
                <Route path="/register" element={<Register />} />
                <Route path="/login" element={<div>Página de login</div>} />
            </Routes>
        </MemoryRouter>,
    );
}

describe("Register.tsx", () => {
    test("deve cadastrar o usuário sem enviar confirmPassword e redirecionar para o login", async () => {
        const user = userEvent.setup();

        const { requests } = mockApiResponse({
            method: "POST",
            endpoint: "/auth/register",
            responseBody: {
                user: {
                    id: 1,
                    name: "João Silva",
                    email: "joao@email.com",
                },
            },
            status: 201,
        });

        renderRegister();

        await user.type(screen.getByRole("textbox", { name: "Nome" }), "João Silva");
        await user.type(screen.getByRole("textbox", { name: "Email" }), "joao@email.com");
        await user.type(screen.getByLabelText("Senha"), "12345678");
        await user.type(screen.getByLabelText("Confirme sua senha"), "12345678");
        await user.click(screen.getByRole("button", { name: "Cadastrar" }));

        expect(await screen.findByText("Página de login")).toBeInTheDocument();
        assert.equal(requests.length, 1);
        assert.deepEqual(requests[0]?.body, {
            name: "João Silva",
            email: "joao@email.com",
            password: "12345678",
        });
    });

    test("deve exibir uma mensagem de erro quando o cadastro falhar", async () => {
        const user = userEvent.setup();

        const { requests } = mockApiResponse({
            method: "POST",
            endpoint: "/auth/register",
            status: 400,
            responseBody: { message: "Email já cadastrado" },
        });

        renderRegister();

        await user.type(screen.getByRole("textbox", { name: "Nome" }), "João Silva");
        await user.type(screen.getByRole("textbox", { name: "Email" }), "joao@email.com");
        await user.type(screen.getByLabelText("Senha"), "12345678");
        await user.type(screen.getByLabelText("Confirme sua senha"), "12345678");
        await user.click(screen.getByRole("button", { name: "Cadastrar" }));

        expect(await screen.findByText("Email já cadastrado")).toBeVisible();
        expect(screen.getByRole("button", { name: "Cadastrar" })).toBeEnabled();
        expect(screen.getByRole("textbox", { name: "Nome" })).toHaveValue("João Silva");
        expect(screen.getByRole("textbox", { name: "Email" })).toHaveValue("joao@email.com");
        expect(screen.getByLabelText("Senha")).toHaveValue("12345678");
        expect(screen.getByLabelText("Confirme sua senha")).toHaveValue("12345678");
        expect(screen.queryByText("Página de login")).not.toBeInTheDocument();
        assert.equal(requests.length, 1);
    });

    test("deve exibir a validação e impedir o cadastro quando as senhas não coincidirem", async () => {
        const user = userEvent.setup();

        const { requests } = mockApiResponse({
            method: "POST",
            endpoint: "/auth/register",
        });

        renderRegister();

        await user.type(screen.getByRole("textbox", { name: "Nome" }), "João Silva");
        await user.type(screen.getByRole("textbox", { name: "Email" }), "joao@email.com");
        await user.type(screen.getByLabelText("Senha"), "12345678");
        await user.type(screen.getByLabelText("Confirme sua senha"), "87654321");
        await user.click(screen.getByRole("button", { name: "Cadastrar" }));

        expect(await screen.findByText("As senhas não coincidem")).toBeVisible();
        assert.equal(requests.length, 0);
    });
});
