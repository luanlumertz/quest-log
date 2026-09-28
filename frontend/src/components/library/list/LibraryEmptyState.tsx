import { ButtonLink } from "../../ui/Button";
import { StateView } from "../../ui/StateView";

export function LibraryEmptyState() {
    return (
        <StateView
            icon="library_books"
            title="Sua biblioteca está vazia"
            description="Procure jogos e adicione os que você quer acompanhar."
            className="mt-8"
            action={
                <ButtonLink to="/games/search">
                    Procurar jogos
                </ButtonLink>
            }
        />
    );
}
