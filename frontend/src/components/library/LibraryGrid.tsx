import type { LibraryEntry } from "../../types/library.types";
import { LibraryGameCard } from "./LibraryGameCard";

type LibraryGridProps = {
    entries: LibraryEntry[];
};

export function LibraryGrid({ entries }: LibraryGridProps) {
    return (
        <div
            className="
                mt-7
                grid gap-4
                grid-cols-1
                min-[320px]:grid-cols-2
                sm:grid-cols-3
                lg:grid-cols-4
                xl:grid-cols-5
            "
        >
            {entries.map((entry) => (
                <LibraryGameCard
                    key={entry.game.id}
                    entry={entry}
                />
            ))}
        </div>
    );
}
