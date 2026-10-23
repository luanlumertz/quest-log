import { afterEach, describe, expect, test, vi } from "vitest";
import { act, render, screen } from "@testing-library/react";

import { SuccessAlert } from "../../../../src/components/ui/SuccessAlert";

describe("SuccessAlert", () => {
    afterEach(() => vi.useRealTimers());

    test("deve solicitar o fechamento após três segundos e recolher com fade-out", () => {
        vi.useFakeTimers();
        const onVisibleChange = vi.fn();

        const { rerender } = render(
            <SuccessAlert visible onVisibleChange={onVisibleChange}>
                Salvo com sucesso!
            </SuccessAlert>,
        );

        expect(screen.getByRole("status")).toBeVisible();

        act(() => vi.advanceTimersByTime(2999));

        expect(onVisibleChange).not.toHaveBeenCalled();

        act(() => vi.advanceTimersByTime(1));

        expect(onVisibleChange).toHaveBeenCalledExactlyOnceWith(false);

        rerender(
            <SuccessAlert visible={false} onVisibleChange={onVisibleChange}>
                Salvo com sucesso!
            </SuccessAlert>,
        );

        expect(screen.queryByRole("status")).not.toBeInTheDocument();
        expect(screen.getByText("Salvo com sucesso!").closest("[aria-hidden]")).toHaveClass(
            "opacity-0",
            "duration-300",
            "grid-rows-[0fr]",
        );
    });

    test("deve cancelar o temporizador ao desmontar", () => {
        vi.useFakeTimers();
        const onVisibleChange = vi.fn();

        const { unmount } = render(
            <SuccessAlert visible onVisibleChange={onVisibleChange}>
                Salvo!
            </SuccessAlert>,
        );

        unmount();

        act(() => vi.advanceTimersByTime(3000));

        expect(onVisibleChange).not.toHaveBeenCalled();
    });
});
