import { afterEach, assert, describe, expect, test, vi } from "vitest";
import { act, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import {
    readPendingRegistration,
    storePendingRegistration,
} from "../../../src/lib/registrationSession";

import {
    fillRegistrationForm,
    makePendingRegistration,
    registrationResponse,
    renderRegistrationFlow,
} from "../../fixtures/registration.fixture";
import { mockApiResponse } from "../../mocks/api.mock";

describe("Fluxo de verificação do cadastro", () => {
    afterEach(() => vi.useRealTimers());

    test("deve confirmar o código, limpar a pendência e mostrar sucesso no login", async () => {
        const user = userEvent.setup();

        storePendingRegistration(makePendingRegistration());

        const { requests } = mockApiResponse({
            method: "POST",
            endpoint: "/auth/register/verify",
            status: 201,
            responseBody: {
                user: { id: 1, name: "João Silva", email: registrationResponse.email },
            },
        });

        renderRegistrationFlow("/register/verify");

        await user.type(screen.getByRole("textbox", { name: "Código de verificação" }), "012345");
        await user.click(screen.getByRole("button", { name: "Confirmar e criar conta" }));

        expect(await screen.findByRole("heading", { name: "Bem-vindo!" })).toBeVisible();
        expect(screen.getByRole("status")).toHaveTextContent(
            "E-mail confirmado! Sua conta foi criada.",
        );
        assert.deepEqual(requests[0]?.body, {
            pendingRegistrationId: registrationResponse.pendingRegistrationId,
            code: "012345",
        });
        assert.isNull(readPendingRegistration());
    });

    test("deve preservar o formulário ao voltar e reutilizar a pendência sem outra requisição", async () => {
        const user = userEvent.setup();

        const { requests } = mockApiResponse({
            method: "POST",
            endpoint: "/auth/register",
            status: 202,
            responseBody: registrationResponse,
        });

        renderRegistrationFlow();

        await fillRegistrationForm(user);
        await user.click(screen.getByRole("button", { name: "Cadastrar" }));
        await screen.findByRole("heading", { name: "Confira seu e-mail" });
        await user.click(screen.getAllByRole("button", { name: "Voltar" })[0]!);

        expect(screen.getByRole("textbox", { name: "Nome" })).toHaveValue("João Silva");
        expect(screen.getByLabelText("Senha")).toHaveValue("12345678");

        await user.click(screen.getByRole("button", { name: "Cadastrar" }));

        expect(await screen.findByRole("heading", { name: "Confira seu e-mail" })).toBeVisible();
        assert.equal(requests.length, 1);
        assert.equal(
            readPendingRegistration()?.pendingRegistrationId,
            registrationResponse.pendingRegistrationId,
        );
        expect(sessionStorage.getItem("questlog:pending-registration")).not.toContain("12345678");
        expect(sessionStorage.getItem("questlog:pending-registration")).not.toContain("João Silva");
    });

    test.each([
        { field: "Nome", value: "João Almeida" },
        { field: "Email", value: "outro@email.com" },
        { field: "Senha", value: "novaSenha123" },
    ])("deve iniciar outra tentativa ao alterar $field", async ({ field, value }) => {
        const user = userEvent.setup();

        const initial = mockApiResponse({
            method: "POST",
            endpoint: "/auth/register",
            status: 202,
            responseBody: registrationResponse,
        });

        renderRegistrationFlow();

        await fillRegistrationForm(user);
        await user.click(screen.getByRole("button", { name: "Cadastrar" }));
        await screen.findByRole("heading", { name: "Confira seu e-mail" });
        await user.click(screen.getAllByRole("button", { name: "Voltar" })[0]!);
        await user.clear(screen.getByLabelText(field));
        await user.type(screen.getByLabelText(field), value);

        if (field === "Senha") {
            await user.clear(screen.getByLabelText("Confirme sua senha"));
            await user.type(screen.getByLabelText("Confirme sua senha"), value);
        }

        const replacement = {
            pendingRegistrationId: "22222222-2222-4222-8222-222222222222",
            email: field === "Email" ? value : registrationResponse.email,
        };

        const updated = mockApiResponse({
            method: "POST",
            endpoint: "/auth/register",
            status: 202,
            responseBody: replacement,
        });

        await user.click(screen.getByRole("button", { name: "Cadastrar" }));

        expect(await screen.findByRole("heading", { name: "Confira seu e-mail" })).toBeVisible();
        assert.equal(initial.requests.length, 1);
        assert.equal(updated.requests.length, 1);
        assert.equal(
            readPendingRegistration()?.pendingRegistrationId,
            replacement.pendingRegistrationId,
        );
        expect(updated.requests[0]?.body).not.toHaveProperty("confirmPassword");
    });

    test("deve recuperar a verificação após recarregar sem reenviar e-mail", () => {
        const pending = makePendingRegistration();

        storePendingRegistration(pending);

        const registration = mockApiResponse({ method: "POST", endpoint: "/auth/register" });

        const firstRender = renderRegistrationFlow("/register/verify");

        firstRender.unmount();

        renderRegistrationFlow("/register/verify");

        expect(screen.getByText(pending.email)).toBeVisible();
        expect(screen.getByRole("textbox", { name: "Código de verificação" })).toHaveValue("");
        expect(screen.getByRole("button", { name: /Reenviar código em/ })).toBeDisabled();
        assert.deepEqual(readPendingRegistration(), pending);
        assert.equal(registration.requests.length, 0);
    });

    test("deve perder a senha após recarregar o formulário e iniciar outra tentativa mesmo com dados iguais", async () => {
        const user = userEvent.setup();

        const { requests } = mockApiResponse({
            method: "POST",
            endpoint: "/auth/register",
            status: 202,
            responseBody: registrationResponse,
        });

        const firstRender = renderRegistrationFlow();

        await fillRegistrationForm(user);
        await user.click(screen.getByRole("button", { name: "Cadastrar" }));
        await screen.findByRole("heading", { name: "Confira seu e-mail" });
        await user.click(screen.getAllByRole("button", { name: "Voltar" })[0]!);
        firstRender.unmount();

        renderRegistrationFlow();

        expect(screen.getByRole("textbox", { name: "Nome" })).toHaveValue("");
        expect(screen.getByLabelText("Senha")).toHaveValue("");

        await fillRegistrationForm(user);
        await user.click(screen.getByRole("button", { name: "Cadastrar" }));
        await screen.findByRole("heading", { name: "Confira seu e-mail" });

        assert.equal(requests.length, 2);
    });

    test.each([
        {
            status: 400,
            message: "Código inválido ou expirado.",
            expected: "Código inválido ou expirado.",
        },
        {
            status: 429,
            message: "Limite de tentativas excedido.",
            expected: "Limite de tentativas excedido.",
        },
        {
            status: 503,
            message: "Erro interno",
            expected: "Não foi possível confirmar o código. Tente novamente.",
        },
    ])(
        "deve manter a verificação e exibir o erro HTTP $status",
        async ({ status, message, expected }) => {
            const user = userEvent.setup();

            storePendingRegistration(makePendingRegistration());

            mockApiResponse({
                method: "POST",
                endpoint: "/auth/register/verify",
                status,
                responseBody: { message },
            });

            renderRegistrationFlow("/register/verify");

            await user.type(
                screen.getByRole("textbox", { name: "Código de verificação" }),
                "123456",
            );
            await user.click(screen.getByRole("button", { name: "Confirmar e criar conta" }));

            expect(await screen.findByRole("alert")).toHaveTextContent(expected);
            expect(screen.getByRole("heading", { name: "Confira seu e-mail" })).toBeVisible();
            expect(screen.getByRole("button", { name: "Confirmar e criar conta" })).toBeEnabled();
        },
    );

    test("não deve enviar um código incompleto", async () => {
        const user = userEvent.setup();

        storePendingRegistration(makePendingRegistration());

        const { requests } = mockApiResponse({ method: "POST", endpoint: "/auth/register/verify" });

        renderRegistrationFlow("/register/verify");

        await user.type(screen.getByRole("textbox", { name: "Código de verificação" }), "123");
        await user.click(screen.getByRole("button", { name: "Confirmar e criar conta" }));

        expect(await screen.findByText("Digite o código de seis dígitos")).toBeVisible();
        assert.equal(requests.length, 0);
    });

    test("deve liberar o reenvio após 60 segundos e reconhecer a expiração do cadastro", () => {
        vi.useFakeTimers();

        storePendingRegistration(makePendingRegistration());

        renderRegistrationFlow("/register/verify");

        expect(screen.getByRole("button", { name: "Reenviar código em 60s" })).toBeDisabled();

        act(() => vi.advanceTimersByTime(60_000));

        expect(screen.getByRole("button", { name: "Reenviar código" })).toBeEnabled();

        act(() => vi.advanceTimersByTime(29 * 60_000));

        expect(screen.getByRole("heading", { name: "Seu cadastro expirou" })).toBeVisible();
    });

    test("deve reenviar mantendo ID e validade do cadastro, limpar o código e reiniciar o cooldown", async () => {
        const user = userEvent.setup();

        const pending = makePendingRegistration({ resendAvailableAt: Date.now() - 1000 });

        storePendingRegistration(pending);

        const { requests } = mockApiResponse({ method: "POST", endpoint: "/auth/register/resend" });

        renderRegistrationFlow("/register/verify");

        await user.type(screen.getByRole("textbox", { name: "Código de verificação" }), "123456");
        await user.click(screen.getByRole("button", { name: "Reenviar código" }));

        expect(await screen.findByRole("status")).toHaveTextContent("Novo código enviado!");
        expect(screen.getByRole("textbox", { name: "Código de verificação" })).toHaveValue("");
        expect(screen.getByRole("button", { name: /Reenviar código em/ })).toBeDisabled();
        assert.deepEqual(requests[0]?.body, {
            pendingRegistrationId: pending.pendingRegistrationId,
        });
        assert.equal(readPendingRegistration()?.expiresAt, pending.expiresAt);
    });

    test.each([
        { status: 400, message: "Cadastro expirado ou não encontrado." },
        { status: 429, message: "Muitas solicitações de reenvio." },
        { status: 503, message: "Não foi possível reenviar o código. Tente novamente." },
    ])("deve tratar a falha HTTP $status no reenvio", async ({ status, message }) => {
        const user = userEvent.setup();

        storePendingRegistration(makePendingRegistration({ resendAvailableAt: Date.now() - 1000 }));

        mockApiResponse({
            method: "POST",
            endpoint: "/auth/register/resend",
            status,
            responseBody: { message },
        });

        renderRegistrationFlow("/register/verify");

        await user.click(screen.getByRole("button", { name: "Reenviar código" }));

        if (status === 400) {
            expect(
                await screen.findByRole("heading", { name: "Vamos começar de novo?" }),
            ).toBeVisible();
            assert.isNull(readPendingRegistration());
        } else {
            expect(await screen.findByRole("alert")).toHaveTextContent(message);
            expect(screen.getByRole("button", { name: "Reenviar código" })).toBeEnabled();
        }
    });

    test("deve permitir um novo cadastro ao abrir a verificação sem pendência", async () => {
        const user = userEvent.setup();

        renderRegistrationFlow("/register/verify");

        expect(screen.getByRole("heading", { name: "Vamos começar de novo?" })).toBeVisible();

        await user.click(screen.getByRole("link", { name: "Ir para o cadastro" }));

        expect(screen.getByRole("heading", { name: "Crie uma conta!" })).toBeVisible();
    });
});
