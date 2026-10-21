import { describe, expect, test, vi } from "vitest";
import userEvent from "@testing-library/user-event";
import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter, Route, Routes } from "react-router";

import { LibraryGameDetails } from "../../../src/pages/LibraryGameDetails";
import { API_URL } from "../../../src/services/api";

import { createLibraryEntryDetails } from "../../fixtures/library.fixture";
import { createTestQueryClient } from "../../helpers/createTestQueryClient.helper";
import { mockApiResponse } from "../../mocks/api.mock";
import { server } from "../../mocks/server.mock";
import { createGameDetails } from "../../fixtures/game.fixture";

function renderLibraryGameDetails(initialEntry = "/library/1") {
    const queryClient = createTestQueryClient();

    return render(
        <QueryClientProvider client={queryClient}>
            <MemoryRouter initialEntries={["/library", initialEntry]} initialIndex={1}>
                <Routes>
                    <Route path="/library" element={<div>Biblioteca de teste</div>} />
                    <Route path="/library/:gameId" element={<LibraryGameDetails />} />
                </Routes>
            </MemoryRouter>
        </QueryClientProvider>,
    );
}

function createEntry() {
    return createLibraryEntryDetails({
        status: "PLAYING",
        rating: 4,
        startedAt: "2026-01-01",
        platforms: [{ id: 1, name: "PC" }],
    });
}

function mockGameDetails() {
    return mockApiResponse({
        method: "GET",
        endpoint: "/games/123",
        responseBody: createGameDetails({ developers: ["FromSoftware"] }),
    });
}

describe("LibraryGameDetails.tsx", () => {
    test("deve limpar horas e data de início pelos controles e confirmar a remoção antes de salvar", async () => {
        const user = userEvent.setup();
        const entry = { ...createEntry(), status: "ABANDONED", playtimeMinutes: 120 };
        mockApiResponse({
            method: "GET",
            endpoint: "/library/1",
            responseBody: { libraryEntry: entry },
        });
        mockGameDetails();
        const { requests } = mockApiResponse({
            method: "PATCH",
            endpoint: "/library/1",
            responseBody: {
                updatedLibraryEntry: { ...entry, playtimeMinutes: 0, startedAt: null },
            },
        });

        renderLibraryGameDetails();
        await user.click(await screen.findByRole("button", { name: "Limpar horas jogadas" }));
        await user.click(screen.getByRole("button", { name: "Limpar data de início" }));
        expect(screen.getByRole("textbox", { name: "Horas jogadas" })).toHaveValue("");
        expect(screen.getByLabelText("Data de início")).toHaveValue("");
        await user.click(screen.getByRole("button", { name: "Salvar alterações" }));

        const dialog = await screen.findByRole("dialog", {
            name: "Alguns dados serão removidos ao salvar",
        });
        expect(within(dialog).getByText("Horas jogadas")).toBeVisible();
        expect(within(dialog).getByText("Data de início")).toBeVisible();
        expect(requests).toHaveLength(0);
        await user.click(within(dialog).getByRole("button", { name: "Salvar mesmo assim" }));

        expect(await screen.findByRole("button", { name: "Salvo!" })).toBeVisible();
        expect(requests).toHaveLength(1);
        expect(requests[0]?.body).toMatchObject({ playtimeMinutes: 0, startedAt: null });
    });

    test("deve bloquear o salvamento sem plataformas e permitir corrigir a seleção", async () => {
        const user = userEvent.setup();
        const entry = createEntry();
        mockApiResponse({
            method: "GET",
            endpoint: "/library/1",
            responseBody: { libraryEntry: entry },
        });
        mockGameDetails();
        const { requests } = mockApiResponse({
            method: "PATCH",
            endpoint: "/library/1",
            responseBody: {
                updatedLibraryEntry: { ...entry, platforms: [{ id: 2, name: "PlayStation 5" }] },
            },
        });

        renderLibraryGameDetails();
        await user.click(await screen.findByRole("button", { name: "PC" }));
        await user.click(screen.getByRole("button", { name: "Salvar alterações" }));
        expect(await screen.findByText("Informe pelo menos uma plataforma")).toBeVisible();
        expect(requests).toHaveLength(0);

        await user.click(screen.getByRole("button", { name: "PlayStation 5" }));
        expect(screen.queryByText("Informe pelo menos uma plataforma")).not.toBeInTheDocument();
        await user.click(screen.getByRole("button", { name: "Salvar alterações" }));
        expect(await screen.findByRole("button", { name: "Salvo!" })).toBeVisible();
        expect(requests).toHaveLength(1);
        expect(requests[0]?.body).toMatchObject({ platforms: [2] });
    });

    test("deve associar o erro de datas à conclusão e impedir o PATCH até a correção", async () => {
        const user = userEvent.setup();
        const entry = { ...createEntry(), status: "COMPLETED", completedAt: "2026-01-10" };
        mockApiResponse({
            method: "GET",
            endpoint: "/library/1",
            responseBody: { libraryEntry: entry },
        });
        mockGameDetails();
        const { requests } = mockApiResponse({
            method: "PATCH",
            endpoint: "/library/1",
            responseBody: { updatedLibraryEntry: { ...entry, startedAt: "2026-01-05" } },
        });

        renderLibraryGameDetails();
        const inicio = await screen.findByLabelText("Data de início");
        const conclusao = screen.getByLabelText("Data de conclusão");
        fireEvent.change(inicio, { target: { value: "2026-01-05" } });
        fireEvent.change(conclusao, { target: { value: "2026-01-02" } });
        // Submete diretamente para exercitar a validação da aplicação além do min nativo do input.
        fireEvent.submit(inicio.closest("form")!);

        expect(
            await screen.findByText("A data de conclusão não pode ser anterior à data de início"),
        ).toBeVisible();
        expect(conclusao).toHaveAttribute("aria-invalid", "true");
        expect(requests).toHaveLength(0);

        fireEvent.change(conclusao, { target: { value: "2026-01-10" } });
        expect(conclusao).toHaveAttribute("aria-invalid", "false");
        await user.click(screen.getByRole("button", { name: "Salvar alterações" }));
        expect(await screen.findByRole("button", { name: "Salvo!" })).toBeVisible();
        expect(requests).toHaveLength(1);
    });

    test("deve enviar status, horas, datas e plataformas editados no formulário", async () => {
        const user = userEvent.setup();
        const entry = createEntry();
        const updatedEntry = {
            ...entry,
            status: "COMPLETED",
            playtimeMinutes: 750,
            startedAt: "2026-01-03",
            completedAt: "2026-01-10",
            platforms: [{ id: 2, name: "PlayStation 5" }],
        };
        mockApiResponse({
            method: "GET",
            endpoint: "/library/1",
            responseBody: { libraryEntry: entry },
        });
        mockGameDetails();
        const { requests } = mockApiResponse({
            method: "PATCH",
            endpoint: "/library/1",
            responseBody: { updatedLibraryEntry: updatedEntry },
        });

        renderLibraryGameDetails();
        await user.click(await screen.findByRole("button", { name: "Zerado" }));
        const horas = screen.getByRole("textbox", { name: "Horas jogadas" });
        await user.clear(horas);
        await user.type(horas, "12,5");

        // O seletor nativo de datas não é implementado no JSDOM.
        fireEvent.change(screen.getByLabelText("Data de início"), {
            target: { value: "2026-01-03" },
        });
        fireEvent.change(screen.getByLabelText("Data de conclusão"), {
            target: { value: "2026-01-10" },
        });
        await user.click(screen.getByRole("button", { name: "PlayStation 5" }));
        await user.click(screen.getByRole("button", { name: "PC" }));
        await user.click(screen.getByRole("button", { name: "Salvar alterações" }));

        expect(await screen.findByRole("button", { name: "Salvo!" })).toBeVisible();
        expect(requests).toHaveLength(1);
        expect(requests[0]?.body).toMatchObject({
            status: "COMPLETED",
            playtimeMinutes: 750,
            startedAt: "2026-01-03T00:00:00.000Z",
            completedAt: "2026-01-10T00:00:00.000Z",
            platforms: [2],
        });
    });

    test("deve mostrar a validação de nota inválida e impedir o PATCH", async () => {
        const user = userEvent.setup();
        mockApiResponse({
            method: "GET",
            endpoint: "/library/1",
            responseBody: { libraryEntry: createEntry() },
        });
        mockGameDetails();
        const { requests } = mockApiResponse({ method: "PATCH", endpoint: "/library/1" });

        renderLibraryGameDetails();
        const nota = await screen.findByRole("textbox", { name: "Nota" });
        await user.clear(nota);
        await user.type(nota, "6");
        await user.click(screen.getByRole("button", { name: "Salvar alterações" }));

        expect(await screen.findByText("A nota deve ser no máximo 5")).toBeVisible();
        expect(nota).toHaveAttribute("aria-invalid", "true");
        expect(requests).toHaveLength(0);
        expect(screen.queryByRole("button", { name: "Salvo!" })).not.toBeInTheDocument();
    });

    test("deve salvar uma alteração na nota do jogo", async () => {
        const user = userEvent.setup();

        const entry = createEntry();

        mockApiResponse({
            method: "GET",
            endpoint: "/library/1",
            responseBody: { libraryEntry: entry },
        });

        mockGameDetails();

        const { requests } = mockApiResponse({
            method: "PATCH",
            endpoint: "/library/1",
            responseBody: {
                updatedLibraryEntry: { ...entry, rating: 5 },
            },
        });

        renderLibraryGameDetails();

        const campoNota = await screen.findByRole("textbox", {
            name: "Nota",
        });

        expect(campoNota).toHaveValue("4");

        await user.clear(campoNota);
        await user.type(campoNota, "5");
        await user.click(screen.getByRole("button", { name: "Salvar alterações" }));

        expect(await screen.findByRole("button", { name: "Salvo!" })).toBeVisible();
        expect(requests).toHaveLength(1);
        expect(requests[0]?.body).toMatchObject({
            rating: 5,
        });
    });

    test("deve preservar a edição e permitir nova tentativa quando o salvamento falhar", async () => {
        const user = userEvent.setup();
        const entry = createEntry();
        mockApiResponse({
            method: "GET",
            endpoint: "/library/1",
            responseBody: { libraryEntry: entry },
        });
        mockGameDetails();
        const { requests } = mockApiResponse({
            method: "PATCH",
            endpoint: "/library/1",
            status: 500,
            responseBody: { message: "Erro interno" },
        });

        renderLibraryGameDetails();
        const nota = await screen.findByRole("textbox", { name: "Nota" });
        await user.clear(nota);
        await user.type(nota, "5");
        await user.click(screen.getByRole("button", { name: "Salvar alterações" }));

        expect(await screen.findByText("Não foi possível salvar as alterações.")).toBeVisible();
        expect(nota).toHaveValue("5");
        expect(screen.getByRole("button", { name: "Salvar alterações" })).toBeEnabled();
        expect(screen.queryByRole("button", { name: "Salvo!" })).not.toBeInTheDocument();
        expect(requests).toHaveLength(1);

        const retry = mockApiResponse({
            method: "PATCH",
            endpoint: "/library/1",
            responseBody: { updatedLibraryEntry: { ...entry, rating: 5 } },
        });
        await user.click(screen.getByRole("button", { name: "Salvar alterações" }));
        expect(await screen.findByRole("button", { name: "Salvo!" })).toBeVisible();
        expect(
            screen.queryByText("Não foi possível salvar as alterações."),
        ).not.toBeInTheDocument();
        expect(retry.requests).toHaveLength(1);
        expect(retry.requests[0]?.body).toMatchObject({ rating: 5 });
    });

    test("deve restaurar os valores ao descartar alterações sem enviar PATCH", async () => {
        const user = userEvent.setup();
        mockApiResponse({
            method: "GET",
            endpoint: "/library/1",
            responseBody: { libraryEntry: createEntry() },
        });
        mockGameDetails();
        const { requests } = mockApiResponse({ method: "PATCH", endpoint: "/library/1" });

        renderLibraryGameDetails();
        const nota = await screen.findByRole("textbox", { name: "Nota" });
        await user.clear(nota);
        await user.type(nota, "5");
        await user.click(screen.getByRole("button", { name: "Descartar alterações" }));

        expect(nota).toHaveValue("4");
        expect(screen.getByRole("button", { name: "Salvar alterações" })).toBeDisabled();
        expect(
            screen.queryByRole("button", { name: "Descartar alterações" }),
        ).not.toBeInTheDocument();
        expect(requests).toHaveLength(0);
    });

    test("deve exigir confirmação antes de salvar uma alteração que remove a nota", async () => {
        const user = userEvent.setup();
        const entry = createEntry();
        mockApiResponse({
            method: "GET",
            endpoint: "/library/1",
            responseBody: { libraryEntry: entry },
        });
        mockGameDetails();
        const { requests } = mockApiResponse({
            method: "PATCH",
            endpoint: "/library/1",
            responseBody: { updatedLibraryEntry: { ...entry, rating: null } },
        });

        renderLibraryGameDetails();
        await user.clear(await screen.findByRole("textbox", { name: "Nota" }));
        await user.click(screen.getByRole("button", { name: "Salvar alterações" }));

        const dialog = await screen.findByRole("dialog", {
            name: "Alguns dados serão removidos ao salvar",
        });
        expect(within(dialog).getByText("Nota")).toBeVisible();
        expect(requests).toHaveLength(0);

        await user.click(within(dialog).getByRole("button", { name: "Voltar" }));
        expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
        expect(requests).toHaveLength(0);

        await user.click(screen.getByRole("button", { name: "Salvar alterações" }));
        const confirmation = await screen.findByRole("dialog");
        await user.click(within(confirmation).getByRole("button", { name: "Salvar mesmo assim" }));

        expect(await screen.findByRole("button", { name: "Salvo!" })).toBeVisible();
        expect(requests).toHaveLength(1);
        expect(requests[0]?.body).toMatchObject({ rating: null });
    });

    test("deve remover somente após confirmação e voltar à página anterior", async () => {
        const user = userEvent.setup();
        mockApiResponse({
            method: "GET",
            endpoint: "/library/1",
            responseBody: { libraryEntry: createEntry() },
        });
        mockGameDetails();
        const deleteRequest = vi.fn();
        server.use(
            http.delete(`${API_URL}/library/1`, () => {
                deleteRequest();
                return new HttpResponse(null, { status: 204 });
            }),
        );

        renderLibraryGameDetails();
        await user.click(await screen.findByRole("button", { name: "Remover" }));
        const dialog = await screen.findByRole("dialog", { name: "Remover da biblioteca?" });
        expect(within(dialog).getByText("Elden Ring")).toBeVisible();
        expect(deleteRequest).not.toHaveBeenCalled();

        await user.click(within(dialog).getByRole("button", { name: "Cancelar" }));
        expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
        expect(deleteRequest).not.toHaveBeenCalled();

        await user.click(screen.getByRole("button", { name: "Remover" }));
        await user.click(
            within(await screen.findByRole("dialog")).getByRole("button", { name: "Remover" }),
        );

        expect(await screen.findByText("Biblioteca de teste")).toBeVisible();
        expect(deleteRequest).toHaveBeenCalledTimes(1);
    });

    test("deve manter o modal aberto e permitir nova tentativa quando a remoção falhar", async () => {
        const user = userEvent.setup();
        mockApiResponse({
            method: "GET",
            endpoint: "/library/1",
            responseBody: { libraryEntry: createEntry() },
        });
        mockGameDetails();
        const deleteRequest = vi.fn();
        server.use(
            http.delete(`${API_URL}/library/1`, () => {
                deleteRequest();
                return HttpResponse.json({ message: "Erro interno" }, { status: 500 });
            }),
        );

        renderLibraryGameDetails();
        await user.click(await screen.findByRole("button", { name: "Remover" }));
        const dialog = await screen.findByRole("dialog");
        await user.click(within(dialog).getByRole("button", { name: "Remover" }));

        expect(
            await within(dialog).findByText("Não foi possível remover o jogo da biblioteca."),
        ).toBeVisible();
        expect(within(dialog).getByRole("button", { name: "Remover" })).toBeEnabled();
        expect(screen.queryByText("Biblioteca de teste")).not.toBeInTheDocument();

        server.use(
            http.delete(`${API_URL}/library/1`, () => {
                deleteRequest();
                return new HttpResponse(null, { status: 204 });
            }),
        );
        await user.click(within(dialog).getByRole("button", { name: "Remover" }));
        expect(await screen.findByText("Biblioteca de teste")).toBeVisible();
        expect(deleteRequest).toHaveBeenCalledTimes(2);
    });

    test("deve recuperar o formulário ao tentar novamente após falha no carregamento", async () => {
        const user = userEvent.setup();
        mockApiResponse({ method: "GET", endpoint: "/library/1", status: 500 });
        mockGameDetails();
        renderLibraryGameDetails();

        expect(await screen.findByText("Não foi possível carregar o jogo")).toBeVisible();
        expect(screen.queryByRole("textbox", { name: "Nota" })).not.toBeInTheDocument();

        mockApiResponse({
            method: "GET",
            endpoint: "/library/1",
            responseBody: { libraryEntry: createEntry() },
        });
        await user.click(screen.getByRole("button", { name: "Tentar novamente" }));

        expect(await screen.findByRole("textbox", { name: "Nota" })).toHaveValue("4");
        expect(screen.queryByText("Não foi possível carregar o jogo")).not.toBeInTheDocument();
    });

    test("deve informar quando o jogo não existe e permitir voltar à biblioteca", async () => {
        const user = userEvent.setup();
        mockApiResponse({ method: "GET", endpoint: "/library/1", status: 404 });
        renderLibraryGameDetails();

        expect(await screen.findByText("Jogo não encontrado na biblioteca")).toBeVisible();
        expect(screen.queryByRole("textbox", { name: "Nota" })).not.toBeInTheDocument();
        await user.click(screen.getByRole("link", { name: "Voltar para biblioteca" }));
        expect(await screen.findByText("Biblioteca de teste")).toBeVisible();
    });

    test("deve permitir edição quando os metadados falharem e recuperá-los sem perder a edição", async () => {
        const user = userEvent.setup();
        mockApiResponse({
            method: "GET",
            endpoint: "/library/1",
            responseBody: { libraryEntry: createEntry() },
        });
        mockApiResponse({ method: "GET", endpoint: "/games/123", status: 500 });
        renderLibraryGameDetails();

        const aviso = "Algumas informações do jogo não puderam ser carregadas.";
        expect(await screen.findByText(aviso)).toBeVisible();
        const nota = screen.getByRole("textbox", { name: "Nota" });
        await user.clear(nota);
        await user.type(nota, "5");
        expect(screen.getByRole("button", { name: "Salvar alterações" })).toBeEnabled();

        mockGameDetails();
        await user.click(screen.getByRole("button", { name: "Tentar novamente" }));
        expect(await screen.findByText("FromSoftware")).toBeVisible();
        await waitFor(() => expect(screen.queryByText(aviso)).not.toBeInTheDocument());
        expect(nota).toHaveValue("5");
    });
});
