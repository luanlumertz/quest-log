import { MaterialIcon } from "../../ui/MaterialIcon";

type LibraryNoResultsProps = {
    onClearFilters: () => void;
};

export function LibraryNoResults({ onClearFilters }: LibraryNoResultsProps) {
    return (
        <div className="mt-16 text-center">
            <MaterialIcon
                name="search_off"
                className="text-5xl! text-ink-mute"
            />

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
