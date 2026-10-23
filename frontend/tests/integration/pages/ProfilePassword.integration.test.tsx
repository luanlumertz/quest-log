import { assert, describe, expect, test } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";

import { API_URL } from "../../../src/services/api";
import {
    readPasswordRecovery,
    storePasswordRecovery,
} from "../../../src/lib/passwordRecoverySession";

import {
    fillNewPasswordForm,
    makePasswordRecovery,
    renderPasswordRecoveryFlow,
} from "../../fixtures/password.fixture";
import { mockApiResponse } from "../../mocks/api.mock";
import { server } from "../../mocks/server.mock";

function renderPasswordProfile() {
    return renderPasswordRecoveryFlow("/profile", {
        auth: {
            user: { id: 1, name: "João Silva", email: "joao@email.com" },
            status: "authenticated",
        },
    });
}

async function fillPasswordChange(user: ReturnType<typeof userEvent.setup>) {
    await user.click(screen.getByRole("button", { name: "Alterar senha" }));
    await user.type(screen.getByLabelText("Senha atual"), "senha anterior123");
    await fillNewPasswordForm(user);
}

describe("Troca de senha pelo perfil", () => {
    test("deve limpar o formulário e mostrar sucesso mantendo a sessão, o cache e a página", async () => {
        const user = userEvent.setup();
        const { requests } = mockApiResponse({ method: "PATCH", endpoint: "/auth/me/password" });
        const { authValue, queryClient } = renderPasswordProfile();

        queryClient.setQueryData(["library"], { privateData: "biblioteca atual" });
        storePasswordRecovery(makePasswordRecovery());

        await fillPasswordChange(user);
        await user.click(screen.getByRole("button", { name: "Salvar nova senha" }));

        expect(await screen.findByRole("status")).toHaveTextContent("Senha alterada com sucesso!");
        expect(screen.getByRole("button", { name: "Alterar senha" })).toBeEnabled();
        expect(screen.queryByLabelText("Senha atual")).not.toBeInTheDocument();
        expect(screen.getByTestId("rota-atual")).toHaveTextContent(/^\/profile$/);
        expect(authValue.setUser).not.toHaveBeenCalled();
        expect(queryClient.getQueryData(["library"])).toEqual({ privateData: "biblioteca atual" });
        assert.deepEqual(requests[0]?.body, {
            currentPassword: "senha anterior123",
            password: "nova senha123",
        });
        assert.isNull(readPasswordRecovery());

        await user.click(screen.getByRole("button", { name: "Alterar senha" }));

        expect(screen.getByLabelText("Senha atual")).toHaveValue("");
        expect(screen.getByLabelText("Nova senha")).toHaveValue("");
        expect(screen.getByLabelText("Confirme a nova senha")).toHaveValue("");
        expect(screen.queryByRole("status")).not.toBeInTheDocument();
    });

    test("deve rejeitar a mesma senha no campo sem enviar uma requisição", async () => {
        const user = userEvent.setup();
        const { requests } = mockApiResponse({ method: "PATCH", endpoint: "/auth/me/password" });

        renderPasswordProfile();

        await user.click(screen.getByRole("button", { name: "Alterar senha" }));
        await user.type(screen.getByLabelText("Senha atual"), "senha anterior123");
        await fillNewPasswordForm(user, "senha anterior123");
        await user.click(screen.getByRole("button", { name: "Salvar nova senha" }));

        expect(
            await screen.findByText("A nova senha deve ser diferente da senha atual."),
        ).toBeVisible();
        assert.equal(requests.length, 0);
    });

    test.each([
        { status: 400, message: "Senha atual incorreta." },
        { status: 422, message: "A nova senha deve ser diferente da senha atual." },
        { status: 429, message: "Muitas tentativas de alteração de senha." },
        { status: 503, message: "Não foi possível alterar sua senha. Tente novamente." },
    ])("deve manter os campos e a sessão após erro HTTP $status", async ({ status, message }) => {
        const user = userEvent.setup();

        mockApiResponse({
            method: "PATCH",
            endpoint: "/auth/me/password",
            status,
            responseBody: { message },
        });
        const { authValue } = renderPasswordProfile();

        await fillPasswordChange(user);
        await user.click(screen.getByRole("button", { name: "Salvar nova senha" }));

        expect(await screen.findByText(message)).toBeVisible();
        expect(screen.getByLabelText("Nova senha")).toHaveValue("nova senha123");
        expect(screen.getByRole("button", { name: "Salvar nova senha" })).toBeEnabled();
        expect(screen.getByRole("button", { name: "Sair" })).toBeEnabled();
        expect(authValue.setUser).not.toHaveBeenCalled();
    });

    test("deve cancelar a edição e remover as senhas sem chamar a API", async () => {
        const user = userEvent.setup();
        const { requests } = mockApiResponse({ method: "PATCH", endpoint: "/auth/me/password" });

        renderPasswordProfile();

        await fillPasswordChange(user);
        await user.click(screen.getByRole("button", { name: "Cancelar" }));
        await user.click(screen.getByRole("button", { name: "Alterar senha" }));

        expect(screen.getByLabelText("Senha atual")).toHaveValue("");
        expect(screen.getByLabelText("Nova senha")).toHaveValue("");
        assert.equal(requests.length, 0);
    });

    test("deve impedir ações conflitantes enquanto salva e liberar após a resposta", async () => {
        const user = userEvent.setup();
        let releaseResponse!: () => void;
        const pending = new Promise<void>((resolve) => {
            releaseResponse = resolve;
        });

        server.use(
            http.patch(`${API_URL}/auth/me/password`, async () => {
                await pending;
                return new HttpResponse(null, { status: 204 });
            }),
        );

        renderPasswordProfile();

        await fillPasswordChange(user);

        try {
            await user.click(screen.getByRole("button", { name: "Salvar nova senha" }));

            expect(await screen.findByRole("button", { name: "Salvando..." })).toBeDisabled();
            expect(screen.getByLabelText("Senha atual")).toBeDisabled();
            expect(screen.getByRole("button", { name: "Cancelar" })).toBeDisabled();
            expect(screen.getByRole("button", { name: "Editar" })).toBeDisabled();
            expect(screen.getByRole("button", { name: "Sair" })).toBeDisabled();
            expect(screen.getByRole("button", { name: "Excluir conta" })).toBeDisabled();
        } finally {
            releaseResponse();
        }

        expect(await screen.findByRole("button", { name: "Alterar senha" })).toBeEnabled();
        expect(screen.getByRole("button", { name: "Editar" })).toBeEnabled();
        expect(screen.getByRole("button", { name: "Sair" })).toBeEnabled();
    });

    test("deve permitir recuperar a senha atual com o e-mail preenchido", async () => {
        const user = userEvent.setup();

        renderPasswordProfile();

        await user.click(screen.getByRole("button", { name: "Alterar senha" }));
        await user.click(screen.getByRole("link", { name: "Esqueci minha senha atual" }));

        expect(screen.getByRole("heading", { name: "Esqueceu sua senha?" })).toBeVisible();
        expect(screen.getByRole("textbox", { name: "Email" })).toHaveValue("joao@email.com");
    });
});
