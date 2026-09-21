import type { GameStatus } from "../../types/game.types";
import { GAME_STATUS_CONFIG } from "../../config/gameStatus.config";

type LibraryCounts = {
    all: number;
} & Record<GameStatus, number>;

type LibraryFiltersProps = {
    search: string;
    status?: GameStatus;
    counts?: LibraryCounts;
    onSearchChange: (value: string) => void;
    onStatusChange: (status?: GameStatus) => void;
};

type StatusFilterButtonProps = {
    filterStatus?: GameStatus;
    selectedStatus?: GameStatus;
    count: number | null;
    onClick: (status?: GameStatus) => void;
};

const STATUS_FILTERS: (GameStatus | undefined)[] = [
    undefined,
    "PLAYING",
    "COMPLETED",
    "WANT_TO_PLAY",
    "ABANDONED"
];

export function LibraryFilters({
    search,
    status,
    counts,
    onSearchChange,
    onStatusChange
}: LibraryFiltersProps) {
    function getCount(filterStatus?: GameStatus) {
        if (!counts) return null;

        return filterStatus ? counts[filterStatus] : counts.all;
    }

    return (
        <div className="mt-6 flex flex-col gap-4 lg:flex-row lg:items-center">
            <div className="relative w-full lg:max-w-75">
                <span
                    aria-hidden="true"
                    className="
                        material-symbols-rounded
                        absolute left-3 top-1/2 -translate-y-1/2
                        text-xl! text-ink-mute
                    "
                >
                    search
                </span>

                <input
                    type="text"
                    value={search}
                    onChange={(event) =>
                        onSearchChange(event.target.value)
                    }
                    placeholder="Filtrar por título..."
                    spellCheck={false}
                    aria-label="Filtrar biblioteca por título"
                    className="
                        h-10 w-full rounded-xl
                        border border-divider
                        bg-surface
                        pl-10 pr-4
                        text-sm text-ink
                        outline-none
                        transition-colors
                        placeholder:text-ink-mute
                        focus:border-brand
                    "
                />
            </div>

            <div className="flex flex-wrap gap-2">
                {STATUS_FILTERS.map((filterStatus) => (
                    <StatusFilterButton
                        key={filterStatus ?? "ALL"}
                        filterStatus={filterStatus}
                        selectedStatus={status}
                        count={getCount(filterStatus)}
                        onClick={onStatusChange}
                    />
                ))}
            </div>
        </div>
    );
}

function StatusFilterButton({ filterStatus, selectedStatus, count, onClick }: StatusFilterButtonProps) {
    const isSelected = selectedStatus === filterStatus;

    const statusInfo = filterStatus ? GAME_STATUS_CONFIG[filterStatus] : null;

    const label = statusInfo?.label ?? "Todos";

    return (
        <button
            type="button"
            onClick={() => onClick(filterStatus)}
            aria-pressed={isSelected}
            className={`
                flex min-h-10 cursor-pointer items-center gap-1
                rounded-xl border px-3
                text-[12px] font-medium
                transition-colors
                ${!isSelected
                    ? `
                            border-divider
                            bg-surface
                            text-ink-mute
                            hover:border-divider-bright
                            hover:text-ink-dim
                        `
                    : ""
                }
            `}
            style={isSelected ? statusInfo
                ? {
                    color: statusInfo.color,
                    borderColor: `${statusInfo.color}66`,
                    backgroundColor: `${statusInfo.color}1A`
                } : {
                    color: "var(--color-brand)",
                    borderColor: "color-mix(in srgb, var(--color-brand) 40%, transparent)",
                    backgroundColor: "color-mix(in srgb, var(--color-brand) 12%, transparent)"
                } : undefined
            }
        >
            {label}

            {count !== null && (
                <span
                    className="rounded-md px-1.5 py-0.5 text-[12px]"
                    style={isSelected && statusInfo ?
                        {
                            color: statusInfo.color,
                            backgroundColor: `${statusInfo.color}22`
                        } : undefined
                    }
                >
                    {count}
                </span>
            )}
        </button>
    );
}
