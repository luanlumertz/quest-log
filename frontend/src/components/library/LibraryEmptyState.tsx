import { Link } from "react-router";

export function LibraryEmptyState() {
    return (
        <div className="mt-16 text-center">
            <span
                aria-hidden="true"
                className="material-symbols-rounded text-5xl! text-ink-mute"
            >
                library_books
            </span>

            <h2 className="mt-3 font-display text-xl font-bold text-ink">
                Sua biblioteca está vazia
            </h2>

            <p className="mt-2 text-sm text-ink-dim">
                Procure jogos e adicione os que você quer acompanhar.
            </p>

            <Link
                to="/games/search"
                className="
                    mt-5 inline-block
                    rounded-xl bg-brand
                    px-5 py-3
                    text-sm font-semibold text-white
                    hover:bg-brand-dim
                "
            >
                Procurar jogos
            </Link>
        </div>
    );
}
