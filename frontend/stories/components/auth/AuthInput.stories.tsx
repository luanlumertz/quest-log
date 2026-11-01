import type { Meta, StoryObj } from "@storybook/react-vite";
import type { ComponentProps } from "react";
import { useForm } from "react-hook-form";
import { AuthInput } from "../../../src/components/auth/AuthInput";

type InputArgs = Omit<ComponentProps<typeof AuthInput>, "registration"> & { initialValue: string };

function InputExample({ initialValue, ...args }: InputArgs) {
    const { register } = useForm({ defaultValues: { example: initialValue } });
    return (
        <div className="max-w-md">
            <AuthInput {...args} registration={register("example")} />
        </div>
    );
}

const meta = {
    title: "Componentes/Autenticação/AuthInput",
    component: AuthInput,
    args: {
        label: "Nome de exibição",
        type: "text",
        placeholder: "Como você quer ser chamado?",
        initialValue: "",
    },
    render: (args) => <InputExample key={`${args.type}-${args.initialValue}`} {...args} />,
    parameters: {
        docs: {
            story: { inline: false, iframeHeight: 200 },
            description: {
                component:
                    "Campo usado nos formulários de autenticação e perfil. Recebe registration do React Hook Form, que fornece name, ref e eventos; name também define o ID do input e a associação com label e erro. Quando type=password, permite mostrar e ocultar o conteúdo sem alterar o valor. error é informado pelo pai: o componente não valida regras de negócio. inputMode sugere o teclado e maxLength limita a digitação, sem garantir que o conteúdo seja numérico. O exemplo usa useForm real, sem envio. initialValue pertence apenas à demonstração; alterá-lo reinicia o campo. Cada exemplo fica em um iframe para isolar os IDs.",
            },
        },
    },
    argTypes: {
        label: { control: "text", description: "Rótulo visível e nome acessível do campo." },
        type: {
            control: "select",
            options: ["text", "email", "password"],
            description: "Tipo nativo. password habilita o botão de visibilidade.",
        },
        placeholder: { control: "text", description: "Exemplo de preenchimento." },
        autoComplete: { control: "text", description: "Sugestão de preenchimento do navegador." },
        error: {
            control: "text",
            description: "Mensagem do pai, associada por aria-describedby e aria-invalid.",
        },
        inputMode: {
            control: "select",
            options: ["text", "email", "numeric", "decimal"],
            description: "Sugere o teclado virtual; não valida o conteúdo.",
        },
        maxLength: {
            control: { type: "number", min: 1, step: 1 },
            description: "Limite nativo de caracteres digitados.",
        },
        initialValue: {
            control: "text",
            description: "Valor inicial da story. Não é uma propriedade de AuthInput.",
        },
        registration: {
            control: false,
            description: "Resultado de register(name), criado pelo useForm da demonstração.",
        },
        inputClassName: { table: { disable: true } },
    },
} satisfies Meta<ComponentProps<typeof AuthInput> & { initialValue: string }>;

export default meta;
// registration é fornecido pelo formulário do exemplo, não pelas args da story.
type Story = StoryObj<InputArgs>;
export const Texto: Story = {};
export const Email: Story = {
    args: {
        label: "E-mail",
        type: "email",
        placeholder: "voce@exemplo.com",
        autoComplete: "email",
        initialValue: "jogador@exemplo.com",
    },
};
export const Senha: Story = {
    args: {
        label: "Senha",
        type: "password",
        autoComplete: "current-password",
        initialValue: "Demonstracao123!",
    },
};
export const ComErro: Story = {
    name: "Com erro",
    args: {
        label: "E-mail",
        type: "email",
        initialValue: "email-invalido",
        error: "Email inválido",
    },
};
export const Codigo: Story = {
    name: "Código de seis caracteres",
    args: {
        label: "Código de verificação",
        placeholder: "000000",
        inputMode: "numeric",
        autoComplete: "one-time-code",
        maxLength: 6,
        inputClassName: "text-center font-mono text-2xl tracking-[0.35em]",
    },
};
