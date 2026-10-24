import { Button } from "../../ui/Button";

type SearchGamesPaginationProps = {
    page: number;
    hasPrevious: boolean;
    hasNext: boolean;
    isFetching: boolean;
    onPageChange: (page: number) => void;
};

export function SearchGamesPagination({
    page,
    hasPrevious,
    hasNext,
    isFetching,
    onPageChange,
}: SearchGamesPaginationProps) {
    return (
        <nav
            aria-label="Paginação dos jogos"
            className="mt-auto flex flex-wrap items-center justify-center gap-3 pt-8"
        >
            <Button
                variant="secondary"
                size="sm"
                disabled={!hasPrevious || isFetching}
                onClick={() => onPageChange(page - 1)}
            >
                Anterior
            </Button>

            <span aria-current="page" className="text-sm text-ink-mute">
                Página {page}
            </span>

            <Button
                variant="secondary"
                size="sm"
                disabled={!hasNext || isFetching}
                onClick={() => onPageChange(page + 1)}
            >
                Próxima
            </Button>
        </nav>
    );
}
