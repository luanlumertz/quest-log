import { render, screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";
import { RatingStars } from "../../../../src/components/ui/RatingStars";

describe("RatingStars", () => {
    test("deve manter a nota acessível quando o valor numérico estiver oculto", () => {
        const { rerender } = render(<RatingStars rating={4.5} />);
        expect(screen.getByText("4.5")).toBeVisible();
        expect(screen.getByLabelText("Nota 4.5 de 5")).toBeInTheDocument();

        rerender(<RatingStars rating={4.5} showValue={false} size="lg" tone="gold" />);
        expect(screen.queryByText("4.5")).not.toBeInTheDocument();
        expect(screen.getByLabelText("Nota 4.5 de 5")).toBeInTheDocument();
        expect(screen.queryByRole("button")).not.toBeInTheDocument();

        rerender(<RatingStars rating={0} showValue={false} />);
        expect(screen.getByLabelText("Nota 0 de 5")).toBeInTheDocument();
    });
});
