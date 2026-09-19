import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { addGameToLibraryFormSchema, type AddGameToLibraryFormData } from "../../../schema/library.schema";
import { useAddGameToLibrary } from "../../../hooks/library.hook";
import type { GameDetailsResult } from "../../../types/game.types";
import { AddGameModalHeader } from "./AddGameModalHeader";
import { GameStatusSelector } from "./GameStatusSelector";
import { GamePlatformSelector } from "./GamePlatformSelector";

type AddGameToLibraryModalProps = {
    game: GameDetailsResult;
    isOpen: boolean;
    onClose: () => void;
};

const DEFAULT_VALUES: AddGameToLibraryFormData = {
    status: "WANT_TO_PLAY",
    platforms: []
};

export function AddGameToLibraryModal({ game, isOpen, onClose }: AddGameToLibraryModalProps) {
    const {
        handleSubmit,
        watch,
        setValue,
        setError,
        reset,
        formState: { errors, isSubmitting }
    } = useForm<AddGameToLibraryFormData>({
        resolver: zodResolver(addGameToLibraryFormSchema),
        defaultValues: DEFAULT_VALUES
    });

    const { mutateAsync: addGameToLibrary } = useAddGameToLibrary();

    const selectedStatus = watch("status");
    const selectedPlatforms = watch("platforms");

    const availablePlatforms = [...new Set(game.platforms)];

    function resetAndClose() {
        reset(DEFAULT_VALUES);
        onClose();
    }

    function handleClose() {
        if (isSubmitting) return;

        resetAndClose();
    }

    function handleStatusChange(
        status: AddGameToLibraryFormData["status"]
    ) {
        setValue("status", status, {
            shouldValidate: true
        });
    }

    function handlePlatformToggle(platform: string) {
        const isSelected = selectedPlatforms.includes(platform);

        const nextPlatforms = isSelected
            ? selectedPlatforms.filter((item) => item !== platform)
            : [...selectedPlatforms, platform];

        setValue("platforms", nextPlatforms, {
            shouldValidate: true,
            shouldDirty: true
        });
    }

    async function onSubmit(data: AddGameToLibraryFormData) {
        try {
            await addGameToLibrary({
                externalId: game.externalId,
                status: data.status,
                platforms: data.platforms
            });

            resetAndClose();
        } catch (error) {
            setError("root", {
                message: error instanceof Error ? error.message : "Não foi possível adicionar o jogo"
            });
        }
    }

    useEffect(() => {
        if (!isOpen) return;

        function handleEscape(event: KeyboardEvent) {
            if (event.key === "Escape" && !isSubmitting) {
                reset(DEFAULT_VALUES);
                onClose();
            }
        }

        const previousOverflow = document.body.style.overflow;

        document.body.style.overflow = "hidden";
        window.addEventListener("keydown", handleEscape);

        return () => {
            document.body.style.overflow = previousOverflow;
            window.removeEventListener("keydown", handleEscape);
        };
    }, [isOpen, isSubmitting, onClose, reset]);

    if (!isOpen) return null;

    return (
        <div
            className="
                fixed inset-0 z-50 flex items-center justify-center
                bg-black/75 p-4 backdrop-blur-sm
            "
            onMouseDown={(event) => {
                if (event.target === event.currentTarget) {
                    handleClose();
                }
            }}
        >
            <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="add-game-title"
                className="
                    w-full max-w-md max-h-[calc(100dvh-2rem)]
                    overflow-y-auto rounded-2xl
                    border border-divider-bright
                    bg-surface shadow-2xl
                "
            >
                <AddGameModalHeader
                    title={game.title}
                    coverUrl={game.coverUrl}
                    isSubmitting={isSubmitting}
                    onClose={handleClose}
                />

                <form
                    onSubmit={handleSubmit(onSubmit)}
                    className="p-5"
                >
                    <GameStatusSelector
                        value={selectedStatus}
                        onChange={handleStatusChange}
                    />

                    <GamePlatformSelector
                        platforms={availablePlatforms}
                        selectedPlatforms={selectedPlatforms}
                        error={errors.platforms?.message}
                        onToggle={handlePlatformToggle}
                    />

                    {errors.root && (
                        <p
                            className="
                                mt-5 rounded-lg
                                border border-danger/30
                                bg-danger/10 px-3 py-2
                                text-sm text-danger
                            "
                        >
                            {errors.root.message}
                        </p>
                    )}

                    <div className="mt-6 grid grid-cols-2 gap-3">
                        <button
                            type="button"
                            onClick={handleClose}
                            disabled={isSubmitting}
                            className="
                                min-h-11 rounded-xl
                                border border-divider-bright
                                text-sm font-semibold text-ink-mute
                                transition-colors cursor-pointer
                                hover:bg-surface-hover hover:text-ink
                                disabled:cursor-not-allowed disabled:opacity-50
                            "
                        >
                            Cancelar
                        </button>

                        <button
                            type="submit"
                            disabled={
                                isSubmitting ||
                                availablePlatforms.length === 0
                            }
                            className="
                                min-h-11 rounded-xl bg-brand px-3
                                text-sm font-semibold text-white
                                transition-colors cursor-pointer wrap-anywhere
                                hover:bg-brand-dim
                                disabled:cursor-not-allowed disabled:opacity-50
                            "
                        >
                            {isSubmitting
                                ? "Adicionando..."
                                : "Adicionar à biblioteca"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
