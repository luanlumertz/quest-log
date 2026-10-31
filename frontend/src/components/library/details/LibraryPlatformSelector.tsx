import type { Platform } from "../../../types/platform.types";
import { MultiSelectChips } from "../../ui/MultiSelectChips";

type LibraryPlatformSelectorProps = {
    platforms: Platform[];
    selectedPlatforms: number[];
    error?: string;
    disabled?: boolean;
    onToggle: (platformId: number) => void;
};

export function LibraryPlatformSelector({
    platforms,
    selectedPlatforms,
    error,
    disabled = false,
    onToggle,
}: LibraryPlatformSelectorProps) {
    return (
        <MultiSelectChips
            label={
                <>
                    Plataforma(s) jogada(s){" "}
                    <span className="normal-case tracking-normal">(opcional)</span>
                </>
            }
            options={platforms.map((platform) => ({ value: platform.id, label: platform.name }))}
            selectedValues={selectedPlatforms}
            onToggle={onToggle}
            disabled={disabled}
            error={error}
            emptyMessage="Nenhuma plataforma disponível."
            showCheck
        />
    );
}
