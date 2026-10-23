import { afterEach, assert, describe, expect, test, vi } from "vitest";
import { act, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import {
    readPasswordRecovery,
    storePasswordRecovery,
} from "../../../src/lib/passwordRecoverySession";

import {
    fillNewPasswordForm,
    makePasswordRecovery,
    passwordResetResponse,
    renderPasswordRecoveryFlow,
} from "../../fixtures/password.fixture";
import { mockApiResponse } from "../../mocks/api.mock";

function renderAuthorizedReset() {
    storePasswordRecovery(makePasswordRecovery());

    return renderPasswordRecoveryFlow("/forgot-password/reset", {
        authorization: passwordResetResponse,
        auth: {
            user: { id: 1, name: "João Silva", email: "joao@email.com" },
            status: "authenticated",
        },
    });
}

describe("ResetPassword.tsx", () => {
    afterEach(() => vi.useRealTimers());

    test("deve redefinir a senha, limpar sessão e cache e confirmar no login", async () => {
        const user = userEvent.setup();
        const { requests } = mockApiResponse({ method: "POST", endpoint: "/auth/password/reset" });
        const logout = mockApiResponse({ method: "POST", endpoint: "/auth/logout" });
        const { authValue, queryClient } = renderAuthorizedReset();

        queryClient.setQueryData(["library"], { privateData: "biblioteca antiga" });

        await fillNewPasswordForm(user);
        await user.click(screen.getByRole("button", { name: "Salvar nova senha" }));

        expect(await screen.findByRole("heading", { name: "Bem-vindo!" })).toBeVisible();
        expect(screen.getByRole("status")).toHaveTextContent("Senha alterada com sucesso!");
        expect(screen.getByRole("textbox", { name: "Email" })).toHaveValue("joao@email.com");
        expect(authValue.setUser).toHaveBeenCalledWith(null);
        expect(queryClient.getQueryData(["library"])).toBeUndefined();
        assert.deepEqual(requests[0]?.body, {
            resetToken: passwordResetResponse.resetToken,
            password: "nova senha123",
        });
        assert.equal(logout.requests.length, 0);
        assert.isNull(readPasswordRecovery());
        assert.isNull(sessionStorage.getItem("questlog:password-changed"));
        expect(screen.getByTestId("rota-atual")).toHaveTextContent(/^\/login$/);
    });

    test("deve rejeitar senhas diferentes sem chamar o backend", async () => {
        const user = userEvent.setup();
        const { requests } = mockApiResponse({ method: "POST", endpoint: "/auth/password/reset" });

        renderAuthorizedReset();

        await fillNewPasswordForm(user, "nova senha123", "outra senha123");
        await user.click(screen.getByRole("button", { name: "Salvar nova senha" }));

        expect(await screen.findByText("As senhas não coincidem")).toBeVisible();
        assert.equal(requests.length, 0);
    });

    test("deve preservar a autorização e permitir corrigir a mesma senha rejeitada pelo backend", async () => {
        const user = userEvent.setup();
        const rejected = mockApiResponse({
            method: "POST",
            endpoint: "/auth/password/reset",
            status: 422,
            responseBody: { message: "A nova senha deve ser diferente da senha atual." },
        });

        renderAuthorizedReset();

        await fillNewPasswordForm(user, "senha anterior123");
        await user.click(screen.getByRole("button", { name: "Salvar nova senha" }));

        expect(
            await screen.findByText("A nova senha deve ser diferente da senha atual."),
        ).toBeVisible();
        expect(screen.getByRole("heading", { name: "Crie sua nova senha" })).toBeVisible();

        const retried = mockApiResponse({ method: "POST", endpoint: "/auth/password/reset" });

        await fillNewPasswordForm(user);
        await user.click(screen.getByRole("button", { name: "Salvar nova senha" }));

        expect(await screen.findByRole("heading", { name: "Bem-vindo!" })).toBeVisible();
        assert.equal(rejected.requests.length, 1);
        assert.deepEqual(retried.requests[0]?.body, {
            resetToken: passwordResetResponse.resetToken,
            password: "nova senha123",
        });
    });

    test("deve descartar a autorização recusada pelo backend e solicitar um novo código", async () => {
        const user = userEvent.setup();

        mockApiResponse({
            method: "POST",
            endpoint: "/auth/password/reset",
            status: 400,
            responseBody: { message: "Autorização inválida ou expirada. Solicite um novo código." },
        });
        renderAuthorizedReset();

        await fillNewPasswordForm(user);
        await user.click(screen.getByRole("button", { name: "Salvar nova senha" }));

        expect(
            await screen.findByRole("heading", { name: "Solicite um novo código" }),
        ).toBeVisible();
        expect(screen.getByRole("alert")).toHaveTextContent("Autorização inválida ou expirada.");
        expect(screen.queryByLabelText("Nova senha")).not.toBeInTheDocument();

        await user.click(screen.getByRole("link", { name: "Recuperar senha" }));

        expect(screen.getByRole("heading", { name: "Esqueceu sua senha?" })).toBeVisible();
    });

    test.each([
        { status: 429, message: "Muitas tentativas de redefinição de senha." },
        { status: 503, message: "Não foi possível redefinir sua senha. Tente novamente." },
    ])(
        "deve manter o formulário e a autorização após HTTP $status",
        async ({ status, message }) => {
            const user = userEvent.setup();

            mockApiResponse({
                method: "POST",
                endpoint: "/auth/password/reset",
                status,
                responseBody: { message },
            });
            const { authValue } = renderAuthorizedReset();

            await fillNewPasswordForm(user);
            await user.click(screen.getByRole("button", { name: "Salvar nova senha" }));

            expect(await screen.findByRole("alert")).toHaveTextContent(message);
            expect(screen.getByLabelText("Nova senha")).toHaveValue("nova senha123");
            expect(screen.getByRole("button", { name: "Salvar nova senha" })).toBeEnabled();
            expect(authValue.setUser).not.toHaveBeenCalled();
        },
    );

    test("deve perder a autorização ao recarregar e exigir uma nova verificação", () => {
        const initial = renderAuthorizedReset();

        expect(screen.getByRole("heading", { name: "Crie sua nova senha" })).toBeVisible();

        initial.unmount();
        renderPasswordRecoveryFlow("/forgot-password/reset");

        expect(screen.getByRole("heading", { name: "Solicite um novo código" })).toBeVisible();
        expect(screen.queryByLabelText("Nova senha")).not.toBeInTheDocument();
    });

    test("deve reconhecer a expiração local e retirar o formulário", () => {
        vi.useFakeTimers();

        renderAuthorizedReset();

        expect(screen.getByRole("heading", { name: "Crie sua nova senha" })).toBeVisible();

        act(() => vi.advanceTimersByTime(600_000));

        expect(screen.getByRole("heading", { name: "Solicite um novo código" })).toBeVisible();
        expect(screen.queryByLabelText("Nova senha")).not.toBeInTheDocument();
    });

    test("deve voltar para solicitar outro código", async () => {
        const user = userEvent.setup();

        renderAuthorizedReset();

        await user.click(screen.getAllByRole("button", { name: "Voltar" })[0]!);

        expect(screen.getByRole("heading", { name: "Esqueceu sua senha?" })).toBeVisible();
    });
});
