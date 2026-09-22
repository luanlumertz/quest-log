import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { updateLibraryEntrySchema, type UpdateLibraryEntryData } from "../../../schema/library.schema";
import type { GameStatus } from "../../../types/game.types";
import type { LibraryEntry, LibraryEntryDetails } from "../../../types/library.types";
import { getTodayInputValue } from "./libraryGameDetailsForm.utils";
import {
    applyStatusRules,
    createDefaultValues,
    createUpdateCandidate,
    createValuesForStatus,
    getDateValidationError,
    getFieldsClearedOnSave,
    type DataLossField,
    type LibraryGameDetailsFormValues
} from "./libraryGameDetailsForm.rules";

type UseLibraryGameDetailsFormParams = {
    entry: LibraryEntryDetails;
    onSave: (data: UpdateLibraryEntryData) => Promise<LibraryEntry>;
};

type PendingSaveConfirmation = {
    fields: DataLossField[];
    data: UpdateLibraryEntryData;
};

export function useLibraryGameDetailsForm({ entry, onSave }: UseLibraryGameDetailsFormParams) {
    const today = getTodayInputValue();

    const [isSaved, setIsSaved] = useState(false);

    const [submitError, setSubmitError] = useState<string | null>(null);

    const [pendingSave, setPendingSave] = useState<PendingSaveConfirmation | null>(null);

    const {
        watch,
        getValues,
        setValue,
        setError,
        clearErrors,
        handleSubmit,
        reset,
        formState: {
            errors,
            isDirty
        }
    } = useForm<LibraryGameDetailsFormValues>({
        defaultValues:
            createDefaultValues(entry, today)
    });

    const status = watch("status");

    const rating = watch("rating");

    const playtimeHours = watch("playtimeHours");

    const platforms = watch("platforms");

    const startedAt = watch("startedAt");

    const completedAt = watch("completedAt");

    const isWantToPlay = status === "WANT_TO_PLAY";

    const isCompleted = status === "COMPLETED";

    useEffect(() => {
        if (!isSaved) {
            return;
        }

        const timeout = window.setTimeout(() => {
            setIsSaved(false);
        }, 2000);

        return () => {
            window.clearTimeout(
                timeout
            );
        };
    }, [isSaved]);

    useEffect(() => {
        if (isDirty) {
            setIsSaved(false);
        }
    }, [isDirty]);

    function handleStatusChange(nextStatus: GameStatus) {
        if (nextStatus === status) {
            return;
        }

        clearErrors();

        setSubmitError(null);

        const nextValues = createValuesForStatus(getValues(), nextStatus, today);

        setValue(
            "status",
            nextValues.status,
            { shouldDirty: true }
        );

        setValue(
            "rating",
            nextValues.rating,
            { shouldDirty: true }
        );

        setValue(
            "startedAt",
            nextValues.startedAt,
            { shouldDirty: true }
        );

        setValue(
            "completedAt",
            nextValues.completedAt,
            { shouldDirty: true }
        );
    }

    function handlePlaytimeChange(value: string) {
        clearErrors("playtimeHours");

        setSubmitError(null);

        setValue(
            "playtimeHours",
            value,
            { shouldDirty: true }
        );
    }

    function handleRatingChange(value: string) {
        clearErrors("rating");

        setSubmitError(null);

        setValue(
            "rating",
            value,
            { shouldDirty: true }
        );
    }

    function handleDateChange(field: "startedAt" | "completedAt", value: string) {
        if (field === "startedAt") {
            clearErrors(["startedAt", "completedAt"]);
        } else {
            clearErrors("completedAt");
        }

        setSubmitError(null);

        setValue(field, value, { shouldDirty: true });
    }

    function handleClearInput(field: "playtimeHours" | "startedAt" | "completedAt") {
        if (field === "playtimeHours") {
            handlePlaytimeChange("");

            return;
        }

        handleDateChange(field, "");
    }

    function handlePlatformToggle(platformId: number) {
        clearErrors("platforms");

        setSubmitError(null);

        const currentPlatforms = getValues("platforms");

        const isSelected = currentPlatforms.includes(platformId);

        const nextPlatforms = isSelected
            ? currentPlatforms.filter((id) => id !== platformId)
            : [...currentPlatforms, platformId];

        setValue(
            "platforms",
            nextPlatforms,
            { shouldDirty: true }
        );
    }

    function handleDiscardChanges() {
        reset();

        clearErrors();

        setSubmitError(null);

        setIsSaved(false);

        setPendingSave(null);
    }

    function applySchemaErrors(issues: { path: PropertyKey[]; message: string; }[]) {
        for (const issue of issues) {
            const field = issue.path[0];

            if (
                field === "status" ||
                field === "rating" ||
                field === "platforms" ||
                field === "startedAt" ||
                field === "completedAt"
            ) {
                setError(
                    field,
                    {
                        type: "manual",
                        message: issue.message
                    }
                );

                continue;
            }

            if (field === "playtimeMinutes") {
                setError(
                    "playtimeHours",
                    {
                        type: "manual",
                        message: issue.message
                    }
                );

                continue;
            }

            setSubmitError(issue.message);
        }
    }

    async function saveChanges(data: UpdateLibraryEntryData) {
        try {
            const updatedEntry = await onSave(data);

            reset(
                createDefaultValues(
                    {
                        ...entry,
                        ...updatedEntry,
                        availablePlatforms: entry.availablePlatforms
                    },
                    today
                )
            );

            setIsSaved(true);
        } catch (error) {
            setSubmitError(error instanceof Error
                ? error.message
                : "Não foi possível salvar as alterações"
            );
        }
    }

    async function onSubmit(values: LibraryGameDetailsFormValues) {
        clearErrors();

        setSubmitError(null);

        const normalizedValues = applyStatusRules(values, today);

        if (normalizedValues.startedAt !== values.startedAt) {
            setValue(
                "startedAt",
                normalizedValues.startedAt,
                { shouldDirty: true }
            );
        }

        if (normalizedValues.completedAt !== values.completedAt) {
            setValue(
                "completedAt",
                normalizedValues.completedAt,
                { shouldDirty: true }
            );
        }

        const dateError = getDateValidationError(normalizedValues, today);

        if (dateError) {
            setError(
                dateError.field,
                {
                    type: "manual",
                    message: dateError.message
                }
            );

            return;
        }

        const candidate = createUpdateCandidate(normalizedValues, today);

        const result = updateLibraryEntrySchema.safeParse(candidate);

        if (!result.success) {
            applySchemaErrors(result.error.issues);

            return;
        }

        const fieldsToClear = getFieldsClearedOnSave(entry, result.data);

        if (fieldsToClear.length > 0) {
            setPendingSave({
                fields: fieldsToClear,
                data: result.data
            });

            return;
        }

        await saveChanges(result.data);
    }

    async function handleConfirmSave() {
        if (!pendingSave) {
            return;
        }

        const data = pendingSave.data;

        setPendingSave(null);

        await saveChanges(data);
    }

    function handleCancelSave() {
        setPendingSave(null);
    }

    const handleFormSubmit = handleSubmit(onSubmit);

    return {
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

        pendingDataLossFields: pendingSave?.fields ?? null,

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
    };
}
