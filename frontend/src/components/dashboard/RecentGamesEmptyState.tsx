import { ButtonLink } from "../ui/Button";
import { StateView } from "../ui/StateView";

export function RecentGamesEmptyState() {
    return (
        <StateView
            icon="stadia_controller"
            title="Sua biblioteca está vazia"
            description="Adicione seu primeiro jogo para começar a acompanhar seu progresso."
            className="min-h-0! py-8"
            action={
                <ButtonLink to="/games/search">
                    Procurar jogos
                </ButtonLink>
            }
        />
    );
}
