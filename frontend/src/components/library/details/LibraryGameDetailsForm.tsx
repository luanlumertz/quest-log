import type { UpdateLibraryEntryData } from "../../../schema/library.schema";
import type { LibraryEntry, LibraryEntryDetails } from "../../../types/library.types";
import { GameStatusSelector } from "../../ui/GameStatusSelector";
import { ConfirmDataLossModal } from "./ConfirmDataLossModal";
import { LibraryDateField } from "./LibraryDateField";
import { LibraryGameDetailsFormActions } from "./LibraryGameDetailsFormActions";
import { LibraryPlatformSelector } from "./LibraryPlatformSelector";
import { LibraryPlaytimeField } from "./LibraryPlaytimeField";
import { LibraryRatingField } from "./LibraryRatingField";
import { useLibraryGameDetailsForm } from "./useLibraryGameDetailsForm";

type LibraryGameDetailsFormProps = {
    entry: LibraryEntryDetails;
    isSaving: boolean;
    isDeleting: boolean;
    onSave: (data: UpdateLibraryEntryData) => Promise<LibraryEntry>;
    onRemove: () => void;
};

export function LibraryGameDetailsForm({
    entry,
    isSaving,
    isDeleting,
    onSave,
    onRemove
}: LibraryGameDetailsFormProps) {
    const {
        status,
        rating,
        playtimeHours,
        platforms,
        startedAt,
        completedAt,

        today,
        isWantToPlay,
        isCompleted,

        errors,
        isDirty,
        isSaved,
        submitError,

        pendingDataLossFields,

        handleFormSubmit,
        handleStatusChange,
        handlePlaytimeChange,
        handleRatingChange,
        handleDateChange,
        handleClearInput,
        handlePlatformToggle,
        handleDiscardChanges,
        handleConfirmSave,
        handleCancelSave
    } = useLibraryGameDetailsForm({ entry, onSave });

    return (
        <>
            <form
                onSubmit={handleFormSubmit}
                className="mt-7"
            >
                <GameStatusSelector
                    value={status}
                    error={errors.status?.message}
                    disabled={isSaving}
                    onChange={handleStatusChange}
                />

                <div className="mt-7">
                    <LibraryPlatformSelector
                        platforms={entry.availablePlatforms}
                        selectedPlatforms={platforms}
                        error={errors.platforms?.message}
                        disabled={isSaving}
                        onToggle={handlePlatformToggle}
                    />
                </div>

                <div className="mt-7 grid gap-6 md:grid-cols-2">
                    <LibraryPlaytimeField
                        value={playtimeHours}
                        error={errors.playtimeHours?.message}
                        disabled={isSaving}
                        onChange={handlePlaytimeChange}
                        onClear={() => handleClearInput("playtimeHours")}
                    />

                    <LibraryRatingField
                        value={rating}
                        error={errors.rating?.message}
                        disabled={isSaving || isWantToPlay}
                        onChange={handleRatingChange}
                    />
                </div>

                <div className="mt-7 grid gap-6 md:grid-cols-2">
                    <LibraryDateField
                        id="startedAt"
                        label="Data de início"
                        value={startedAt}
                        max={today}
                        error={errors.startedAt?.message}
                        disabled={isSaving || isWantToPlay}
                        onChange={(value) => handleDateChange("startedAt", value)}
                        onClear={() => handleClearInput("startedAt")}
                    />

                    <LibraryDateField
                        id="completedAt"
                        label="Data de conclusão"
                        value={completedAt}
                        min={startedAt || undefined}
                        max={today}
                        error={errors.completedAt?.message}
                        disabled={isSaving || !isCompleted}
                        onChange={(value) => handleDateChange("completedAt", value)}
                        onClear={() => handleClearInput("completedAt")}
                    />
                </div>

                {submitError && (
                    <p
                        className="
                            mt-6
                            rounded-xl
                            border
                            border-danger/30
                            bg-danger/10
                            px-3 py-2
                            text-sm
                            text-danger
                        "
                    >
                        {submitError}
                    </p>
                )}

                <LibraryGameDetailsFormActions
                    isSaving={isSaving}
                    isDeleting={isDeleting}
                    isDirty={isDirty}
                    isSaved={isSaved}
                    onDiscardChanges={handleDiscardChanges}
                    onRemove={onRemove}
                />
            </form>

            {pendingDataLossFields && (
                <ConfirmDataLossModal
                    fields={pendingDataLossFields}
                    onConfirm={handleConfirmSave}
                    onCancel={handleCancelSave}
                />
            )}
        </>
    );
}
