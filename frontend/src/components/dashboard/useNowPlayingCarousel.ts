import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";

const motionQuery = "(prefers-reduced-motion: reduce)";
export const CAROUSEL_BUFFER = 3;

function getColumns() {
    return window.innerWidth >= 1280 ? 3 : window.innerWidth >= 768 ? 2 : 1;
}

export function useNowPlayingCarousel(count: number) {
    const sectionRef = useRef<HTMLElement>(null);
    const viewportRef = useRef<HTMLDivElement>(null);
    const [columns, setColumns] = useState(getColumns);
    const [paused, setPaused] = useState(() => window.matchMedia?.(motionQuery).matches ?? false);
    const [interacting, setInteracting] = useState(false);
    const [focused, setFocused] = useState(false);
    const [hidden, setHidden] = useState(document.hidden);
    const isCarousel = count > columns;

    const releaseInteraction = useCallback(() => {
        setInteracting(false);
        setFocused(false);
    }, []);

    useEffect(() => {
        const onOutsideClick = (event: MouseEvent) => {
            if (!sectionRef.current?.contains(event.target as Node)) releaseInteraction();
        };

        document.addEventListener("click", onOutsideClick);
        return () => document.removeEventListener("click", onOutsideClick);
    }, [releaseInteraction]);

    const geometry = useCallback(
        (viewport: HTMLDivElement) => {
            const card = viewport.firstElementChild as HTMLElement;
            const width = card.getBoundingClientRect().width;
            const gap = parseFloat(getComputedStyle(viewport).columnGap) || 0;
            const peek = columns === 1 ? 24 : width / 2;

            return { step: width + gap, inset: peek + gap };
        },
        [columns],
    );

    const move = useCallback(
        (direction: number) => {
            const viewport = viewportRef.current;
            if (!viewport) return;

            const { step } = geometry(viewport);
            viewport.scrollTo({
                left: viewport.scrollLeft + direction * step,
                behavior: window.matchMedia?.(motionQuery).matches ? "instant" : "smooth",
            });
        },
        [geometry],
    );

    useLayoutEffect(() => {
        const viewport = viewportRef.current;
        if (!viewport) return;

        function align() {
            setColumns(getColumns());
            if (!isCarousel) return;

            const { step, inset } = geometry(viewport!);
            viewport!.scrollTo({ left: CAROUSEL_BUFFER * step - inset, behavior: "instant" });
        }

        function loop() {
            const { step, inset } = geometry(viewport!);
            const index = Math.round((viewport!.scrollLeft + inset) / step) - CAROUSEL_BUFFER;

            if (index < 0 || index >= count) {
                const normalized = ((index % count) + count) % count;
                viewport!.scrollTo({
                    left: (CAROUSEL_BUFFER + normalized) * step - inset,
                    behavior: "instant",
                });
            }
        }

        align();
        const observer = new ResizeObserver(align);
        observer.observe(viewport);
        if (isCarousel) viewport.addEventListener("scrollend", loop);

        return () => {
            observer.disconnect();
            viewport.removeEventListener("scrollend", loop);
        };
    }, [count, isCarousel, geometry]);

    useEffect(() => {
        const preference = window.matchMedia?.(motionQuery);
        const onMotionChange = () => {
            if (preference?.matches) setPaused(true);
        };
        const onVisibilityChange = () => setHidden(document.hidden);

        preference?.addEventListener("change", onMotionChange);
        document.addEventListener("visibilitychange", onVisibilityChange);

        return () => {
            preference?.removeEventListener("change", onMotionChange);
            document.removeEventListener("visibilitychange", onVisibilityChange);
        };
    }, []);

    useEffect(() => {
        if (!isCarousel || paused || interacting || focused || hidden) return;

        const timer = window.setInterval(() => move(1), 6000);
        return () => window.clearInterval(timer);
    }, [isCarousel, paused, interacting, focused, hidden, move]);

    return {
        sectionRef,
        viewportRef,
        isCarousel,
        paused,
        setFocused,
        releaseInteraction,
        togglePaused: () => {
            releaseInteraction();
            setPaused((value) => !value);
        },
        navigate: (direction: number) => {
            setInteracting(true);
            move(direction);
        },
    };
}
