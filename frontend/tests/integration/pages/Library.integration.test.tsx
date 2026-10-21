import { assert, describe, expect, test } from "vitest";
import { MemoryRouter } from "react-router";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClientProvider } from "@tanstack/react-query";
import { http, HttpResponse } from "msw";

import { Library } from "../../../src/pages/Library";
import { API_URL } from "../../../src/services/api";

import { createTestQueryClient } from "../../helpers/createTestQueryClient.helper";
import { createLibraryEntry } from "../../fixtures/library.fixture";
import { server } from "../../mocks/server.mock";

function renderLibrary(initialEntry = "/library") {
    const queryClient = createTestQueryClient();

    return render(
        <QueryClientProvider client={queryClient}>
            <MemoryRouter initialEntries={[initialEntry]}>
                <Library />
            </MemoryRouter>
        </QueryClientProvider>,
    );
}

function createLibraryGames() {
    const eldenRing = createLibraryEntry({ status: "PLAYING" });
    const hades = createLibraryEntry({
        status: "COMPLETED",
        game: {
            id: 2,
            externalId: 456,
            title: "Hades",
            coverUrl: null,
            releaseDate: "2020-09-17",
        },
    });

    return { eldenRing, hades };
}

describe("Library.tsx", () => {
    test("deve filtrar os jogos da biblioteca pelo status selecionado", async () => {
        const user = userEvent.setup();

        const { eldenRing, hades } = createLibraryGames();

        let statusRecebido: string | null = null;

        server.use(
            http.get(`${API_URL}/library`, ({ request }) => {
                const status = new URL(request.url).searchParams.get("status");

                if (status === "PLAYING") {
                    statusRecebido = status;

                    return HttpResponse.json({
                        libraryEntries: [eldenRing],
                    });
                }

                return HttpResponse.json({
                    libraryEntries: [eldenRing, hades],
                });
            }),
        );

        renderLibrary();

        expect(await screen.findByRole("heading", { name: "Elden Ring" })).toBeVisible();
        expect(await screen.findByRole("heading", { name: "Hades" })).toBeVisible();

        await user.click(screen.getByRole("button", { name: /^Jogando/i }));

        await waitFor(() => {
            assert.equal(statusRecebido, "PLAYING");
            expect(screen.getByRole("heading", { name: "Elden Ring" })).toBeVisible();
            expect(screen.queryByRole("heading", { name: "Hades" })).not.toBeInTheDocument();
        });

        expect(screen.getByRole("button", { name: /^Jogando/i })).toHaveAttribute(
            "aria-pressed",
            "true",
        );
        expect(screen.getByRole("button", { name: /^Todos/i })).toHaveTextContent("2");
    });

    test("deve filtrar por título sem perder o status selecionado", async () => {
        const user = userEvent.setup();
        const { eldenRing, hades } = createLibraryGames();
        const searches: { search: string | null; status: string | null }[] = [];

        server.use(
            http.get(`${API_URL}/library`, ({ request }) => {
                const params = new URL(request.url).searchParams;
                const search = params.get("search");
                const status = params.get("status");

                if (search) {
                    searches.push({ search, status });
                    return HttpResponse.json({ libraryEntries: [eldenRing] });
                }

                return HttpResponse.json({
                    libraryEntries: status === "PLAYING" ? [eldenRing] : [eldenRing, hades],
                });
            }),
        );

        renderLibrary();
        expect(await screen.findByRole("heading", { name: "Hades" })).toBeVisible();

        await user.click(screen.getByRole("button", { name: /^Jogando/i }));
        await waitFor(() => {
            expect(screen.getByRole("heading", { name: "Elden Ring" })).toBeVisible();
            expect(screen.queryByRole("heading", { name: "Hades" })).not.toBeInTheDocument();
        });

        await user.type(
            screen.getByRole("textbox", { name: "Filtrar biblioteca por título" }),
            "  Elden Ring  ",
        );

        await waitFor(
            () => {
                expect(searches).toContainEqual({ search: "Elden Ring", status: "PLAYING" });
                expect(screen.getByRole("heading", { name: "Elden Ring" })).toBeVisible();
                expect(screen.queryByRole("heading", { name: "Hades" })).not.toBeInTheDocument();
            },
            { timeout: 2000 },
        );

        expect(screen.getByRole("button", { name: /^Jogando/i })).toHaveAttribute(
            "aria-pressed",
            "true",
        );
    });

    test("deve limpar os filtros e recuperar os jogos após uma busca sem resultados", async () => {
        const user = userEvent.setup();
        const { eldenRing, hades } = createLibraryGames();

        server.use(
            http.get(`${API_URL}/library`, ({ request }) => {
                const params = new URL(request.url).searchParams;
                return HttpResponse.json({
                    libraryEntries:
                        params.has("search") || params.has("status") ? [] : [eldenRing, hades],
                });
            }),
        );

        renderLibrary("/library?status=PLAYING&search=inexistente");

        expect(await screen.findByText("Nenhum jogo encontrado")).toBeVisible();
        expect(screen.queryByText("Sua biblioteca está vazia")).not.toBeInTheDocument();

        await user.click(screen.getByRole("button", { name: "Limpar filtros" }));

        expect(await screen.findByRole("heading", { name: "Elden Ring" })).toBeVisible();
        expect(await screen.findByRole("heading", { name: "Hades" })).toBeVisible();
        expect(screen.getByRole("textbox", { name: "Filtrar biblioteca por título" })).toHaveValue(
            "",
        );
        expect(screen.getByRole("button", { name: /^Todos/i })).toHaveAttribute(
            "aria-pressed",
            "true",
        );
        expect(screen.queryByText("Nenhum jogo encontrado")).not.toBeInTheDocument();
    });

    test("deve carregar os jogos ao tentar novamente após uma falha na biblioteca", async () => {
        const user = userEvent.setup();
        const { eldenRing, hades } = createLibraryGames();

        server.use(
            http.get(`${API_URL}/library`, () =>
                HttpResponse.json({ message: "Erro interno" }, { status: 500 }),
            ),
        );

        renderLibrary();

        expect(await screen.findByText("Não foi possível carregar sua biblioteca")).toBeVisible();
        expect(screen.queryByText("Sua biblioteca está vazia")).not.toBeInTheDocument();

        server.use(
            http.get(`${API_URL}/library`, () =>
                HttpResponse.json({ libraryEntries: [eldenRing, hades] }),
            ),
        );

        await user.click(screen.getByRole("button", { name: "Tentar novamente" }));

        expect(await screen.findByRole("heading", { name: "Elden Ring" })).toBeVisible();
        expect(await screen.findByRole("heading", { name: "Hades" })).toBeVisible();
        expect(
            screen.queryByText("Não foi possível carregar sua biblioteca"),
        ).not.toBeInTheDocument();
    });

    test("deve preservar os jogos filtrados e recuperar os contadores após falha da consulta geral", async () => {
        const user = userEvent.setup();
        const { eldenRing, hades } = createLibraryGames();

        server.use(
            http.get(`${API_URL}/library`, ({ request }) => {
                const status = new URL(request.url).searchParams.get("status");
                return status === "PLAYING"
                    ? HttpResponse.json({ libraryEntries: [eldenRing] })
                    : HttpResponse.json({ message: "Erro interno" }, { status: 500 });
            }),
        );

        renderLibrary("/library?status=PLAYING");

        const aviso = "Não foi possível atualizar os contadores da biblioteca.";
        expect(await screen.findByText(aviso)).toBeVisible();
        expect(screen.getByRole("heading", { name: "Elden Ring" })).toBeVisible();
        expect(screen.queryByRole("heading", { name: "Hades" })).not.toBeInTheDocument();

        server.use(
            http.get(`${API_URL}/library`, ({ request }) => {
                const status = new URL(request.url).searchParams.get("status");
                return HttpResponse.json({
                    libraryEntries: status === "PLAYING" ? [eldenRing] : [eldenRing, hades],
                });
            }),
        );

        await user.click(screen.getByRole("button", { name: "Tentar novamente" }));

        await waitFor(() => {
            expect(screen.queryByText(aviso)).not.toBeInTheDocument();
            expect(screen.getByRole("button", { name: /^Todos/i })).toHaveTextContent("2");
            expect(screen.getByRole("button", { name: /^Jogando/i })).toHaveTextContent("1");
            expect(screen.getByRole("button", { name: /^Zerado/i })).toHaveTextContent("1");
        });

        expect(screen.getByRole("heading", { name: "Elden Ring" })).toBeVisible();
        expect(screen.queryByRole("heading", { name: "Hades" })).not.toBeInTheDocument();
        expect(screen.getByRole("button", { name: /^Jogando/i })).toHaveAttribute(
            "aria-pressed",
            "true",
        );
    });
});
