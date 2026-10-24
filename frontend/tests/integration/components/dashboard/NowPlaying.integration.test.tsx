import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter, useLocation } from "react-router";
import { afterEach, describe, expect, test, vi } from "vitest";

import { NowPlaying } from "../../../../src/components/dashboard/NowPlaying";
import { createLibraryEntry } from "../../../fixtures/library.fixture";

const games = [1, 2, 3, 4].map((id) => {
    const entry = createLibraryEntry({ status: "PLAYING" });

    return { ...entry, game: { ...entry.game, id, title: `Jogo ${id}` } };
});
const originalScrollTo = Object.getOwnPropertyDescriptor(HTMLElement.prototype, "scrollTo");

function CurrentLocation() {
    return <output data-testid="carousel-location">{useLocation().pathname}</output>;
}

function setupCarousel({ width = 300, reducedMotion = false, entries = games } = {}) {
    vi.useFakeTimers();
    let viewportWidth = width;
    vi.stubGlobal("innerWidth", width);
    let notifyResize = () => {};
    const preference = Object.assign(new EventTarget(), { matches: reducedMotion });
    vi.stubGlobal("matchMedia", () => preference);
    vi.spyOn(document, "hidden", "get").mockReturnValue(false);
    vi.spyOn(HTMLElement.prototype, "clientWidth", "get").mockImplementation(() => viewportWidth);
    vi.spyOn(HTMLElement.prototype, "scrollWidth", "get").mockReturnValue(900);
    vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockReturnValue(
        DOMRect.fromRect({ width: 300 }),
    );

    const scroll = vi.fn(function (this: HTMLElement, options: ScrollToOptions) {
        this.scrollLeft = options.left ?? 0;
        this.dispatchEvent(new Event("scrollend"));
    });
    Object.defineProperty(HTMLElement.prototype, "scrollTo", { configurable: true, value: scroll });
    vi.stubGlobal(
        "ResizeObserver",
        class {
            constructor(callback: () => void) {
                notifyResize = callback;
            }
            observe() {}
            disconnect() {}
        },
    );

    render(
        <MemoryRouter>
            <NowPlaying games={entries} />
            <CurrentLocation />
        </MemoryRouter>,
    );

    scroll.mockClear();

    return {
        scroll,
        preference,
        resize(nextWidth: number) {
            viewportWidth = nextWidth;
            vi.stubGlobal("innerWidth", nextWidth);
            act(() => notifyResize());
        },
        advance(ms = 6000) {
            act(() => vi.advanceTimersByTime(ms));
        },
    };
}

afterEach(() => {
    cleanup();
    vi.useRealTimers();
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
    if (originalScrollTo)
        Object.defineProperty(HTMLElement.prototype, "scrollTo", originalScrollTo);
    else Reflect.deleteProperty(HTMLElement.prototype, "scrollTo");
});

describe("carrossel Jogando agora", () => {
    test.each([
        { side: "esquerda", index: 2, destination: "/library/4" },
        { side: "direita", index: 4, destination: "/library/2" },
    ])("deve abrir o jogo ao clicar na prévia da $side", ({ index, destination }) => {
        setupCarousel();

        const track = document.querySelector('[class*="grid-flow-col"]')!;
        const slide = track.children[index];
        const link = slide.querySelector("a")!;

        expect(slide).not.toHaveAttribute("inert");
        if (slide.getAttribute("aria-hidden") === "true") {
            expect(link).toHaveAttribute("tabindex", "-1");
        }

        fireEvent.click(link);

        expect(screen.getByTestId("carousel-location")).toHaveTextContent(destination);
    });

    test("deve voltar circularmente ao último jogo sem tornar as cópias acessíveis", () => {
        const carousel = setupCarousel();

        expect(screen.getAllByRole("heading", { level: 3 })).toHaveLength(4);

        fireEvent.click(screen.getByRole("button", { name: "Jogos anteriores" }));

        expect(carousel.scroll).toHaveBeenLastCalledWith({ left: 1776, behavior: "instant" });
        expect(screen.getByRole("button", { name: "Pausar" })).toBeVisible();
    });
    test("deve mostrar todos os jogos e ativar controles apenas quando excedem a largura", () => {
        const carousel = setupCarousel({ width: 1440, entries: games.slice(0, 3) });

        expect(screen.getAllByRole("heading", { level: 3 })).toHaveLength(3);
        expect(screen.queryByRole("button", { name: "Próximos jogos" })).not.toBeInTheDocument();
        carousel.advance();
        expect(carousel.scroll).not.toHaveBeenCalled();

        carousel.resize(300);

        expect(screen.getByRole("button", { name: "Próximos jogos" })).toBeEnabled();
        expect(screen.getByRole("button", { name: "Jogos anteriores" })).toBeEnabled();
    });

    test("deve avançar automaticamente e retornar ao início depois do último card", () => {
        const carousel = setupCarousel();

        carousel.advance();
        expect(carousel.scroll).toHaveBeenLastCalledWith({ left: 1176, behavior: "smooth" });
        carousel.advance();
        expect(screen.getByRole("button", { name: "Próximos jogos" })).toBeEnabled();
        carousel.advance();
        carousel.advance();
        expect(carousel.scroll).toHaveBeenLastCalledWith({ left: 876, behavior: "instant" });
    });

    test.each(["Próximos jogos", "Jogos anteriores"])(
        "deve pausar ao usar %s e retomar seis segundos após clicar fora",
        (name) => {
            const carousel = setupCarousel();

            fireEvent.click(screen.getByRole("button", { name }));
            carousel.scroll.mockClear();
            carousel.advance();
            expect(carousel.scroll).not.toHaveBeenCalled();

            fireEvent.click(document.body);
            carousel.advance(5999);
            expect(carousel.scroll).not.toHaveBeenCalled();
            carousel.advance(1);
            expect(carousel.scroll).toHaveBeenCalled();
        },
    );

    test("deve preservar a pausa manual após clicar fora, sair do foco e trocar de aba", () => {
        const carousel = setupCarousel();
        const section = screen.getByRole("region", { name: "Jogando agora" });

        fireEvent.click(screen.getByRole("button", { name: "Pausar" }));
        fireEvent.click(document.body);
        fireEvent.blur(section, { relatedTarget: document.body });
        vi.spyOn(document, "hidden", "get").mockReturnValue(true);
        act(() => document.dispatchEvent(new Event("visibilitychange")));
        vi.spyOn(document, "hidden", "get").mockReturnValue(false);
        act(() => document.dispatchEvent(new Event("visibilitychange")));
        carousel.advance();

        expect(carousel.scroll).not.toHaveBeenCalled();
        expect(screen.getByRole("button", { name: "Reproduzir" })).toBeVisible();

        fireEvent.click(screen.getByRole("button", { name: "Reproduzir" }));
        carousel.advance();

        expect(carousel.scroll).toHaveBeenCalledTimes(1);
    });

    test("deve continuar com hover e retomar ao retirar o foco do teclado da seção", () => {
        const carousel = setupCarousel();
        const section = screen.getByRole("region", { name: "Jogando agora" });
        const next = screen.getByRole("button", { name: "Próximos jogos" });

        fireEvent.mouseEnter(section);
        carousel.advance();
        expect(carousel.scroll).toHaveBeenCalledTimes(1);
        carousel.scroll.mockClear();

        fireEvent.focus(next);
        carousel.advance();
        expect(carousel.scroll).not.toHaveBeenCalled();

        fireEvent.blur(next, { relatedTarget: screen.getByRole("button", { name: "Pausar" }) });
        carousel.advance();
        expect(carousel.scroll).not.toHaveBeenCalled();

        fireEvent.blur(section, { relatedTarget: document.body });
        carousel.advance(5999);
        expect(carousel.scroll).not.toHaveBeenCalled();
        carousel.advance(1);
        expect(carousel.scroll).toHaveBeenCalledTimes(1);
    });

    test("deve pausar na aba oculta e retomar ao voltar quando não há pausa manual", () => {
        const carousel = setupCarousel();

        vi.spyOn(document, "hidden", "get").mockReturnValue(true);
        act(() => document.dispatchEvent(new Event("visibilitychange")));
        carousel.advance();
        expect(carousel.scroll).not.toHaveBeenCalled();

        vi.spyOn(document, "hidden", "get").mockReturnValue(false);
        act(() => document.dispatchEvent(new Event("visibilitychange")));
        carousel.advance();
        expect(carousel.scroll).toHaveBeenCalledTimes(1);
    });

    test("deve iniciar pausado e navegar sem animação com movimento reduzido", () => {
        const carousel = setupCarousel({ reducedMotion: true });

        expect(screen.getByRole("button", { name: "Reproduzir" })).toBeVisible();
        carousel.advance();
        expect(carousel.scroll).not.toHaveBeenCalled();

        fireEvent.click(screen.getByRole("button", { name: "Próximos jogos" }));
        expect(carousel.scroll).toHaveBeenLastCalledWith({ left: 1176, behavior: "instant" });
    });

    test("deve pausar se a preferência de movimento mudar durante o uso", () => {
        const carousel = setupCarousel();

        act(() => {
            carousel.preference.matches = true;
            carousel.preference.dispatchEvent(new Event("change"));
        });

        expect(screen.getByRole("button", { name: "Reproduzir" })).toBeVisible();
        carousel.advance();
        expect(carousel.scroll).not.toHaveBeenCalled();
    });
});
