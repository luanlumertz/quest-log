import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";
import { LibraryGameDetailsFormActions } from "../../../../src/components/library/details/LibraryGameDetailsFormActions";

const meta = {
    title: "Componentes/Biblioteca/Detalhes/LibraryGameDetailsFormActions",
    component: LibraryGameDetailsFormActions,
    args: {
        isSaving: false,
        isDeleting: false,
        isDirty: false,
        isSaved: false,
        onDiscardChanges: fn(),
        onRemove: fn(),
    },
    parameters: {
        docs: {
            description: {
                component:
                    "Ações do formulário. Salvar só fica habilitado com alterações; Descartar aparece quando isDirty=true. isSaving mostra Salvando... e bloqueia salvar, descartar e remover. isSaved troca o texto por Salvo!; o componente não controla sua duração. isDeleting afeta o botão Remover, enquanto o modal de confirmação controla o bloqueio do restante da interação durante a exclusão. Nesta demonstração isolada, Salvar não está dentro de um formulário; explore o envio real na story LibraryGameDetailsForm. Descartar e Remover registram eventos em Actions.",
            },
        },
    },
    argTypes: {
        isSaving: { control: "boolean", description: "Salvamento em andamento." },
        isDeleting: { control: "boolean", description: "Remoção em andamento." },
        isDirty: { control: "boolean", description: "Existem alterações pendentes." },
        isSaved: { control: "boolean", description: "Feedback de salvamento concluído." },
        onDiscardChanges: { control: false, description: "Solicita descarte ao formulário." },
        onRemove: { control: false, description: "Solicita abertura da confirmação de remoção." },
    },
} satisfies Meta<typeof LibraryGameDetailsFormActions>;

export default meta;
type Story = StoryObj<typeof meta>;
export const SemAlteracoes: Story = { name: "Sem alterações" };
export const AlteracoesPendentes: Story = { name: "Alterações pendentes", args: { isDirty: true } };
export const Salvando: Story = { args: { isDirty: true, isSaving: true } };
export const Salvo: Story = { args: { isSaved: true } };
export const Removendo: Story = { args: { isDeleting: true } };
