import { ButtonLink } from "../ui/Button";
import { MaterialIcon } from "../ui/MaterialIcon";

export function RecentGamesEmptyState() {
    return (
        <div className="flex flex-1 flex-col items-center justify-center py-8 text-center">
            <MaterialIcon
                name="stadia_controller"
                className="text-5xl! text-ink-mute"
            />

            <h3 className="mt-3 font-display text-xl font-bold text-ink">
                Sua biblioteca está vazia
            </h3>

            <p className="mt-2 text-sm text-ink-dim">
                Adicione seu primeiro jogo para começar a acompanhar seu progresso.
            </p>

            <ButtonLink
                to="/games/search"
                className="mt-5"
            >
                Procurar jogos
            </ButtonLink>
        </div>
    );
}
