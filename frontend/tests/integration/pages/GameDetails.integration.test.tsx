import { describe, expect, test } from "vitest";
import { MemoryRouter, Route, Routes, useLocation } from "react-router";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClientProvider } from "@tanstack/react-query";

import { GameDetails } from "../../../src/pages/GameDetails";

import { createTestQueryClient } from "../../helpers/createTestQueryClient.helper";
import { createLibraryEntry } from "../../fixtures/library.fixture";
import { mockApiResponse } from "../../mocks/api.mock";
import { createGameDetails } from "../../fixtures/game.fixture";

const game = createGameDetails({
    description: "Explore as Terras Intermédias.",
    genres: ["RPG"],
    developers: ["FromSoftware"],
});

function CurrentLocation() {
    const location = useLocation();

    return (
        <output data-testid="url-atual">
            {location.pathname}
            {location.search}
        </output>
    );
}

function renderGameDetails(initialEntry = "/games/123", previousEntry = "/games/search") {
    const queryClient = createTestQueryClient();

    return render(
        <QueryClientProvider client={queryClient}>
            <MemoryRouter initialEntries={[previousEntry, initialEntry]} initialIndex={1}>
                <Routes>
                    <Route path="/games/search" element={<div>Busca de teste</div>} />
                    <Route path="/games/:externalId" element={<GameDetails />} />
                    <Route
                        path="/library/:gameId"
                        element={<div>Jogo na biblioteca de teste</div>}
                    />
                </Routes>
                <CurrentLocation />
            </MemoryRouter>
        </QueryClientProvider>,
    );
}

describe("GameDetails.tsx", () => {
    test.each(["/games/123", "/games/invalido"])(
        "deve preservar a pesquisa e a página ao voltar de %s não encontrado",
        async (path) => {
            const user = userEvent.setup();

            mockApiResponse({ method: "GET", endpoint: "/games/123", status: 404 });
            mockApiResponse({
                method: "GET",
                endpoint: "/library",
                responseBody: { libraryEntries: [] },
            });

            renderGameDetails(path, "/games/search?query=gta&page=2");

            expect(await screen.findByText("Jogo não encontrado")).toBeVisible();
            expect(screen.getByRole("link", { name: "Procurar jogos" })).toHaveAttribute(
                "href",
                "/games/search",
            );

            await user.click(screen.getByRole("button", { name: "Voltar" }));

            expect(await screen.findByText("Busca de teste")).toBeVisible();
            expect(screen.getByTestId("url-atual")).toHaveTextContent(
                "/games/search?query=gta&page=2",
            );
        },
    );

    test("deve carregar o jogo e permitir abrir e cancelar a adição à biblioteca", async () => {
        const user = userEvent.setup();

        mockApiResponse({ method: "GET", endpoint: "/games/123", responseBody: game });
        mockApiResponse({
            method: "GET",
            endpoint: "/library",
            responseBody: { libraryEntries: [] },
        });

        renderGameDetails();

        expect(await screen.findByRole("heading", { name: "Elden Ring", level: 1 })).toBeVisible();
        expect(screen.getByText("Explore as Terras Intermédias.")).toBeVisible();

        await user.click(await screen.findByRole("button", { name: "Adicionar à biblioteca" }));

        const dialog = await screen.findByRole("dialog", { name: "Elden Ring" });

        expect(within(dialog).getByRole("button", { name: "PC" })).toBeVisible();

        await user.click(within(dialog).getByRole("button", { name: "Cancelar" }));

        expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
        expect(screen.getByRole("heading", { name: "Elden Ring", level: 1 })).toBeVisible();
    });

    test("deve identificar o jogo já adicionado e navegar usando o ID interno da biblioteca", async () => {
        const user = userEvent.setup();

        mockApiResponse({ method: "GET", endpoint: "/games/123", responseBody: game });
        mockApiResponse({
            method: "GET",
            endpoint: "/library",
            responseBody: {
                libraryEntries: [createLibraryEntry({ status: "PLAYING" })],
            },
        });

        renderGameDetails();

        const link = await screen.findByRole("link", { name: "Ver na minha biblioteca" });

        expect(link).toHaveAttribute("href", "/library/1");
        expect(screen.getByText("Jogando")).toBeVisible();
        expect(
            screen.queryByRole("button", { name: "Adicionar à biblioteca" }),
        ).not.toBeInTheDocument();

        await user.click(link);

        expect(await screen.findByText("Jogo na biblioteca de teste")).toBeVisible();
    });

    test("deve recuperar os detalhes ao tentar novamente após uma falha", async () => {
        const user = userEvent.setup();

        mockApiResponse({ method: "GET", endpoint: "/games/123", status: 500 });
        mockApiResponse({
            method: "GET",
            endpoint: "/library",
            responseBody: { libraryEntries: [] },
        });

        renderGameDetails();

        expect(await screen.findByText("Não foi possível carregar o jogo")).toBeVisible();
        expect(
            screen.queryByRole("button", { name: "Adicionar à biblioteca" }),
        ).not.toBeInTheDocument();

        const { requests } = mockApiResponse({
            method: "GET",
            endpoint: "/games/123",
            responseBody: game,
        });

        await user.click(screen.getByRole("button", { name: "Tentar novamente" }));

        expect(await screen.findByRole("heading", { name: "Elden Ring", level: 1 })).toBeVisible();
        expect(await screen.findByRole("button", { name: "Adicionar à biblioteca" })).toBeEnabled();
        expect(screen.queryByText("Não foi possível carregar o jogo")).not.toBeInTheDocument();
        expect(requests).toHaveLength(1);
    });

    test("deve preservar os detalhes e recuperar a identificação na biblioteca após falha", async () => {
        const user = userEvent.setup();

        const details = mockApiResponse({
            method: "GET",
            endpoint: "/games/123",
            responseBody: game,
        });
        mockApiResponse({ method: "GET", endpoint: "/library", status: 500 });

        renderGameDetails();

        const erro = "Não foi possível verificar sua biblioteca.";

        expect(await screen.findByText(erro)).toBeVisible();
        expect(screen.getByRole("heading", { name: "Elden Ring", level: 1 })).toBeVisible();
        expect(screen.getByText("Explore as Terras Intermédias.")).toBeVisible();
        expect(
            screen.queryByRole("button", { name: "Adicionar à biblioteca" }),
        ).not.toBeInTheDocument();

        mockApiResponse({
            method: "GET",
            endpoint: "/library",
            responseBody: { libraryEntries: [createLibraryEntry({ status: "PLAYING" })] },
        });

        await user.click(screen.getByRole("button", { name: "Tentar novamente" }));

        expect(
            await screen.findByRole("link", { name: "Ver na minha biblioteca" }),
        ).toHaveAttribute("href", "/library/1");
        expect(screen.queryByText(erro)).not.toBeInTheDocument();
        expect(
            screen.queryByRole("button", { name: "Adicionar à biblioteca" }),
        ).not.toBeInTheDocument();
        expect(details.requests).toHaveLength(1);
    });

    test.each([
        { scenario: "a API retornar 404", path: "/games/123" },
        { scenario: "o endereço tiver um ID inválido", path: "/games/invalido" },
    ])(
        "deve informar jogo não encontrado e permitir buscar jogos quando $scenario",
        async ({ path }) => {
            const user = userEvent.setup();

            const { requests } = mockApiResponse({
                method: "GET",
                endpoint: "/games/123",
                status: 404,
            });
            mockApiResponse({
                method: "GET",
                endpoint: "/library",
                responseBody: { libraryEntries: [] },
            });

            renderGameDetails(path);

            expect(await screen.findByText("Jogo não encontrado")).toBeVisible();
            expect(
                screen.queryByRole("button", { name: "Adicionar à biblioteca" }),
            ).not.toBeInTheDocument();

            if (path === "/games/invalido") {
                expect(requests).toHaveLength(0);
            }

            await user.click(screen.getByRole("link", { name: "Procurar jogos" }));

            expect(await screen.findByText("Busca de teste")).toBeVisible();
        },
    );
});
