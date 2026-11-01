import type { Meta, StoryObj } from "@storybook/react-vite";
import type { ComponentProps } from "react";
import { fn, userEvent, within } from "storybook/test";
import { AccountInformation } from "../../../src/components/profile/AccountInformation";
import { useAuth } from "../../../src/contexts/AuthContext";
import { ProfileDemo } from "../../decorators/ProfileDemo";
import { demoProfileUser } from "../../fixtures/profile";
import { configureAccountUpdate } from "../../mocks/profileMutation";

function AccountExample(args: ComponentProps<typeof AccountInformation>) {
    const { user } = useAuth();
    return (
        <div className="w-full max-w-142.5">
            <AccountInformation {...args} user={user ?? args.user} />
        </div>
    );
}

const meta = {
    title: "Componentes/Perfil/AccountInformation",
    component: AccountInformation,
    beforeEach: () => configureAccountUpdate(),
    render: (args) => (
        <ProfileDemo key={JSON.stringify(args.user)} initialUser={args.user}>
            <AccountExample {...args} />
        </ProfileDemo>
    ),
    args: { user: demoProfileUser, disabled: false, onUpdatingChange: fn() },
    parameters: {
        docs: {
            story: { inline: false, iframeHeight: 520 },
            description: {
                component:
                    "Informações da conta com edição do nome de exibição; e-mail é somente leitura. Editar abre o formulário e foca o campo. Usa updateSchema, valida durante a edição e só permite salvar um nome válido que tenha mudado após normalizar espaços. Ao sair do campo, remove espaços excedentes sem alterar maiúsculas e minúsculas. Cancelar descarta a edição. Durante o salvamento, bloqueia campo e ações; onUpdatingChange informa o início e o fim ao pai. Sucesso fecha a edição, atualiza o usuário e mostra SuccessAlert por três segundos; falha preserva o texto e permite tentar novamente. Aqui, o hook real atualiza uma sessão fictícia e o serviço é simulado, sem API. Alterar user nos controles reinicia o exemplo, incluindo o serviço em memória. Os exemplos usam QueryClient e iframe próprios.",
            },
        },
    },
    argTypes: {
        user: {
            control: "object",
            description:
                "Usuário fictício com id, name e email. O nome salvo volta para a sessão da demonstração.",
        },
        disabled: {
            control: "boolean",
            description:
                "Bloqueio externo, usado quando outra operação do perfil está em andamento.",
        },
        onUpdatingChange: {
            control: false,
            description:
                "Recebe true ao iniciar e false ao concluir o salvamento; registrado em Actions.",
        },
    },
} satisfies Meta<typeof AccountInformation>;

export default meta;
type Story = StoryObj<typeof meta>;
export const Visualizacao: Story = { name: "Visualização e edição" };
export const Editando: Story = {
    play: async ({ canvasElement }) => {
        await userEvent.click(within(canvasElement).getByRole("button", { name: "Editar" }));
    },
};
export const NomeInvalido: Story = {
    name: "Nome inválido",
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        await userEvent.click(canvas.getByRole("button", { name: "Editar" }));
        await userEvent.clear(canvas.getByRole("textbox", { name: "Nome de exibição" }));
        await userEvent.type(canvas.getByRole("textbox", { name: "Nome de exibição" }), "A");
    },
};
export const SalvamentoDemorado: Story = {
    name: "Salvamento demorado",
    beforeEach: () => configureAccountUpdate("slow"),
};
export const FalhaAoSalvar: Story = {
    name: "Falha ao salvar",
    beforeEach: () => configureAccountUpdate("error"),
};
export const Desabilitado: Story = { args: { disabled: true } };
