import { Link } from "react-router";
import { GAME_STATUS_CONFIG } from "../../config/gameStatus.config";
import type { LibraryEntry } from "../../types/library.types";
import { CAROUSEL_BUFFER, useNowPlayingCarousel } from "./useNowPlayingCarousel";
import { NowPlayingCard } from "./NowPlayingCard";

type NowPlayingProps = { games: LibraryEntry[] };

export function NowPlaying({ games }: NowPlayingProps) {
    const {
        sectionRef,
        viewportRef,
        isCarousel,
        paused,
        setFocused,
        releaseInteraction,
        togglePaused,
        navigate,
    } = useNowPlayingCarousel(games.length);
    const sortedGames = [...games].sort(
        (a, b) =>
            (b.startedAt ? new Date(b.startedAt).getTime() : 0) -
            (a.startedAt ? new Date(a.startedAt).getTime() : 0),
    );

    if (sortedGames.length === 0) return null;

    const slides = isCarousel
        ? Array.from({ length: sortedGames.length + CAROUSEL_BUFFER * 2 }, (_, index) => ({
              entry: sortedGames[
                  (((index - CAROUSEL_BUFFER) % sortedGames.length) + sortedGames.length) %
                      sortedGames.length
              ]!,
              clone: index < CAROUSEL_BUFFER || index >= CAROUSEL_BUFFER + sortedGames.length,
          }))
        : sortedGames.map((entry) => ({ entry, clone: false }));

    const arrowClass =
        "absolute top-1/2 z-20 flex size-10 -translate-y-1/2 cursor-pointer items-center justify-center rounded-xl border border-white/10 bg-black/55 p-0 text-white backdrop-blur-sm transition-[scale,background-color] duration-200 hover:scale-115 hover:bg-black/0 motion-reduce:hover:scale-100 motion-reduce:transition-none focus-visible:outline-2 focus-visible:outline-brand";

    return (
        <section
            ref={sectionRef}
            className="mt-8 min-w-0"
            aria-label="Jogando agora"
            onFocusCapture={() => setFocused(true)}
            onBlurCapture={(event) => {
                if (!event.currentTarget.contains(event.relatedTarget)) releaseInteraction();
            }}
        >
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                    <span
                        className="size-2.5 animate-pulse rounded-full"
                        style={{ backgroundColor: GAME_STATUS_CONFIG.PLAYING.color }}
                    />
                    <h2 className="text-lg font-semibold text-ink">Jogando agora</h2>
                </div>
                <div className="flex items-center gap-3">
                    {isCarousel && (
                        <button
                            type="button"
                            onClick={togglePaused}
                            aria-label={paused ? "Reproduzir" : "Pausar"}
                            title={
                                paused ? "Reproduzir avanço automático" : "Pausar avanço automático"
                            }
                            className="flex size-8 cursor-pointer items-center justify-center rounded-lg border border-current text-ink-mute hover:bg-surface-hover hover:text-ink focus-visible:outline-2 focus-visible:outline-brand"
                        >
                            <svg
                                aria-hidden="true"
                                width="12"
                                height="12"
                                viewBox="0 0 12 12"
                                fill="currentColor"
                            >
                                {paused ? (
                                    <path d="M3 1 11 6 3 11Z" />
                                ) : (
                                    <path d="M2 1h3v10H2zm5 0h3v10H7z" />
                                )}
                            </svg>
                        </button>
                    )}
                    <Link
                        to="/library?status=PLAYING"
                        className="text-sm text-ink-mute transition-colors hover:text-ink hover:underline"
                    >
                        Ver todos ({games.length})
                    </Link>
                </div>
            </div>

            <div className="relative">
                <div
                    ref={viewportRef}
                    style={{ scrollbarWidth: "none" }}
                    className={
                        isCarousel
                            ? "grid snap-x snap-mandatory scroll-px-10 md:scroll-px-[calc((100%-2rem)/4+1rem)] xl:scroll-px-[calc((100%-3rem)/6+1rem)] grid-flow-col auto-cols-[calc(100%-5rem)] gap-4 overflow-x-auto overscroll-x-contain py-1 scrollbar-none [&::-webkit-scrollbar]:hidden md:auto-cols-[calc((100%-2rem)/2)] xl:auto-cols-[calc((100%-3rem)/3)]"
                            : "grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3"
                    }
                >
                    {slides.map(({ entry, clone }, index) => (
                        <div
                            key={isCarousel ? index : entry.game.id}
                            className="min-w-0 snap-start"
                            aria-hidden={clone || undefined}
                        >
                            <NowPlayingCard entry={entry} tabIndex={clone ? -1 : undefined} />
                        </div>
                    ))}
                </div>

                {isCarousel && (
                    <>
                        <div
                            aria-hidden="true"
                            className="pointer-events-none absolute inset-y-0 left-0 w-10 bg-linear-to-r from-backdrop/95 via-backdrop/50 to-transparent md:w-20 xl:w-40"
                        />
                        <div
                            aria-hidden="true"
                            className="pointer-events-none absolute inset-y-0 right-0 w-10 bg-linear-to-l from-backdrop/95 via-backdrop/50 to-transparent md:w-20 xl:w-40"
                        />
                        <button
                            type="button"
                            aria-label="Jogos anteriores"
                            className={arrowClass + " left-2"}
                            onClick={() => navigate(-1)}
                        >
                            <svg
                                aria-hidden="true"
                                className="size-5 shrink-0"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                <path d="m15 6-6 6 6 6" />
                            </svg>
                        </button>
                        <button
                            type="button"
                            aria-label="Próximos jogos"
                            className={arrowClass + " right-2"}
                            onClick={() => navigate(1)}
                        >
                            <svg
                                aria-hidden="true"
                                className="size-5 shrink-0"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                <path d="m9 6 6 6-6 6" />
                            </svg>
                        </button>
                    </>
                )}
            </div>
        </section>
    );
}
