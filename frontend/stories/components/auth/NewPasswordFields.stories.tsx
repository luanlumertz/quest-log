import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState, type ComponentProps } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { userEvent, within } from "storybook/test";
import { NewPasswordFields } from "../../../src/components/auth/NewPasswordFields";
import { Button } from "../../../src/components/ui/Button";
import {
    resetPasswordSchema,
    type ResetPasswordFormData,
    type ResetPasswordData,
} from "../../../src/schema/auth.schema";

type PasswordArgs = Omit<
    ComponentProps<typeof NewPasswordFields>,
    "passwordRegistration" | "confirmationRegistration"
> & {
    initialPassword: string;
    initialConfirmation: string;
};

function PasswordExample({ initialPassword, initialConfirmation, ...args }: PasswordArgs) {
    const [validated, setValidated] = useState(false);
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<ResetPasswordFormData, unknown, ResetPasswordData>({
        resolver: zodResolver(resetPasswordSchema),
        defaultValues: { password: initialPassword, confirmPassword: initialConfirmation },
    });
    return (
        <form
            className="max-w-md space-y-5"
            noValidate
            onChangeCapture={() => setValidated(false)}
            onSubmit={handleSubmit(() => setValidated(true))}
        >
            <NewPasswordFields
                {...args}
                passwordRegistration={register("password")}
                confirmationRegistration={register("confirmPassword")}
                passwordError={args.passwordError ?? errors.password?.message}
                confirmationError={args.confirmationError ?? errors.confirmPassword?.message}
            />
            <Button type="submit">Validar nova senha</Button>
            {validated && (
                <p role="status" className="text-sm text-emerald-400">
                    Dados válidos na demonstração. Nenhuma senha foi alterada.
                </p>
            )}
        </form>
    );
}

const meta = {
    title: "Componentes/Autenticação/NewPasswordFields",
    component: NewPasswordFields,
    args: { initialPassword: "", initialConfirmation: "" },
    render: (args) => (
        <PasswordExample key={`${args.initialPassword}-${args.initialConfirmation}`} {...args} />
    ),
    parameters: {
        docs: {
            story: { inline: false, iframeHeight: 420 },
            description: {
                component:
                    "Par de campos Nova senha e Confirme a nova senha, cada um com seu controle de visibilidade. O componente recebe os registros do React Hook Form e as mensagens de erro; não compara nem salva senhas por conta própria. A demonstração envolve os campos em um formulário real com resetPasswordSchema: valida tamanho, limite de bytes, espaços e igualdade das senhas. Validar nova senha mostra apenas uma confirmação local; não envia nem registra as senhas em Actions. Os exemplos com erro executam a validação ao abrir e podem ser corrigidos normalmente. Erros definidos pelos controles têm prioridade e permanecem fixos até serem removidos. Editar os valores iniciais reinicia a demonstração. Cada exemplo usa iframe próprio para isolar os IDs.",
            },
        },
    },
    argTypes: {
        passwordRegistration: {
            control: false,
            description: "register do campo de nova senha, criado pelo formulário da story.",
        },
        confirmationRegistration: {
            control: false,
            description: "register do campo de confirmação.",
        },
        passwordError: {
            control: "text",
            description: "Erro fixo opcional para a nova senha; sem ele, usa a validação real.",
        },
        confirmationError: {
            control: "text",
            description: "Erro fixo opcional para a confirmação.",
        },
        initialPassword: {
            control: "text",
            description: "Senha inicial apenas do exemplo. Use dados fictícios.",
        },
        initialConfirmation: {
            control: "text",
            description: "Confirmação inicial apenas do exemplo.",
        },
    },
} satisfies Meta<
    ComponentProps<typeof NewPasswordFields> & {
        initialPassword: string;
        initialConfirmation: string;
    }
>;

export default meta;
type Story = StoryObj<PasswordArgs>;
export const Vazios: Story = {};
export const Preenchidos: Story = {
    args: { initialPassword: "Demonstracao123!", initialConfirmation: "Demonstracao123!" },
};
export const SenhaInvalida: Story = {
    name: "Senha inválida",
    args: { initialPassword: "curta", initialConfirmation: "curta" },
    play: async ({ canvasElement }) => {
        await userEvent.click(
            within(canvasElement).getByRole("button", { name: "Validar nova senha" }),
        );
    },
};
export const ConfirmacaoDiferente: Story = {
    name: "Confirmação diferente",
    args: { initialPassword: "Demonstracao123!", initialConfirmation: "OutraSenha123!" },
    play: async ({ canvasElement }) => {
        await userEvent.click(
            within(canvasElement).getByRole("button", { name: "Validar nova senha" }),
        );
    },
};
