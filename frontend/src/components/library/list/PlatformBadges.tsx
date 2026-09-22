import { useLayoutEffect, useRef, useState } from "react";
import type { LibraryEntry } from "../../../types/library.types";

type Platform = LibraryEntry["platforms"][number];

type PlatformBadgesProps = {
    platforms: Platform[];
};

const PLATFORM_BADGE_CLASS = "rounded-md bg-surface-raised px-1.5 py-1 text-[9px] text-ink-mute sm:text-[10px]";

export function PlatformBadges({ platforms }: PlatformBadgesProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const measureRef = useRef<HTMLDivElement>(null);

    const platformRefs = useRef<(HTMLSpanElement | null)[]>([]);
    const counterRefs = useRef<(HTMLSpanElement | null)[]>([]);

    const [visibleCount, setVisibleCount] = useState(platforms.length);

    useLayoutEffect(() => {
        const container = containerRef.current;
        const measure = measureRef.current;

        if (!container || !measure) return;

        function calculateVisiblePlatforms() {
            if (!container || !measure) return;

            const availableWidth = container.clientWidth;

            const gap = parseFloat(window.getComputedStyle(measure).columnGap) || 0;

            const platformWidths = platforms.map((_, index) =>
                platformRefs.current[index]?.getBoundingClientRect().width ?? 0
            );

            for (let count = platforms.length; count >= 0; count--) {
                const remaining = platforms.length - count;

                const visibleWidth = platformWidths
                    .slice(0, count)
                    .reduce((total, width) => total + width, 0);

                const counterWidth = remaining > 0 ? counterRefs.current[remaining]?.getBoundingClientRect().width ?? 0 : 0;

                const amountOfBadges = count + (remaining > 0 ? 1 : 0);

                const gapsWidth = Math.max(0, amountOfBadges - 1) * gap;

                const totalWidth = visibleWidth + counterWidth + gapsWidth;

                if (totalWidth <= availableWidth) {
                    setVisibleCount(count);
                    return;
                }
            }

            setVisibleCount(0);
        }
        calculateVisiblePlatforms();

        const observer = new ResizeObserver(calculateVisiblePlatforms);

        observer.observe(container);

        return () => observer.disconnect();
    }, [platforms]);

    const remaining = platforms.length - visibleCount;

    if (platforms.length === 0) return null;

    return (
        <div
            ref={containerRef}
            title={platforms
                .map((platform) => platform.name)
                .join(", ")}
            className="relative flex min-w-0 flex-1 justify-end overflow-hidden"
        >
            <div className="flex items-center gap-1 whitespace-nowrap">
                {platforms
                    .slice(0, visibleCount)
                    .map((platform) => (
                        <PlatformBadge
                            key={platform.id}
                            name={platform.name}
                        />
                    ))}

                {remaining > 0 && (
                    <PlatformBadge name={`+${remaining}`} />
                )}
            </div>

            {/* Usado apenas para medir o tamanho das badges */}
            <div
                ref={measureRef}
                className="invisible absolute flex items-center gap-1 whitespace-nowrap"
                aria-hidden="true"
            >
                {platforms.map((platform, index) => (
                    <span
                        key={platform.id}
                        ref={(element) => {
                            platformRefs.current[index] = element;
                        }}
                        className={`${PLATFORM_BADGE_CLASS}`}>
                        {platform.name}
                    </span>
                ))}

                {platforms.map((_, index) => {
                    const amount = index + 1;

                    return (
                        <span
                            key={amount}
                            ref={(element) => {
                                counterRefs.current[amount] = element;
                            }}
                            className={`${PLATFORM_BADGE_CLASS}`}
                        >
                            +{amount}
                        </span>
                    );
                })}
            </div>
        </div>
    );
}

function PlatformBadge({ name }: { name: string }) {
    return (
        <span className={`shrink-0 ${PLATFORM_BADGE_CLASS}`}>
            {name}
        </span>
    );
}
