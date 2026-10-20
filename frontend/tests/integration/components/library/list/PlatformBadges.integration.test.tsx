import { act, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, test, vi } from "vitest";

import { PlatformBadges } from "../../../../../src/components/library/list/PlatformBadges";

const platforms = [
    { id: 1, name: "PC" },
    { id: 2, name: "PlayStation 5" },
    { id: 3, name: "Xbox Series X" },
];

function mockMeasurements(initialWidth: number) {
    let width = initialWidth;
    let notifyResize = () => {};

    // O JSDOM não mede o layout: cada badge tem 80 px e o contador tem 24 px.
    vi.spyOn(HTMLElement.prototype, "clientWidth", "get").mockImplementation(() => width);
    vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockImplementation(function (
        this: HTMLElement,
    ) {
        return DOMRect.fromRect({ width: this.textContent?.startsWith("+") ? 24 : 80, height: 20 });
    });
    vi.stubGlobal(
        "ResizeObserver",
        class implements ResizeObserver {
            constructor(callback: ResizeObserverCallback) {
                notifyResize = () => callback([], this);
            }
            observe() {}
            unobserve() {}
            disconnect() {}
        },
    );

    return {
        resize(nextWidth: number) {
            width = nextWidth;
            act(() => {
                notifyResize();
            });
        },
    };
}

function visibleBadges() {
    // Ignora a cópia aria-hidden usada exclusivamente para medir as badges.
    const container = screen.getByTitle("PC, PlayStation 5, Xbox Series X");
    return Array.from(container.firstElementChild!.children, (badge) => badge.textContent);
}

afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
});

describe("PlatformBadges.tsx", () => {
    test("deve mostrar todas as plataformas quando houver espaço", () => {
        mockMeasurements(300);
        render(<PlatformBadges platforms={platforms} />);

        expect(visibleBadges()).toEqual(["PC", "PlayStation 5", "Xbox Series X"]);
    });

    test("deve reservar espaço para o contador e recalcular após redimensionamento", () => {
        const { resize } = mockMeasurements(170);
        render(<PlatformBadges platforms={platforms} />);

        expect(visibleBadges()).toEqual(["PC", "+2"]);
        resize(110);
        expect(visibleBadges()).toEqual(["PC", "+2"]);
        resize(30);
        expect(visibleBadges()).toEqual(["+3"]);
        resize(300);
        expect(visibleBadges()).toEqual(["PC", "PlayStation 5", "Xbox Series X"]);
    });

    test("deve atualizar as badges quando as plataformas mudarem", () => {
        mockMeasurements(110);
        const { rerender } = render(<PlatformBadges platforms={platforms} />);
        expect(visibleBadges()).toEqual(["PC", "+2"]);

        rerender(<PlatformBadges platforms={[platforms[0]!]} />);
        const container = screen.getByTitle("PC");
        expect(container.firstElementChild).toHaveTextContent(/^PC$/);
        expect(container.firstElementChild).not.toHaveTextContent("+");
    });
});
