import { describe, expect, test } from "vitest";
import { MemoryRouter, Route, Routes } from "react-router";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { NotFound } from "../../../src/pages/NotFound";

describe("NotFound.tsx", () => {
    test("deve informar que a página não existe e permitir voltar ao início", async () => {
        const user = userEvent.setup();

        render(
            <MemoryRouter initialEntries={["/pagina-inexistente"]}>
                <Routes>
                    <Route path="/" element={<div>Página inicial de teste</div>} />
                    <Route path="*" element={<NotFound />} />
                </Routes>
            </MemoryRouter>,
        );

        expect(screen.getByRole("heading", { name: "Página não encontrada" })).toBeVisible();

        await user.click(screen.getByRole("link", { name: "Voltar ao início" }));

        expect(await screen.findByText("Página inicial de teste")).toBeVisible();
        expect(
            screen.queryByRole("heading", { name: "Página não encontrada" }),
        ).not.toBeInTheDocument();
    });
});
