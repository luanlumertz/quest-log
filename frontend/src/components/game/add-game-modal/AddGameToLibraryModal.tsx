import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { addGameToLibraryFormSchema, type AddGameToLibraryFormData } from "../../../schema/library.schema";
import { useAddGameToLibrary } from "../../../hooks/library.hook";
import type { GameDetailsResult } from "../../../types/game.types";
import { AddGameModalHeader } from "./AddGameModalHeader";
import { GameStatusSelector } from "../../ui/GameStatusSelector";
import { GamePlatformSelector } from "./GamePlatformSelector";
import { Button } from "../../ui/Button";
import { Modal } from "../../ui/Modal";

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

    if (!isOpen) return null;

    return (
        <Modal
            onClose={handleClose}
            preventClose={isSubmitting}
            ariaLabelledBy="add-game-title"
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
                            mt-5
                            rounded-lg
                            border border-danger/30
                          bg-danger/10
                            px-3 py-2
                            text-sm
                          text-danger
                        "
                    >
                        {errors.root.message}
                    </p>
                )}

                <div className="mt-6 grid grid-cols-2 gap-3">
                    <Button
                        variant="secondary"
                        onClick={handleClose}
                        disabled={isSubmitting}
                        fullWidth
                    >
                        Cancelar
                    </Button>

                    <Button
                        type="submit"
                        disabled={availablePlatforms.length === 0}
                        isLoading={isSubmitting}
                        loadingText="Adicionando..."
                        fullWidth
                        className="wrap-anywhere"
                    >
                        Adicionar à biblioteca
                    </Button>
                </div>
            </form>
        </Modal>
    );
}
