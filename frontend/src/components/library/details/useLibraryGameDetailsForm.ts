import { useEffect, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import {
    updateLibraryEntrySchema,
    type UpdateLibraryEntryData,
} from "../../../schema/library.schema";
import type { GameStatus } from "../../../types/game.types";
import type { LibraryEntry, LibraryEntryDetails } from "../../../types/library.types";
import { getTodayInputValue } from "./libraryGameDetailsForm.utils";
import { getErrorMessage } from "../../../utils/getErrorMessage";
import {
    createDefaultValues,
    createUpdateCandidate,
    getDateValidationError,
    type LibraryGameDetailsFormValues,
} from "./libraryGameDetailsForm.rules";

type UseLibraryGameDetailsFormParams = {
    entry: LibraryEntryDetails;
    onSave: (data: UpdateLibraryEntryData) => Promise<LibraryEntry>;
};

export function useLibraryGameDetailsForm({ entry, onSave }: UseLibraryGameDetailsFormParams) {
    const today = getTodayInputValue();

    const [isSaved, setIsSaved] = useState(false);

    const [submitError, setSubmitError] = useState<string | null>(null);

    const {
        control,
        getValues,
        setValue,
        setError,
        clearErrors,
        handleSubmit,
        reset,
        formState: { errors, isDirty, dirtyFields },
    } = useForm<LibraryGameDetailsFormValues>({
        defaultValues: createDefaultValues(entry),
    });

    const status = useWatch({ control, name: "status" });

    const rating = useWatch({ control, name: "rating" });

    const playtimeHours = useWatch({ control, name: "playtimeHours" });

    const platforms = useWatch({ control, name: "platforms" });

    const startedAt = useWatch({ control, name: "startedAt" });

    const completedAt = useWatch({ control, name: "completedAt" });

    useEffect(() => {
        if (!isSaved) {
            return;
        }

        const timeout = window.setTimeout(() => {
            setIsSaved(false);
        }, 2000);

        return () => {
            window.clearTimeout(timeout);
        };
    }, [isSaved]);

    function handleStatusChange(nextStatus: GameStatus) {
        if (nextStatus === status) {
            return;
        }

        clearErrors();

        setSubmitError(null);

        setValue("status", nextStatus, { shouldDirty: true });
    }

    function handlePlaytimeChange(value: string) {
        clearErrors("playtimeHours");

        setSubmitError(null);

        setValue("playtimeHours", value, { shouldDirty: true });
    }

    function handleRatingChange(value: string) {
        clearErrors("rating");

        setSubmitError(null);

        setValue("rating", value, { shouldDirty: true });
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

        setValue("platforms", nextPlatforms, { shouldDirty: true });
    }

    function handleDiscardChanges() {
        reset();

        clearErrors();

        setSubmitError(null);

        setIsSaved(false);
    }

    function applySchemaErrors(issues: { path: PropertyKey[]; message: string }[]) {
        for (const issue of issues) {
            const field = issue.path[0];

            if (
                field === "status" ||
                field === "rating" ||
                field === "platforms" ||
                field === "startedAt" ||
                field === "completedAt"
            ) {
                setError(field, {
                    type: "manual",
                    message: issue.message,
                });

                continue;
            }

            if (field === "playtimeMinutes") {
                setError("playtimeHours", {
                    type: "manual",
                    message: issue.message,
                });

                continue;
            }

            setSubmitError(issue.message);
        }
    }

    async function saveChanges(data: UpdateLibraryEntryData) {
        try {
            const updatedEntry = await onSave(data);

            reset(
                createDefaultValues({
                    ...entry,
                    ...updatedEntry,
                    availablePlatforms: entry.availablePlatforms,
                }),
            );

            setIsSaved(true);
        } catch (error) {
            setSubmitError(getErrorMessage(error, "Não foi possível salvar as alterações."));
        }
    }

    async function onSubmit(values: LibraryGameDetailsFormValues) {
        clearErrors();

        setSubmitError(null);

        const dateError = getDateValidationError(values, today);

        if (dateError) {
            setError(dateError.field, {
                type: "manual",
                message: dateError.message,
            });

            return;
        }

        const changedFields = (
            Object.keys(dirtyFields) as (keyof LibraryGameDetailsFormValues)[]
        ).filter((field) => dirtyFields[field]);

        const candidate = createUpdateCandidate(values, changedFields);

        const result = updateLibraryEntrySchema.safeParse(candidate);

        if (!result.success) {
            applySchemaErrors(result.error.issues);

            return;
        }

        await saveChanges(result.data);
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

        errors,
        isDirty,
        isSaved: isSaved && !isDirty,
        submitError,

        handleFormSubmit,
        handleStatusChange,
        handlePlaytimeChange,
        handleRatingChange,
        handleDateChange,
        handleClearInput,
        handlePlatformToggle,
        handleDiscardChanges,
    };
}
