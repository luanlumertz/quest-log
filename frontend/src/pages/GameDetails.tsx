import { useNavigate, useParams } from "react-router";

import { useGameDetails } from "../hooks/game.hook";
import { useLibrary } from "../hooks/library.hook";
import { useDocumentTitle } from "../hooks/useDocumentTitle";

import { GameDetailsHero } from "../components/game/details/GameDetailsHero";
import { GameDetailsAbout } from "../components/game/details/GameDetailsAbout";

import { Button, ButtonLink } from "../components/ui/Button";
import { LoadingState } from "../components/ui/LoadingState";
import { StateView } from "../components/ui/StateView";

import { DEFAULT_GAME_COVER_URL } from "../config/game.config";

import { ApiError } from "../services/api";

export function GameDetails() {
    const { externalId } = useParams();
    const navigate = useNavigate();

    const numericExternalId = Number(externalId);
    const isValidExternalId = Number.isInteger(numericExternalId) && numericExternalId > 0;

    const { data, isLoading, isError, error, isFetching, refetch } = useGameDetails(externalId);
    const {
        data: library,
        isLoading: isLibraryLoading,
        isError: isLibraryError,
        isFetching: isLibraryFetching,
        refetch: refetchLibrary
    } = useLibrary();

    useDocumentTitle(data?.title);

    if (!isValidExternalId) {
        return (
            <StateView
                icon="search_off"
                title="Jogo não encontrado"
                description="O endereço acessado não corresponde a um jogo válido."
                action={
                    <ButtonLink to="/games/search">
                        Procurar jogos
                    </ButtonLink>
                }
            />
        );
    }

    if (isLoading) {
        return (
            <LoadingState label="Carregando jogo..." />
        );
    }

    if (isError && error instanceof ApiError && error.status === 404) {
        return (
            <StateView
                icon="search_off"
                title="Jogo não encontrado"
                description="O jogo solicitado não existe ou não está mais disponível."
                action={
                    <ButtonLink to="/games/search">
                        Procurar jogos
                    </ButtonLink>
                }
            />
        );
    }

    if (isError) {
        return (
            <StateView
                icon="error"
                tone="danger"
                title="Não foi possível carregar o jogo"
                description="Tente novamente em alguns instantes."
                action={
                    <Button
                        isLoading={isFetching}
                        loadingText="Tentando..."
                        onClick={() => void refetch()}
                    >
                        Tentar novamente
                    </Button>
                }
            />
        );
    }

    if (!data) {
        return (
            <StateView
                icon="search_off"
                title="Jogo não encontrado"
                description="O jogo solicitado não está disponível."
                action={
                    <ButtonLink to="/games/search">
                        Procurar jogos
                    </ButtonLink>
                }
            />
        );
    }

    const libraryEntry = library?.find((entry) => entry.game.externalId === data.externalId);

    const releaseYear = data.releaseDate
        ? data.releaseDate.slice(0, 4)
        : null;

    const developers = data.developers.length > 0
        ? data.developers.join(", ")
        : "Não informado";

    const coverUrl = data.coverUrl ?? DEFAULT_GAME_COVER_URL;

    return (
        <div>
            <GameDetailsHero
                game={data}
                coverUrl={coverUrl}
                releaseYear={releaseYear}
                developers={developers}
                libraryEntry={libraryEntry}
                isLibraryLoading={isLibraryLoading}
                isLibraryError={isLibraryError}
                isLibraryFetching={isLibraryFetching}
                onRetryLibrary={() => void refetchLibrary()}
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
