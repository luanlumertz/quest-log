import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState, type ComponentProps } from "react";
import { fn } from "storybook/test";
import { LibraryGameDetailsForm } from "../../../../src/components/library/details/LibraryGameDetailsForm";
import { ConfirmDeleteLibraryEntryModal } from "../../../../src/components/library/details/ConfirmDeleteLibraryEntryModal";
import type { UpdateLibraryEntryData } from "../../../../src/schema/library.schema";
import type { LibraryEntryDetails } from "../../../../src/types/library.types";
import { StateView } from "../../../../src/components/ui/StateView";
import { Button } from "../../../../src/components/ui/Button";
import { demoLibraryEntryDetails } from "../../../fixtures/library";

type Scenario = "success" | "slow" | "save-error" | "delete-error";

function applyUpdate(
    entry: LibraryEntryDetails,
    data: UpdateLibraryEntryData,
): LibraryEntryDetails {
    return {
        ...entry,
        ...data,
        platforms:
            data.platforms === undefined
                ? entry.platforms
                : entry.availablePlatforms.filter((platform) =>
                      data.platforms?.includes(platform.id),
                  ),
        startedAt:
            data.startedAt === undefined
                ? entry.startedAt
                : (data.startedAt?.toISOString() ?? null),
        completedAt:
            data.completedAt === undefined
                ? entry.completedAt
                : (data.completedAt?.toISOString() ?? null),
        updatedAt: new Date().toISOString(),
    };
}

function FormDemo({
    args,
    scenario,
}: {
    args: ComponentProps<typeof LibraryGameDetailsForm>;
    scenario: Scenario;
}) {
    const [entry, setEntry] = useState(args.entry);
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [removed, setRemoved] = useState(false);
    const [deleteError, setDeleteError] = useState<string>();

    async function save(data: UpdateLibraryEntryData) {
        setSaving(true);
        try {
            await args.onSave(data);
            await new Promise((resolve) =>
                window.setTimeout(resolve, scenario === "slow" ? 2500 : 350),
            );
            if (scenario === "save-error") throw new Error("Falha simulada ao salvar.");
            const updated = applyUpdate(entry, data);
            setEntry(updated);
            return updated;
        } finally {
            setSaving(false);
        }
    }

    async function confirmRemoval() {
        setDeleting(true);
        try {
            await new Promise((resolve) =>
                window.setTimeout(resolve, scenario === "slow" ? 2500 : 350),
            );
            if (scenario === "delete-error") {
                setDeleteError("Não foi possível remover o jogo. Esta é uma falha simulada.");
                return;
            }
            setConfirmOpen(false);
            setRemoved(true);
        } finally {
            setDeleting(false);
        }
    }

    if (removed)
        return (
            <StateView
                icon="check_circle"
                title="Jogo removido da demonstração"
                description="Nenhum dado real foi alterado. Volte ao formulário para repetir o fluxo."
                action={<Button onClick={() => setRemoved(false)}>Voltar à demonstração</Button>}
            />
        );

    return (
        <div className="max-w-3xl">
            <LibraryGameDetailsForm
                entry={entry}
                isSaving={args.isSaving || saving}
                isDeleting={args.isDeleting || deleting}
                onSave={save}
                onRemove={() => {
                    args.onRemove();
                    setDeleteError(undefined);
                    setConfirmOpen(true);
                }}
            />
            {confirmOpen && (
                <ConfirmDeleteLibraryEntryModal
                    gameTitle={entry.game.title}
                    isDeleting={deleting}
                    error={deleteError}
                    onConfirm={() => void confirmRemoval()}
                    onCancel={() => {
                        if (!deleting) setConfirmOpen(false);
                    }}
                />
            )}
        </div>
    );
}

const meta = {
    title: "Componentes/Biblioteca/Detalhes/LibraryGameDetailsForm",
    component: LibraryGameDetailsForm,
    args: {
        entry: demoLibraryEntryDetails,
        isSaving: false,
        isDeleting: false,
        onSave: fn(async (data: UpdateLibraryEntryData) =>
            applyUpdate(demoLibraryEntryDetails, data),
        ),
        onRemove: fn(),
    },
    render: (args, context) => (
        <FormDemo
            key={JSON.stringify(args.entry)}
            args={args}
            scenario={context.parameters.libraryScenario ?? "success"}
        />
    ),
    parameters: {
        libraryScenario: "success",
        docs: {
            story: { inline: false, iframeHeight: 1050 },
            description: {
                component:
                    "Formulário completo com os campos e as regras reais do QuestLog. Envia somente campos alterados, converte horas em minutos e datas para UTC; permite remover nota, datas e plataformas. Descartar restaura a última versão salva. Salvar valida os dados e apresenta Salvo! por dois segundos após sucesso. Os estados isSaving/isDeleting pertencem ao pai. As stories simulam salvamento e exclusão em memória, com demora ou falha conforme o cenário, e registram o payload de onSave em Actions. Remover abre o ConfirmDeleteLibraryEntryModal real, incluindo bloqueio durante a operação e erro de exclusão. Nenhuma API é acessada. Editar entry nos controles reinicia o exemplo para carregar os novos valores.",
            },
        },
        controls: { include: ["entry"] },
    },
    argTypes: {
        entry: {
            control: "object",
            description:
                "Detalhes da entrada e availablePlatforms. IDs selecionados precisam pertencer às opções disponíveis.",
        },
        isSaving: {
            control: false,
            description: "Bloqueio durante o salvamento, controlado pela simulação do pai.",
        },
        isDeleting: {
            control: false,
            description:
                "Estado de remoção, controlado pela simulação e pelo modal de confirmação.",
        },
        onSave: {
            control: false,
            description:
                "Recebe as alterações e retorna a entrada atualizada. A story registra o payload e atualiza apenas seus dados em memória.",
        },
        onRemove: {
            control: false,
            description: "Solicita confirmação antes da exclusão; não remove imediatamente.",
        },
    },
} satisfies Meta<typeof LibraryGameDetailsForm>;

export default meta;
type Story = StoryObj<typeof meta>;
export const Interativo: Story = {};
export const SalvamentoDemorado: Story = {
    name: "Salvamento e remoção demorados",
    parameters: { libraryScenario: "slow" },
};
export const FalhaAoSalvar: Story = {
    name: "Falha ao salvar",
    parameters: { libraryScenario: "save-error" },
};
export const FalhaAoRemover: Story = {
    name: "Falha ao remover",
    parameters: { libraryScenario: "delete-error" },
};
export const SemDadosOpcionais: Story = {
    name: "Sem dados opcionais",
    args: {
        entry: {
            ...demoLibraryEntryDetails,
            rating: null,
            playtimeMinutes: 0,
            platforms: [],
            startedAt: null,
            completedAt: null,
            availablePlatforms: [],
        },
    },
};
