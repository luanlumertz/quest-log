import { useState } from "react";
import { act, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, test, vi } from "vitest";

import { LibraryRatingField } from "../../../../../src/components/library/details/LibraryRatingField";

function RatingDeTeste({ initialValue = "4", disabled = false }) {
    const [value, setValue] = useState(initialValue);
    return <LibraryRatingField value={value} disabled={disabled} onChange={setValue} />;
}

afterEach(() => {
    vi.useRealTimers();
});

describe("LibraryRatingField.tsx", () => {
    test("deve alterar a nota em passos de 0,1 com mouse e teclado sem duplicar o incremento", async () => {
        const user = userEvent.setup();
        render(<RatingDeTeste />);
        const nota = screen.getByRole("textbox", { name: "Nota" });
        const aumentar = screen.getByRole("button", { name: "Aumentar nota" });
        const diminuir = screen.getByRole("button", { name: "Diminuir nota" });

        await user.click(aumentar);
        expect(nota).toHaveValue("4,1");
        await user.click(diminuir);
        expect(nota).toHaveValue("4,0");
        aumentar.focus();
        await user.keyboard("{Enter}");
        expect(nota).toHaveValue("4,1");
        diminuir.focus();
        await user.keyboard(" ");
        expect(nota).toHaveValue("4,0");
    });

    test.each([
        { initialValue: "4,9", button: "Aumentar nota", expected: "5,0" },
        { initialValue: "0,1", button: "Diminuir nota", expected: "0,0" },
    ])("deve respeitar o limite ao usar $button", async ({ initialValue, button, expected }) => {
        const user = userEvent.setup();
        render(<RatingDeTeste initialValue={initialValue} />);
        const controle = screen.getByRole("button", { name: button });

        await user.click(controle);
        expect(screen.getByRole("textbox", { name: "Nota" })).toHaveValue(expected);
        expect(controle).toBeDisabled();
        await user.click(controle);
        expect(screen.getByRole("textbox", { name: "Nota" })).toHaveValue(expected);
    });

    test("deve bloquear os controles quando a edição estiver desabilitada", async () => {
        const user = userEvent.setup();
        render(<RatingDeTeste disabled />);
        const nota = screen.getByRole("textbox", { name: "Nota" });
        expect(nota).toBeDisabled();
        for (const name of ["Aumentar nota", "Diminuir nota"]) {
            const button = screen.getByRole("button", { name });
            expect(button).toBeDisabled();
            await user.click(button);
        }
        expect(nota).toHaveValue("4");
    });

    test.each(["soltar", "cancelar", "sair do botão"])(
        "deve interromper a repetição ao %s",
        (action) => {
            vi.useFakeTimers();
            render(<RatingDeTeste initialValue="3" />);
            const aumentar = screen.getByRole("button", { name: "Aumentar nota" });
            const nota = screen.getByRole("textbox", { name: "Nota" });

            fireEvent.pointerDown(aumentar);
            expect(nota).toHaveValue("3,1");
            act(() => {
                vi.advanceTimersByTime(350 + 80 * 2);
            });
            expect(nota).toHaveValue("3,3");

            if (action === "soltar") fireEvent.pointerUp(aumentar);
            else if (action === "cancelar") fireEvent.pointerCancel(aumentar);
            else fireEvent.pointerLeave(aumentar);

            act(() => {
                vi.advanceTimersByTime(1000);
            });
            expect(nota).toHaveValue("3,3");
        },
    );

    test("deve parar automaticamente no limite durante uma pressão longa", () => {
        vi.useFakeTimers();
        render(<RatingDeTeste initialValue="4,7" />);
        const aumentar = screen.getByRole("button", { name: "Aumentar nota" });
        fireEvent.pointerDown(aumentar);
        act(() => {
            vi.advanceTimersByTime(1000);
        });

        expect(screen.getByRole("textbox", { name: "Nota" })).toHaveValue("5,0");
        expect(aumentar).toBeDisabled();
        act(() => {
            vi.advanceTimersByTime(1000);
        });
        expect(screen.getByRole("textbox", { name: "Nota" })).toHaveValue("5,0");
    });

    test.each([100, 510])(
        "deve cancelar os timers ao desmontar após %s ms de pressão",
        (elapsed) => {
            vi.useFakeTimers();
            const onChange = vi.fn();
            const { unmount } = render(<LibraryRatingField value="3" onChange={onChange} />);
            fireEvent.pointerDown(screen.getByRole("button", { name: "Aumentar nota" }));
            act(() => {
                vi.advanceTimersByTime(elapsed);
            });
            const callsBeforeUnmount = onChange.mock.calls.length;

            unmount();
            act(() => {
                vi.advanceTimersByTime(1000);
            });
            expect(onChange).toHaveBeenCalledTimes(callsBeforeUnmount);
        },
    );
});
