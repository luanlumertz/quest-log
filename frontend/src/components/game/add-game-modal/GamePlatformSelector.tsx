import { MultiSelectChips } from "../../ui/MultiSelectChips";

type GamePlatformSelectorProps = {
    platforms: string[];
    selectedPlatforms: string[];
    error?: string;
    onToggle: (platform: string) => void;
};

export function GamePlatformSelector({
    platforms,
    selectedPlatforms,
    error,
    onToggle,
}: GamePlatformSelectorProps) {
    return (
        <MultiSelectChips
            className="mt-5"
            label={
                <>
                    Plataforma(s) <span className="normal-case tracking-normal">(opcional)</span>
                </>
            }
            options={platforms.map((name) => ({ value: name, label: name }))}
            selectedValues={selectedPlatforms}
            onToggle={onToggle}
            error={error}
            emptyMessage="Nenhuma plataforma disponível."
            surface="raised"
        />
    );
}
