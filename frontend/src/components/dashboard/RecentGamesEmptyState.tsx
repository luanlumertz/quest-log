import { Link } from "react-router";

export function RecentGamesEmptyState() {
    return (
        <div className="flex flex-1 flex-col items-center justify-center py-8 text-center">
            <span
                aria-hidden="true"
                className="material-symbols-rounded text-5xl! text-ink-mute"
            >
                stadia_controller
            </span>

            <h3 className="mt-3 font-display text-xl font-bold text-ink">
                Sua biblioteca está vazia
            </h3>

            <p className="mt-2 text-sm text-ink-dim">
                Adicione seu primeiro jogo para começar a acompanhar seu progresso.
            </p>

            <Link
                to="/games/search"
                className="
                    mt-5 rounded-xl bg-brand
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
