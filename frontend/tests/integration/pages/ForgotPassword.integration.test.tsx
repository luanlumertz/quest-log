import { assert, describe, expect, test } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { readPasswordRecovery } from "../../../src/lib/passwordRecoverySession";

import { renderPasswordRecoveryFlow } from "../../fixtures/password.fixture";
import { mockApiResponse } from "../../mocks/api.mock";

describe("ForgotPassword.tsx", () => {
    test("deve aproveitar o e-mail do login e solicitar um código com resposta genérica", async () => {
        const user = userEvent.setup();
        const { requests } = mockApiResponse({
            method: "POST",
            endpoint: "/auth/password/forgot",
            status: 202,
        });

        renderPasswordRecoveryFlow("/login");

        await user.type(screen.getByRole("textbox", { name: "Email" }), "JOAO@EMAIL.COM");
        await user.click(screen.getByRole("link", { name: "Esqueceu sua senha?" }));

        expect(screen.getByRole("textbox", { name: "Email" })).toHaveValue("JOAO@EMAIL.COM");

        await user.click(screen.getByRole("button", { name: "Enviar código" }));

        expect(await screen.findByRole("heading", { name: "Confira seu e-mail" })).toBeVisible();
        expect(screen.getByText(/^Se houver uma conta com este e-mail/)).toBeVisible();
        expect(screen.getByText("joao@email.com")).toBeVisible();
        assert.deepEqual(requests[0]?.body, { email: "joao@email.com" });
        assert.equal(readPasswordRecovery()?.email, "joao@email.com");
    });

    test("não deve solicitar recuperação com e-mail inválido", async () => {
        const user = userEvent.setup();
        const { requests } = mockApiResponse({ method: "POST", endpoint: "/auth/password/forgot" });

        renderPasswordRecoveryFlow();

        await user.type(screen.getByRole("textbox", { name: "Email" }), "inválido");
        await user.click(screen.getByRole("button", { name: "Enviar código" }));

        expect(await screen.findByText("Email inválido")).toBeVisible();
        assert.equal(requests.length, 0);
        assert.isNull(readPasswordRecovery());
    });

    test.each([
        { status: 429, message: "Muitas solicitações de recuperação." },
        { status: 503, message: "Não foi possível solicitar o código. Tente novamente." },
    ])("deve permitir nova tentativa após falha HTTP $status", async ({ status, message }) => {
        const user = userEvent.setup();

        mockApiResponse({
            method: "POST",
            endpoint: "/auth/password/forgot",
            status,
            responseBody: { message },
        });

        renderPasswordRecoveryFlow();

        await user.type(screen.getByRole("textbox", { name: "Email" }), "joao@email.com");
        await user.click(screen.getByRole("button", { name: "Enviar código" }));

        expect(await screen.findByRole("alert")).toHaveTextContent(message);
        expect(screen.getByRole("button", { name: "Enviar código" })).toBeEnabled();
        expect(screen.getByRole("textbox", { name: "Email" })).toHaveValue("joao@email.com");
        assert.isNull(readPasswordRecovery());

        mockApiResponse({ method: "POST", endpoint: "/auth/password/forgot", status: 202 });

        await user.click(screen.getByRole("button", { name: "Enviar código" }));

        expect(await screen.findByRole("heading", { name: "Confira seu e-mail" })).toBeVisible();
    });

    test("deve permitir recuperar a senha autenticado e voltar ao perfil", async () => {
        const user = userEvent.setup();

        renderPasswordRecoveryFlow("/forgot-password", {
            auth: {
                user: { id: 1, name: "João Silva", email: "joao@email.com" },
                status: "authenticated",
            },
        });

        expect(screen.getByRole("textbox", { name: "Email" })).toHaveValue("joao@email.com");
        expect(screen.getByRole("link", { name: "Voltar ao perfil" })).toHaveAttribute(
            "href",
            "/profile",
        );

        await user.click(screen.getAllByRole("button", { name: "Voltar" })[0]!);

        expect(screen.getByRole("heading", { name: "Meu Perfil" })).toBeVisible();
    });

    test("deve voltar ao login quando não há sessão autenticada", async () => {
        const user = userEvent.setup();

        renderPasswordRecoveryFlow();

        await user.click(screen.getAllByRole("button", { name: "Voltar" })[0]!);

        expect(screen.getByRole("heading", { name: "Bem-vindo!" })).toBeVisible();
    });
});
