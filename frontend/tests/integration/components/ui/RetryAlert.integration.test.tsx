import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, test, vi } from "vitest";
import { RetryAlert } from "../../../../src/components/ui/RetryAlert";

describe("RetryAlert", () => {
    test("deve solicitar nova tentativa e impedir cliques durante a consulta sem ocultar a mensagem", async () => {
        const user = userEvent.setup();
        const onRetry = vi.fn();
        const content = <p>Não foi possível verificar sua biblioteca.</p>;
        const { rerender } = render(<RetryAlert onRetry={onRetry}>{content}</RetryAlert>);

        await user.click(screen.getByRole("button", { name: "Tentar novamente" }));
        expect(onRetry).toHaveBeenCalledTimes(1);

        rerender(
            <RetryAlert onRetry={onRetry} isRetrying>
                {content}
            </RetryAlert>,
        );
        expect(screen.getByRole("alert")).toHaveTextContent(
            "Não foi possível verificar sua biblioteca.",
        );
        const button = screen.getByRole("button", { name: "Tentando..." });
        expect(button).toBeDisabled();
        await user.click(button);
        expect(onRetry).toHaveBeenCalledTimes(1);

        rerender(<RetryAlert onRetry={onRetry}>{content}</RetryAlert>);
        await user.click(screen.getByRole("button", { name: "Tentar novamente" }));
        expect(onRetry).toHaveBeenCalledTimes(2);
    });
});
