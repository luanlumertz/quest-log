import { Button } from "../../ui/Button";
import { StateView } from "../../ui/StateView";

type LibraryNoResultsProps = {
    onClearFilters: () => void;
};

export function LibraryNoResults({ onClearFilters }: LibraryNoResultsProps) {
    return (
        <StateView
            icon="search_off"
            title="Nenhum jogo encontrado"
            description="Nenhum jogo corresponde aos filtros atuais."
            className="mt-8"
            action={
                <Button
                    variant="secondary"
                    onClick={onClearFilters}
                >
                    Limpar filtros
                </Button>
            }
        />
    );
}
