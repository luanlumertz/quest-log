import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, test, vi } from "vitest";
import { MultiSelectChips } from "../../../../src/components/ui/MultiSelectChips";

describe("MultiSelectChips", () => {
    test.each([{ value: "pc" }, { value: 42 }])(
        "deve preservar o tipo do valor $value e permitir alternância por teclado",
        async ({ value }) => {
            const user = userEvent.setup();
            const onToggle = vi.fn();
            const props = {
                label: "Plataformas",
                options: [{ value, label: "PC" }],
                onToggle,
            };
            const { rerender } = render(<MultiSelectChips {...props} selectedValues={[]} />);
            const button = screen.getByRole("button", { name: "PC" });

            await user.tab();
            await user.keyboard(" ");
            expect(onToggle).toHaveBeenCalledExactlyOnceWith(value);
            // A seleção depende do pai; clicar não altera o estado por conta própria.
            expect(button).toHaveAttribute("aria-pressed", "false");

            rerender(<MultiSelectChips {...props} selectedValues={[value]} showCheck />);
            expect(button).toHaveAttribute("aria-pressed", "true");
            await user.keyboard("{Enter}");
            expect(onToggle).toHaveBeenLastCalledWith(value);
            expect(onToggle).toHaveBeenCalledTimes(2);
        },
    );

    test("deve associar o erro ao grupo, bloquear seleção e comunicar ausência de opções", async () => {
        const user = userEvent.setup();
        const onToggle = vi.fn();
        const props = {
            label: "Plataformas",
            selectedValues: [],
            onToggle,
            emptyMessage: "Nenhuma plataforma disponível.",
        };
        const { rerender } = render(
            <MultiSelectChips
                {...props}
                options={[{ value: 1, label: "PC" }]}
                disabled
                error="Seleção inválida."
            />,
        );
        const group = screen.getByRole("group", { name: "Plataformas" });
        expect(group).toHaveAttribute("aria-invalid", "true");
        expect(group).toHaveAccessibleDescription("Seleção inválida.");
        expect(screen.getByRole("button", { name: "PC" })).toBeDisabled();
        await user.click(screen.getByRole("button", { name: "PC" }));
        expect(onToggle).not.toHaveBeenCalled();

        rerender(<MultiSelectChips {...props} options={[]} />);
        expect(group).not.toHaveAttribute("aria-describedby");
        expect(screen.getByText("Nenhuma plataforma disponível.")).toBeVisible();
        expect(screen.queryByRole("button")).not.toBeInTheDocument();
    });
});
