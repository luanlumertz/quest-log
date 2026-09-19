import { useNavigate, useParams } from "react-router";

import { useGameDetails } from "../hooks/game.hook";
import { useLibrary } from "../hooks/library.hook";

import { GameDetailsHero } from "../components/game/GameDetailsHero";
import { GameDetailsAbout } from "../components/game/GameDetailsAbout";

export function GameDetails() {
    const { externalId } = useParams();
    const navigate = useNavigate();

    const { data, isLoading, isError, error } = useGameDetails(externalId);
    const { data: library = [], isLoading: isLibraryLoading } = useLibrary();

    if (isLoading) {
        return (
            <div className="flex min-h-80 items-center justify-center">
                <p className="text-sm text-ink-mute">
                    Carregando jogo...
                </p>
            </div>
        );
    }

    if (isError) {
        return (
            <div className="flex min-h-80 items-center justify-center">
                <p className="text-sm text-danger">
                    Erro: {error.message}
                </p>
            </div>
        );
    }

    if (!data) {
        return (
            <div className="flex min-h-80 items-center justify-center">
                <p className="text-sm text-ink-mute">
                    Jogo não encontrado.
                </p>
            </div>
        );
    }

    const libraryEntry = library.find((entry) => entry.game.externalId === data.externalId);

    const releaseYear = data.releaseDate
        ? data.releaseDate.slice(0, 4)
        : null;

    const developers = data.developers.length > 0
        ? data.developers.join(", ")
        : "Não informado";

    const coverUrl = data.coverUrl ?? "/images/default-game-cover.png";

    return (
        <div>
            <GameDetailsHero
                game={data}
                coverUrl={coverUrl}
                releaseYear={releaseYear}
                developers={developers}
                libraryEntry={libraryEntry}
                isLibraryLoading={isLibraryLoading}
                onBack={() => navigate(-1)}
            />

            <GameDetailsAbout
                description={data.description}
                releaseYear={releaseYear}
                developers={developers}
            />
        </div>
    );
}
