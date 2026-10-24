import { assert, describe, expect, test } from "vitest";
import { MemoryRouter, useLocation, useNavigate, Routes, Route } from "react-router";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClientProvider } from "@tanstack/react-query";
import { http, HttpResponse, delay } from "msw";

import { SearchGames } from "../../../src/pages/SearchGames";
import { API_URL } from "../../../src/services/api";

import { createTestQueryClient } from "../../helpers/createTestQueryClient.helper";
import { mockApiResponse } from "../../mocks/api.mock";
import { server } from "../../mocks/server.mock";
import { createLibraryEntry } from "../../fixtures/library.fixture";
import { createGameSearchResult } from "../../fixtures/game.fixture";

function DetailsForTest() {
    const navigate = useNavigate();

    return <button onClick={() => navigate(-1)}>Voltar à busca</button>;
}

function LocalizacaoDeTeste() {
    const location = useLocation();

    return (
        <output data-testid="url-atual">
            {location.pathname}
            {location.search}
        </output>
    );
}

function renderSearchGames(initialEntry = "/search") {
    const queryClient = createTestQueryClient();
    queryClient.setQueryDefaults(["games", "search"], { staleTime: 60_000 });

    return render(
        <QueryClientProvider client={queryClient}>
            <MemoryRouter initialEntries={[initialEntry]}>
                <Routes>
                    <Route path="/search" element={<SearchGames />} />
                    <Route path="/games/:externalId" element={<DetailsForTest />} />
                </Routes>
                <LocalizacaoDeTeste />
            </MemoryRouter>
        </QueryClientProvider>,
    );
}

const game = createGameSearchResult();

describe("paginação da busca", () => {
    function mockLibrary() {
        mockApiResponse({
            method: "GET",
            endpoint: "/library",
            responseBody: { libraryEntries: [] },
        });
    }

    test("deve navegar entre páginas e reutilizar a primeira página em cache", async () => {
        const user = userEvent.setup();
        const pages: number[] = [];
        mockLibrary();

        server.use(
            http.get(`${API_URL}/games/search`, ({ request }) => {
                const url = new URL(request.url);
                const page = Number(url.searchParams.get("page"));
                pages.push(page);

                assert.equal(url.searchParams.get("query"), "a");

                return HttpResponse.json({
                    games: [
                        createGameSearchResult({
                            title: `Jogo da página ${page}`,
                            externalId: page,
                        }),
                    ],
                    page,
                    hasPrevious: page > 1,
                    hasNext: page < 2,
                });
            }),
        );

        renderSearchGames("/search?query=a");

        expect(await screen.findByRole("heading", { name: "Jogo da página 1" })).toBeVisible();
        expect(screen.getByRole("button", { name: "Anterior" })).toBeDisabled();

        await user.click(screen.getByRole("button", { name: "Próxima" }));

        expect(await screen.findByRole("heading", { name: "Jogo da página 2" })).toBeVisible();
        expect(screen.getByTestId("url-atual")).toHaveTextContent("query=a&page=2");
        expect(screen.getByRole("button", { name: "Próxima" })).toBeDisabled();
        expect(screen.queryByRole("heading", { name: "Jogo da página 1" })).not.toBeInTheDocument();

        await user.click(screen.getByRole("button", { name: "Anterior" }));

        expect(await screen.findByRole("heading", { name: "Jogo da página 1" })).toBeVisible();
        assert.deepEqual(pages, [1, 2]);
    });

    test("deve abrir a página da URL e preservá-la ao voltar dos detalhes", async () => {
        const user = userEvent.setup();
        mockLibrary();
        const { requests } = mockApiResponse({
            method: "GET",
            endpoint: "/games/search",
            responseBody: { games: [game], page: 2, hasPrevious: true, hasNext: false },
        });

        renderSearchGames("/search?query=Elden+Ring&page=2");

        expect(await screen.findByRole("heading", { name: "Elden Ring" })).toBeVisible();
        assert.equal(new URL(requests[0]!.url).searchParams.get("page"), "2");

        await user.click(screen.getByRole("link", { name: /Elden Ring/ }));
        await user.click(screen.getByRole("button", { name: "Voltar à busca" }));

        expect(await screen.findByText("Página 2")).toBeVisible();
        expect(screen.getByRole("searchbox", { name: "Pesquisar jogos" })).toHaveValue(
            "Elden Ring",
        );
        expect(screen.getByTestId("url-atual")).toHaveTextContent("query=Elden+Ring&page=2");
        assert.equal(requests.length, 1);
    });

    test("deve reiniciar na primeira página ao pesquisar outro termo", async () => {
        const user = userEvent.setup();
        mockLibrary();
        const queries: string[] = [];

        server.use(
            http.get(`${API_URL}/games/search`, async ({ request }) => {
                const url = new URL(request.url);
                const query = url.searchParams.get("query")!;
                queries.push(url.search);
                if (query === "Mario") await delay(100);

                return HttpResponse.json({
                    games: [createGameSearchResult({ title: query })],
                    page: Number(url.searchParams.get("page")),
                    hasPrevious: query !== "Mario",
                    hasNext: false,
                });
            }),
        );

        renderSearchGames("/search?query=Zelda&page=2");
        await screen.findByRole("heading", { name: "Zelda" });

        const input = screen.getByRole("searchbox", { name: "Pesquisar jogos" });
        await user.clear(input);
        await user.type(input, "Mario");
        await user.click(screen.getByRole("button", { name: "Pesquisar" }));

        expect(screen.queryByRole("heading", { name: "Zelda" })).not.toBeInTheDocument();
        expect(await screen.findByRole("heading", { name: "Mario" })).toBeVisible();
        expect(screen.getByText("Página 1")).toBeVisible();
        expect(screen.getByTestId("url-atual")).not.toHaveTextContent("page=2");
        assert.include(queries[1], "page=1");
    });

    test("deve ocultar a navegação enquanto busca a próxima página", async () => {
        const user = userEvent.setup();
        mockLibrary();

        server.use(
            http.get(`${API_URL}/games/search`, async ({ request }) => {
                const page = Number(new URL(request.url).searchParams.get("page"));
                if (page === 2) await delay(200);

                return HttpResponse.json({
                    games: [game],
                    page,
                    hasPrevious: page > 1,
                    hasNext: true,
                });
            }),
        );

        renderSearchGames("/search?query=gta");
        await screen.findByRole("heading", { name: "Elden Ring" });

        await user.click(screen.getByRole("button", { name: "Próxima" }));

        expect(screen.getByText("Buscando jogos...")).toBeVisible();
        expect(
            screen.queryByRole("navigation", { name: "Paginação dos jogos" }),
        ).not.toBeInTheDocument();

        await waitFor(() => expect(screen.getByRole("button", { name: "Anterior" })).toBeEnabled());
    });

    test("deve permitir repetir uma página com erro e ocultar a paginação sem resultados", async () => {
        const user = userEvent.setup();
        mockLibrary();
        mockApiResponse({
            method: "GET",
            endpoint: "/games/search",
            status: 502,
            responseBody: { message: "Falha RAWG" },
        });

        renderSearchGames("/search?query=gta&page=2");
        await screen.findByText("Não foi possível buscar os jogos");

        expect(
            screen.queryByRole("navigation", { name: "Paginação dos jogos" }),
        ).not.toBeInTheDocument();

        const { requests } = mockApiResponse({
            method: "GET",
            endpoint: "/games/search",
            responseBody: { games: [], page: 2, hasPrevious: true, hasNext: false },
        });

        await user.click(screen.getByRole("button", { name: "Tentar novamente" }));

        expect(await screen.findByText("Nenhum jogo encontrado")).toBeVisible();
        expect(
            screen.queryByRole("navigation", { name: "Paginação dos jogos" }),
        ).not.toBeInTheDocument();
        assert.equal(new URL(requests[0]!.url).searchParams.get("page"), "2");
    });

    test.each(["0", "-1", "abc", "1.5"])(
        "deve usar a primeira página quando a URL contém page=%s",
        async (page) => {
            mockLibrary();
            const { requests } = mockApiResponse({
                method: "GET",
                endpoint: "/games/search",
                responseBody: { games: [game], page: 1, hasPrevious: false, hasNext: false },
            });

            renderSearchGames(`/search?query=gta&page=${page}`);

            expect(await screen.findByText("Página 1")).toBeVisible();
            assert.equal(new URL(requests[0]!.url).searchParams.get("page"), "1");
        },
    );
});

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

                return HttpResponse.json({
                    games: [game],
                    page: 1,
                    hasPrevious: false,
                    hasNext: false,
                });
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
            responseBody: { games: [game], page: 1, hasPrevious: false, hasNext: false },
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
            responseBody: { games: [game], page: 1, hasPrevious: false, hasNext: false },
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
            responseBody: { games: [game], page: 1, hasPrevious: false, hasNext: false },
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
