import { assert, describe, expect, test } from "vitest";
import { MemoryRouter, useLocation } from "react-router";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClientProvider } from "@tanstack/react-query";
import { http, HttpResponse } from "msw";

import { SearchGames } from "../../../src/pages/SearchGames";
import { API_URL } from "../../../src/services/api";

import { createTestQueryClient } from "../../helpers/createTestQueryClient.helper";
import { mockApiResponse } from "../../mocks/api.mock";
import { server } from "../../mocks/server.mock";
import { createLibraryEntry } from "../../fixtures/library.fixture";
import { createGameSearchResult } from "../../fixtures/game.fixture";

function LocalizacaoDeTeste() {
    const location = useLocation();

    return (
        <output data-testid="url-atual">
            {location.pathname}
            {location.search}
        </output>
    );
}

function renderSearchGames() {
    const queryClient = createTestQueryClient();

    return render(
        <QueryClientProvider client={queryClient}>
            <MemoryRouter initialEntries={["/search"]}>
                <SearchGames />
                <LocalizacaoDeTeste />
            </MemoryRouter>
        </QueryClientProvider>,
    );
}

const game = createGameSearchResult();

describe("SearchGames.tsx", () => {
    test("deve buscar jogos e exibir os resultados da pesquisa", async () => {
        const user = userEvent.setup();

        mockApiResponse({
            method: "GET",
            endpoint: "/library",
            responseBody: { libraryEntries: [] },
        });

        let queryRecebida: string | null = null;

        server.use(
            http.get(`${API_URL}/games/search`, ({ request }) => {
                const url = new URL(request.url);

                queryRecebida = url.searchParams.get("query");

                return HttpResponse.json([game]);
            }),
        );

        renderSearchGames();

        await user.type(
            screen.getByRole("searchbox", { name: "Pesquisar jogos" }),
            "  Elden Ring  ",
        );
        await user.click(screen.getByRole("button", { name: "Pesquisar" }));

        expect(await screen.findByRole("heading", { name: "Elden Ring" })).toBeVisible();
        assert.equal(queryRecebida, "Elden Ring");
    });

    test("deve exibir os resultados ao tentar novamente após uma falha na busca", async () => {
        const user = userEvent.setup();

        mockApiResponse({
            method: "GET",
            endpoint: "/library",
            responseBody: { libraryEntries: [] },
        });

        mockApiResponse({
            method: "GET",
            endpoint: "/games/search",
            status: 500,
            responseBody: { message: "Erro interno" },
        });

        renderSearchGames();

        await user.type(screen.getByRole("searchbox", { name: "Pesquisar jogos" }), "Elden Ring");
        await user.click(screen.getByRole("button", { name: "Pesquisar" }));

        expect(await screen.findByText("Não foi possível buscar os jogos")).toBeVisible();

        mockApiResponse({
            method: "GET",
            endpoint: "/games/search",
            responseBody: [game],
        });

        await user.click(screen.getByRole("button", { name: "Tentar novamente" }));

        expect(await screen.findByRole("heading", { name: "Elden Ring" })).toBeVisible();
        expect(screen.queryByText("Não foi possível buscar os jogos")).not.toBeInTheDocument();
    });

    test("deve preservar os resultados e recuperar a identificação dos jogos após falha da biblioteca", async () => {
        const user = userEvent.setup();

        mockApiResponse({
            method: "GET",
            endpoint: "/library",
            status: 500,
            responseBody: { message: "Erro interno" },
        });

        mockApiResponse({
            method: "GET",
            endpoint: "/games/search",
            responseBody: [game],
        });

        renderSearchGames();

        await user.type(screen.getByRole("searchbox", { name: "Pesquisar jogos" }), "Elden Ring");
        await user.click(screen.getByRole("button", { name: "Pesquisar" }));

        expect(await screen.findByRole("heading", { name: "Elden Ring" })).toBeVisible();

        const aviso = "Não foi possível verificar quais jogos já estão na sua biblioteca.";

        expect(await screen.findByText(aviso)).toBeVisible();
        expect(screen.queryByText("Na biblioteca")).not.toBeInTheDocument();

        mockApiResponse({
            method: "GET",
            endpoint: "/library",
            responseBody: {
                libraryEntries: [createLibraryEntry()],
            },
        });

        await user.click(screen.getByRole("button", { name: "Tentar novamente" }));

        expect(await screen.findByText("Na biblioteca")).toBeVisible();
        expect(screen.queryByText(aviso)).not.toBeInTheDocument();
        expect(screen.getByRole("heading", { name: "Elden Ring" })).toBeVisible();
    });

    test("deve limpar o campo, os resultados e o parâmetro da pesquisa", async () => {
        const user = userEvent.setup();

        mockApiResponse({
            method: "GET",
            endpoint: "/library",
            responseBody: { libraryEntries: [] },
        });

        mockApiResponse({
            method: "GET",
            endpoint: "/games/search",
            responseBody: [game],
        });

        renderSearchGames();

        const campo = screen.getByRole("searchbox", {
            name: "Pesquisar jogos",
        });

        await user.type(campo, "Elden Ring");
        await user.click(screen.getByRole("button", { name: "Pesquisar" }));

        expect(await screen.findByRole("heading", { name: "Elden Ring" })).toBeVisible();
        expect(screen.getByTestId("url-atual")).toHaveTextContent(/[?&]query=/);

        await user.click(screen.getByRole("button", { name: "Limpar pesquisa" }));

        expect(await screen.findByText("Encontre seu próximo jogo")).toBeVisible();
        expect(campo).toHaveValue("");
        expect(screen.queryByRole("heading", { name: "Elden Ring" })).not.toBeInTheDocument();
        expect(screen.getByTestId("url-atual")).toHaveTextContent(/^\/search$/);
    });
});
