import type { GameDetailsResult } from "../../types/game.types";
import type { LibraryEntry } from "../../types/library.types";
import { GameDetailsLibraryAction } from "./GameDetailsLibraryAction";

type GameDetailsHeroProps = {
    game: GameDetailsResult;
    coverUrl: string;
    releaseYear: string | null;
    developers: string;
    libraryEntry?: LibraryEntry;
    isLibraryLoading: boolean;
    onBack: () => void;
};

export function GameDetailsHero({
    game,
    coverUrl,
    releaseYear,
    developers,
    libraryEntry,
    isLibraryLoading,
    onBack
}: GameDetailsHeroProps) {
    return (
        <section className="relative">
            {/* Background full width */}
            <div
                className="
                    absolute inset-y-0 left-1/2
                    w-screen -translate-x-1/2
                    overflow-hidden
                "
            >
                <div
                    className="
                        absolute inset-0
                        bg-cover bg-center
                        lg:bg-position-[center_20%]
                    "
                    style={{ backgroundImage: `url("${coverUrl}")` }}
                />

                <div className="absolute inset-0 bg-black/30" />

                <div
                    className="absolute inset-0"
                    style={{
                        background: "linear-gradient(90deg, rgba(11,13,19,0.90) 0%, rgba(11,13,19,0.76) 55%, rgba(11,13,19,0.5) 100%)"
                    }}
                />
            </div>

            {/* Conteúdo */}
            <div
                className="
                    relative z-10
                    min-h-80
                    py-5
                    lg:min-h-90 lg:py-8
                "
            >
                <button
                    type="button"
                    onClick={onBack}
                    className="
                        flex items-center gap-1
                        text-sm text-ink-dim
                        transition-colors
                        cursor-pointer
                        hover:text-ink
                        hover:scale-105
                    "
                >
                    <span className="material-symbols-rounded text-lg!">
                        chevron_left
                    </span>

                    Voltar para busca
                </button>

                <div
                    className="
                        mt-8 flex items-end gap-5
                        md:items-center
                        lg:mt-7
                    "
                >
                    {/* Capa */}
                    <div
                        className="
                            hidden shrink-0 overflow-hidden
                            rounded-xl border border-white/10
                            md:block
                            md:h-55 md:w-37.5
                            lg:h-62.5 lg:w-42.5
                        "
                    >
                        <img
                            src={coverUrl}
                            alt={`Capa de ${game.title}`}
                            className="size-full object-cover"
                        />
                    </div>

                    {/* Informações */}
                    <div className="min-w-0 flex-1">
                        {game.genres.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                                {game.genres.map((genre) => (
                                    <span
                                        key={genre}
                                        className="
                                            rounded-full
                                            border border-white/15
                                            bg-black/25
                                            px-2.5 py-1
                                            text-[11px]
                                            text-ink
                                            backdrop-blur-sm
                                        "
                                    >
                                        {genre}
                                    </span>
                                ))}
                            </div>
                        )}

                        <h1
                            className="
                                mt-4
                                font-display
                                text-3xl font-bold
                                leading-tight
                                text-white
                                sm:text-4xl
                                lg:text-5xl
                            "
                        >
                            {game.title}
                        </h1>

                        <div
                            className="
                                mt-2 flex flex-wrap items-center gap-1
                                text-sm text-ink-dim
                            "
                        >
                            {releaseYear && (
                                <>
                                    <span>{releaseYear}</span>
                                    <span>•</span>
                                </>
                            )}

                            <span>{developers}</span>
                        </div>

                        {game.platforms.length > 0 && (
                            <div className="mt-4 flex flex-wrap gap-2">
                                {game.platforms.map((platform) => (
                                    <span
                                        key={platform}
                                        className="
                                            rounded-md
                                            border border-white/10
                                            bg-black/30
                                            px-2.5 py-1
                                            text-xs
                                            text-ink-dim
                                            backdrop-blur-sm
                                        "
                                    >
                                        {platform}
                                    </span>
                                ))}
                            </div>
                        )}

                        <div className="mt-5 flex flex-wrap items-center gap-3">
                            <GameDetailsLibraryAction
                                libraryEntry={libraryEntry}
                                isLibraryLoading={isLibraryLoading}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
