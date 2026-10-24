import { assert, describe, expect, test, vi } from "vitest";
import { MemoryRouter } from "react-router";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClientProvider } from "@tanstack/react-query";
import { http, HttpResponse } from "msw";

import { Profile } from "../../../src/pages/Profile";
import { AuthContext, type AuthContextType } from "../../../src/contexts/AuthContext";
import { API_URL } from "../../../src/services/api";

import { createTestQueryClient } from "../../helpers/createTestQueryClient.helper";
import { mockApiResponse } from "../../mocks/api.mock";
import { server } from "../../mocks/server.mock";
import { createAuthContextMock } from "../../mocks/authContext.mock";

function renderProfile(overrides: Partial<AuthContextType> = {}) {
    const authValue = createAuthContextMock({
        user: {
            id: 1,
            name: "João Silva",
            email: "joao@email.com",
        },
        status: "authenticated",
        ...overrides,
    });

    const queryClient = createTestQueryClient();

    const result = render(
        <AuthContext.Provider value={authValue}>
            <QueryClientProvider client={queryClient}>
                <MemoryRouter>
                    <Profile />
                </MemoryRouter>
            </QueryClientProvider>
        </AuthContext.Provider>,
    );

    return { ...result, queryClient, setUser: authValue.setUser };
}

describe("Profile.tsx", () => {
    test("deve atualizar o nome do usuário e sincronizar o contexto de autenticação", async () => {
        const user = userEvent.setup();

        const { requests } = mockApiResponse({
            method: "PATCH",
            endpoint: "/auth/me",
            responseBody: {
                user: {
                    id: 1,
                    name: "João Almeida",
                    email: "joao@email.com",
                },
            },
        });

        const setUser = vi.fn();

        renderProfile({ setUser });

        await user.click(screen.getByRole("button", { name: "Editar" }));

        const campoNome = screen.getByRole("textbox", { name: "Nome de exibição" });

        await user.clear(campoNome);
        await user.type(campoNome, "João Almeida");
        await user.click(screen.getByRole("button", { name: "Salvar" }));

        await waitFor(() => {
            expect(setUser).toHaveBeenCalledWith({
                id: 1,
                name: "João Almeida",
                email: "joao@email.com",
            });
        });

        assert.equal(requests.length, 1);
        assert.deepEqual(requests[0]?.body, {
            name: "João Almeida",
        });
    });

    test("deve preservar o nome editado e o contexto quando a atualização falhar", async () => {
        const user = userEvent.setup();

        const { requests } = mockApiResponse({
            method: "PATCH",
            endpoint: "/auth/me",
            status: 500,
        });

        const { setUser } = renderProfile();

        await user.click(screen.getByRole("button", { name: "Editar" }));

        const nome = screen.getByRole("textbox", { name: "Nome de exibição" });

        await user.clear(nome);
        await user.type(nome, "João Almeida");
        await user.click(screen.getByRole("button", { name: "Salvar" }));

        expect(
            await screen.findByText("Não foi possível atualizar seu nome de exibição."),
        ).toBeVisible();
        expect(nome).toHaveValue("João Almeida");
        expect(screen.getByRole("button", { name: "Salvar" })).toBeEnabled();
        expect(screen.getByRole("button", { name: "Sair" })).toBeEnabled();
        expect(screen.getByRole("button", { name: "Excluir conta" })).toBeEnabled();
        expect(setUser).not.toHaveBeenCalled();
        expect(requests).toHaveLength(1);
    });

    test("deve cancelar a edição sem enviar atualização e restaurar o nome ao editar novamente", async () => {
        const user = userEvent.setup();

        const { requests } = mockApiResponse({ method: "PATCH", endpoint: "/auth/me" });

        const { setUser } = renderProfile();

        await user.click(screen.getByRole("button", { name: "Editar" }));

        const nome = screen.getByRole("textbox", { name: "Nome de exibição" });

        await user.clear(nome);
        await user.type(nome, "João Almeida");
        await user.click(screen.getByRole("button", { name: "Cancelar" }));

        expect(screen.queryByRole("textbox", { name: "Nome de exibição" })).not.toBeInTheDocument();
        expect(screen.getByText("João Silva")).toBeVisible();

        await user.click(screen.getByRole("button", { name: "Editar" }));

        expect(screen.getByRole("textbox", { name: "Nome de exibição" })).toHaveValue("João Silva");
        expect(requests).toHaveLength(0);
        expect(setUser).not.toHaveBeenCalled();
    });

    test("deve bloquear logout e exclusão enquanto salva o nome", async () => {
        const user = userEvent.setup();

        let liberarResposta!: () => void;
        const respostaPendente = new Promise<void>((resolve) => {
            liberarResposta = resolve;
        });

        server.use(
            http.patch(`${API_URL}/auth/me`, async () => {
                await respostaPendente;
                return HttpResponse.json({
                    user: { id: 1, name: "João Almeida", email: "joao@email.com" },
                });
            }),
        );
        const signOut = vi.fn(async () => {});

        const { setUser } = renderProfile({ signOut });

        await user.click(screen.getByRole("button", { name: "Editar" }));

        const nome = screen.getByRole("textbox", { name: "Nome de exibição" });

        await user.clear(nome);
        await user.type(nome, "João Almeida");

        try {
            await user.click(screen.getByRole("button", { name: "Salvar" }));

            expect(await screen.findByRole("button", { name: "Salvando..." })).toBeDisabled();
            expect(nome).toBeDisabled();
            expect(screen.getByRole("button", { name: "Cancelar" })).toBeDisabled();

            const sair = screen.getByRole("button", { name: "Sair" });
            const excluir = screen.getByRole("button", { name: "Excluir conta" });

            expect(sair).toBeDisabled();
            expect(excluir).toBeDisabled();

            await user.click(sair);
            await user.click(excluir);

            expect(signOut).not.toHaveBeenCalled();
            expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
        } finally {
            liberarResposta();
        }

        await waitFor(() =>
            expect(setUser).toHaveBeenCalledWith({
                id: 1,
                name: "João Almeida",
                email: "joao@email.com",
            }),
        );

        expect(await screen.findByRole("button", { name: "Editar" })).toBeEnabled();
        expect(screen.getByRole("button", { name: "Sair" })).toBeEnabled();
        expect(screen.getByRole("button", { name: "Excluir conta" })).toBeEnabled();
    });

    test("deve exibir falha de logout e permitir tentar novamente", async () => {
        const user = userEvent.setup();

        const signOut = vi
            .fn<() => Promise<void>>()
            .mockRejectedValueOnce(new Error("Falha temporária"))
            .mockResolvedValueOnce(undefined);

        renderProfile({ signOut });

        await user.click(screen.getByRole("button", { name: "Sair" }));

        expect(await screen.findByText("Não foi possível encerrar a sessão.")).toBeVisible();
        expect(screen.getByRole("button", { name: "Sair" })).toBeEnabled();
        expect(screen.getByText("João Silva")).toBeVisible();

        await user.click(screen.getByRole("button", { name: "Sair" }));

        await waitFor(() => {
            expect(signOut).toHaveBeenCalledTimes(2);
            expect(
                screen.queryByText("Não foi possível encerrar a sessão."),
            ).not.toBeInTheDocument();
        });
    });

    test("deve excluir a conta somente após confirmação e limpar a sessão e o cache", async () => {
        const user = userEvent.setup();

        const deleteRequest = vi.fn();
        server.use(
            http.delete(`${API_URL}/auth/me`, () => {
                deleteRequest();
                return new HttpResponse(null, { status: 204 });
            }),
        );

        const { setUser, queryClient } = renderProfile();

        queryClient.setQueryData(["library"], { privateData: "biblioteca do usuário" });

        await user.click(screen.getByRole("button", { name: "Excluir conta" }));

        const dialog = await screen.findByRole("dialog", { name: "Excluir conta?" });

        expect(deleteRequest).not.toHaveBeenCalled();

        await user.click(within(dialog).getByRole("button", { name: "Cancelar" }));

        expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
        expect(deleteRequest).not.toHaveBeenCalled();
        expect(setUser).not.toHaveBeenCalled();

        await user.click(screen.getByRole("button", { name: "Excluir conta" }));
        await user.click(
            within(await screen.findByRole("dialog")).getByRole("button", {
                name: "Excluir conta",
            }),
        );

        await waitFor(() => expect(setUser).toHaveBeenCalledWith(null));

        expect(deleteRequest).toHaveBeenCalledTimes(1);
        expect(queryClient.getQueryData(["library"])).toBeUndefined();
    });

    test("deve preservar a sessão e permitir nova tentativa quando a exclusão da conta falhar", async () => {
        const user = userEvent.setup();

        const deleteRequest = vi.fn();
        server.use(
            http.delete(`${API_URL}/auth/me`, () => {
                deleteRequest();
                return HttpResponse.json({ message: "Erro interno" }, { status: 500 });
            }),
        );

        const { setUser, queryClient } = renderProfile();

        const cachedLibrary = { privateData: "biblioteca do usuário" };

        queryClient.setQueryData(["library"], cachedLibrary);

        await user.click(screen.getByRole("button", { name: "Excluir conta" }));

        const dialog = await screen.findByRole("dialog");

        await user.click(within(dialog).getByRole("button", { name: "Excluir conta" }));

        expect(
            await within(dialog).findByText("Não foi possível excluir sua conta."),
        ).toBeVisible();
        expect(within(dialog).getByRole("button", { name: "Excluir conta" })).toBeEnabled();
        expect(setUser).not.toHaveBeenCalled();
        expect(queryClient.getQueryData(["library"])).toEqual(cachedLibrary);

        server.use(
            http.delete(`${API_URL}/auth/me`, () => {
                deleteRequest();
                return new HttpResponse(null, { status: 204 });
            }),
        );

        await user.click(within(dialog).getByRole("button", { name: "Excluir conta" }));

        await waitFor(() => expect(setUser).toHaveBeenCalledWith(null));

        expect(deleteRequest).toHaveBeenCalledTimes(2);
        expect(queryClient.getQueryData(["library"])).toBeUndefined();
    });
});
