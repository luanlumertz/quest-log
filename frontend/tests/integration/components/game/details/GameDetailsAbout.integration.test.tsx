import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, test, vi } from "vitest";

import { GameDetailsAbout } from "../../../../../src/components/game/details/GameDetailsAbout";

function mockDescriptionHeight(initialHeight: number) {
    let height = initialHeight;

    vi.spyOn(HTMLElement.prototype, "scrollHeight", "get").mockImplementation(() => height);
    vi.spyOn(HTMLElement.prototype, "clientHeight", "get").mockReturnValue(100);

    return {
        resize(nextHeight: number) {
            height = nextHeight;
            fireEvent(window, new Event("resize"));
        },
    };
}

function renderAbout(description = "Uma aventura nas Terras Intermédias.") {
    return render(
        <GameDetailsAbout description={description} releaseYear="2022" developers="FromSoftware" />,
    );
}

afterEach(() => {
    vi.restoreAllMocks();
});

describe("GameDetailsAbout.tsx", () => {
    test("deve permitir expandir e recolher uma descrição que ultrapassa o limite", async () => {
        const user = userEvent.setup();

        mockDescriptionHeight(300);

        renderAbout();

        const description = screen.getByText("Uma aventura nas Terras Intermédias.").parentElement;

        expect(description).toHaveClass("line-clamp-4");

        await user.click(screen.getByRole("button", { name: /Ver mais/ }));

        expect(description).not.toHaveClass("line-clamp-4");

        await user.click(screen.getByRole("button", { name: /Ver menos/ }));

        expect(description).toHaveClass("line-clamp-4");
        expect(screen.getByRole("button", { name: /Ver mais/ })).toBeVisible();
    });

    test("deve retirar a expansão quando o texto passa a caber e recalcular ao diminuir o espaço", async () => {
        const user = userEvent.setup();

        const { resize } = mockDescriptionHeight(300);

        renderAbout();

        await user.click(screen.getByRole("button", { name: /Ver mais/ }));

        resize(80);

        expect(
            screen.queryByRole("button", { name: /Ver menos|Ver mais/ }),
        ).not.toBeInTheDocument();

        resize(300);

        expect(screen.getByRole("button", { name: /Ver mais/ })).toBeVisible();
        expect(screen.getByText("Uma aventura nas Terras Intermédias.").parentElement).toHaveClass(
            "line-clamp-4",
        );
    });

    test("não deve oferecer expansão para uma descrição curta", () => {
        mockDescriptionHeight(80);

        renderAbout();

        expect(screen.getByText("Uma aventura nas Terras Intermédias.")).toBeVisible();
        expect(
            screen.queryByRole("button", { name: /Ver mais|Ver menos/ }),
        ).not.toBeInTheDocument();
    });
});
