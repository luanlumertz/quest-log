type LibraryNoResultsProps = {
    onClearFilters: () => void;
};

export function LibraryNoResults({ onClearFilters }: LibraryNoResultsProps) {
    return (
        <div className="mt-16 text-center">
            <span
                aria-hidden="true"
                className="material-symbols-rounded text-5xl! text-ink-mute"
            >
                search_off
            </span>

            <h2 className="mt-3 font-display text-xl font-bold text-ink">
                Nenhum jogo encontrado
            </h2>

            <p className="mt-2 text-sm text-ink-dim">
                Nenhum jogo corresponde aos filtros atuais.
            </p>

            <button
                type="button"
                onClick={onClearFilters}
                className="
                    mt-4 cursor-pointer
                    text-sm font-semibold text-brand
                    hover:underline
                "
            >
                Limpar filtros
            </button>
        </div>
    );
}
