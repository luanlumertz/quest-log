import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn, userEvent, within } from "storybook/test";
import { ChangePasswordSection } from "../../../src/components/profile/ChangePasswordSection";
import { ProfileDemo } from "../../decorators/ProfileDemo";
import { DemoLocation } from "../../decorators/GameDemo";
import { demoProfileUser } from "../../fixtures/profile";
import { configurePasswordChange } from "../../mocks/profileMutation";

const meta = {
    title: "Componentes/Perfil/ChangePasswordSection",
    component: ChangePasswordSection,
    decorators: [
        (Story) => (
            <ProfileDemo>
                <div className="w-full max-w-142.5">
                    <Story />
                    <DemoLocation />
                </div>
            </ProfileDemo>
        ),
    ],
    beforeEach: () => configurePasswordChange(),
    args: { email: demoProfileUser.email, disabled: false, onChangingChange: fn() },
    parameters: {
        docs: {
            story: { inline: false, iframeHeight: 900 },
            description: {
                component:
                    "Seção de segurança que abre um formulário com senha atual, nova senha e confirmação. Usa changePasswordSchema real, incluindo igualdade da confirmação e a exigência de que a nova senha seja diferente da atual. Cancelar limpa e fecha o formulário. Durante o envio, bloqueia campos, ações e o link de recuperação; onChangingChange informa o início e o fim ao pai. Sucesso fecha o formulário, limpa os valores e mostra SuccessAlert por três segundos. A sessão atual permanece conectada; a mensagem sobre encerrar outras sessões corresponde ao comportamento da API real, não executado pelo catálogo. Erros 422 aparecem na nova senha, e os demais erros ficam no aviso geral. Esqueci minha senha atual navega em memória para /forgot-password com o e-mail em state. Os serviços são simulados: use quaisquer senhas fictícias aceitas pelo schema. Os cenários de erro rejeitam o envio mesmo com dados válidos. Nenhuma senha ou sessão real é alterada. Cada exemplo fica em um iframe para isolar IDs e estado.",
            },
        },
    },
    argTypes: {
        email: {
            control: "text",
            description:
                "E-mail encaminhado no state do link de recuperação; não é editável nesta seção.",
        },
        disabled: {
            control: "boolean",
            description: "Bloqueio externo por outra operação no perfil.",
        },
        onChangingChange: {
            control: false,
            description: "Recebe true/false durante o envio e registra os eventos em Actions.",
        },
    },
} satisfies Meta<typeof ChangePasswordSection>;

export default meta;
type Story = StoryObj<typeof meta>;
export const Interativo: Story = {};
export const FormularioAberto: Story = {
    name: "Formulário aberto",
    play: async ({ canvasElement }) => {
        await userEvent.click(within(canvasElement).getByRole("button", { name: "Alterar senha" }));
    },
};
export const NovaSenhaIgualAtual: Story = {
    name: "Nova senha igual à atual",
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        await userEvent.click(canvas.getByRole("button", { name: "Alterar senha" }));
        for (const label of ["Senha atual", "Nova senha", "Confirme a nova senha"]) {
            await userEvent.type(canvas.getByLabelText(label, { exact: true }), "Demonstracao123!");
        }
        await userEvent.click(canvas.getByRole("button", { name: "Salvar nova senha" }));
    },
};
export const EnvioDemorado: Story = {
    name: "Envio demorado",
    beforeEach: () => configurePasswordChange("slow"),
};
export const SenhaAtualIncorreta: Story = {
    name: "Senha atual incorreta",
    beforeEach: () => configurePasswordChange("current-password-error"),
};
export const NovaSenhaRejeitada: Story = {
    name: "Nova senha rejeitada pelo serviço (422)",
    beforeEach: () => configurePasswordChange("rejected-password"),
};
export const Desabilitado: Story = { args: { disabled: true } };
