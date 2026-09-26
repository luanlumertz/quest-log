import { ButtonLink } from "../../ui/Button";
import { MaterialIcon } from "../../ui/MaterialIcon";

export function LibraryEmptyState() {
    return (
        <div className="mt-16 text-center">
            <MaterialIcon
                name="library_books"
                className="text-5xl! text-ink-mute"
            />

            <h2 className="mt-3 font-display text-xl font-bold text-ink">
                Sua biblioteca está vazia
            </h2>

            <p className="mt-2 text-sm text-ink-dim">
                Procure jogos e adicione os que você quer acompanhar.
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
