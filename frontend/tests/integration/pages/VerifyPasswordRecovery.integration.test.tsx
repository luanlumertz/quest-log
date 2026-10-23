import { afterEach, assert, describe, expect, test, vi } from "vitest";
import { act, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import {
    readPasswordRecovery,
    storePasswordRecovery,
} from "../../../src/lib/passwordRecoverySession";

import {
    makePasswordRecovery,
    passwordResetResponse,
    renderPasswordRecoveryFlow,
} from "../../fixtures/password.fixture";
import { mockApiResponse } from "../../mocks/api.mock";

describe("VerifyPasswordRecovery.tsx", () => {
    afterEach(() => vi.useRealTimers());

    test("deve confirmar o código e guardar a autorização somente em memória", async () => {
        const user = userEvent.setup();

        storePasswordRecovery(makePasswordRecovery());

        const { requests } = mockApiResponse({
            method: "POST",
            endpoint: "/auth/password/verify",
            responseBody: passwordResetResponse,
        });

        renderPasswordRecoveryFlow("/forgot-password/verify");

        await user.type(screen.getByRole("textbox", { name: "Código de verificação" }), "012345");
        await user.click(screen.getByRole("button", { name: "Confirmar código" }));

        expect(await screen.findByRole("heading", { name: "Crie sua nova senha" })).toBeVisible();
        assert.deepEqual(requests[0]?.body, { email: "joao@email.com", code: "012345" });
        expect(screen.getByTestId("rota-atual")).toHaveTextContent(/^\/forgot-password\/reset$/);
        expect(sessionStorage.getItem("questlog:password-recovery")).not.toContain(
            passwordResetResponse.resetToken,
        );
        expect(sessionStorage.getItem("questlog:password-recovery")).not.toContain("012345");
    });

    test("deve restaurar a verificação após recarregar sem reenviar outro e-mail", () => {
        const recovery = makePasswordRecovery();

        storePasswordRecovery(recovery);

        const resend = mockApiResponse({ method: "POST", endpoint: "/auth/password/resend" });
        const forgot = mockApiResponse({ method: "POST", endpoint: "/auth/password/forgot" });
        const initial = renderPasswordRecoveryFlow("/forgot-password/verify");

        initial.unmount();
        renderPasswordRecoveryFlow("/forgot-password/verify");

        expect(screen.getByText(recovery.email)).toBeVisible();
        expect(screen.getByRole("textbox", { name: "Código de verificação" })).toHaveValue("");
        expect(screen.getByRole("button", { name: /Reenviar código em/ })).toBeDisabled();
        assert.deepEqual(readPasswordRecovery(), recovery);
        assert.equal(resend.requests.length, 0);
        assert.equal(forgot.requests.length, 0);
    });

    test.each([
        { status: 400, message: "Código inválido ou expirado." },
        { status: 429, message: "Muitas tentativas de verificação." },
    ])("deve manter a tela e permitir correção após HTTP $status", async ({ status, message }) => {
        const user = userEvent.setup();

        storePasswordRecovery(makePasswordRecovery());
        mockApiResponse({
            method: "POST",
            endpoint: "/auth/password/verify",
            status,
            responseBody: { message },
        });

        renderPasswordRecoveryFlow("/forgot-password/verify");

        await user.type(screen.getByRole("textbox", { name: "Código de verificação" }), "123456");
        await user.click(screen.getByRole("button", { name: "Confirmar código" }));

        expect(await screen.findByRole("alert")).toHaveTextContent(message);
        expect(screen.getByRole("button", { name: "Confirmar código" })).toBeEnabled();
        expect(screen.getByTestId("rota-atual")).toHaveTextContent(/^\/forgot-password\/verify$/);
    });

    test("deve liberar o reenvio após 60 segundos", () => {
        vi.useFakeTimers();
        storePasswordRecovery(makePasswordRecovery());

        renderPasswordRecoveryFlow("/forgot-password/verify");

        expect(screen.getByRole("button", { name: "Reenviar código em 60s" })).toBeDisabled();

        act(() => vi.advanceTimersByTime(60_000));

        expect(screen.getByRole("button", { name: "Reenviar código" })).toBeEnabled();
    });

    test("deve reenviar por e-mail, limpar o código e renovar o cooldown", async () => {
        const user = userEvent.setup();

        storePasswordRecovery(makePasswordRecovery({ resendAvailableAt: Date.now() - 1000 }));

        const { requests } = mockApiResponse({
            method: "POST",
            endpoint: "/auth/password/resend",
            status: 202,
        });

        renderPasswordRecoveryFlow("/forgot-password/verify");

        await user.type(screen.getByRole("textbox", { name: "Código de verificação" }), "123456");
        await user.click(screen.getByRole("button", { name: "Reenviar código" }));

        expect(await screen.findByRole("status")).toHaveTextContent(
            "Solicitação recebida. Se houver uma conta",
        );
        expect(screen.getByRole("textbox", { name: "Código de verificação" })).toHaveValue("");
        expect(screen.getByRole("button", { name: /Reenviar código em/ })).toBeDisabled();
        assert.deepEqual(requests[0]?.body, { email: "joao@email.com" });
        assert.isAbove(readPasswordRecovery()!.resendAvailableAt, Date.now());
    });

    test("deve preservar a recuperação e permitir tentar novamente quando o reenvio falhar", async () => {
        const user = userEvent.setup();
        const recovery = makePasswordRecovery({ resendAvailableAt: Date.now() - 1000 });

        storePasswordRecovery(recovery);
        mockApiResponse({
            method: "POST",
            endpoint: "/auth/password/resend",
            status: 429,
            responseBody: { message: "Muitas solicitações de recuperação." },
        });

        renderPasswordRecoveryFlow("/forgot-password/verify");

        await user.click(screen.getByRole("button", { name: "Reenviar código" }));

        expect(await screen.findByRole("alert")).toHaveTextContent(
            "Muitas solicitações de recuperação.",
        );
        expect(screen.getByRole("button", { name: "Reenviar código" })).toBeEnabled();
        assert.deepEqual(readPasswordRecovery(), recovery);
    });

    test("deve orientar a solicitar um código ao abrir sem recuperação", async () => {
        const user = userEvent.setup();

        renderPasswordRecoveryFlow("/forgot-password/verify");

        expect(screen.getByRole("heading", { name: "Vamos recuperar seu acesso?" })).toBeVisible();

        await user.click(screen.getByRole("link", { name: "Solicitar código" }));

        expect(screen.getByRole("heading", { name: "Esqueceu sua senha?" })).toBeVisible();
    });

    test("deve voltar ao e-mail preservando o endereço preenchido", async () => {
        const user = userEvent.setup();

        storePasswordRecovery(makePasswordRecovery());
        renderPasswordRecoveryFlow("/forgot-password/verify");

        await user.click(screen.getAllByRole("button", { name: "Voltar" })[0]!);

        expect(screen.getByRole("textbox", { name: "Email" })).toHaveValue("joao@email.com");
    });
});
