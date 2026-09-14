import { Link, useNavigate } from "react-router";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { registerSchema, type RegisterData } from "../schema/auth.schema";
import { register as signUp } from "../services/auth.service";
import { AuthLayout } from "../components/auth/AuthLayout";
import { AuthInput } from "../components/auth/AuthInput";
import { AuthButton } from "../components/auth/AuthButton";

export function Register() {
    const navigate = useNavigate();

    const {
        register,
        handleSubmit,
        setError,
        formState: {
            errors,
            isSubmitting
        }
    } = useForm<RegisterData>({ resolver: zodResolver(registerSchema) })

    async function onSubmit(data: RegisterData) {
        try {
            await signUp(data);
            navigate("/login")
        } catch (error) {
            if (error instanceof Error) {
                setError("root", {
                    message: error.message
                })
            }
        }
    }

    return (
        <AuthLayout>
            <div>
                <h1 className="font-display text-3xl font-bold text-white">Crie uma conta!</h1>
                <p className="mt-1 text-ink-dim">Comece a acompanhar seus jogos.</p>

                <form 
                    onSubmit={handleSubmit(onSubmit)}
                    className="mt-10 space-y-6"
                >
                    <AuthInput 
                        label="Nome"
                        type="text"
                        placeholder="Digite seu nome"
                        autoComplete="name"
                        registration={register("name")}
                        error={errors.name?.message}
                    />

                    <AuthInput
                        label="Email"
                        type="email"
                        placeholder="seuemail@exemplo.com"
                        autoComplete="email"
                        registration={register("email")}
                        error={errors.email?.message}
                    />

                    <AuthInput
                        label="Senha"
                        type="password"
                        placeholder="Digite sua senha"
                        autoComplete="new-password"
                        registration={register("password")}
                        error={errors.password?.message}
                    />

                    <AuthInput
                        label="Confirme sua senha"
                        type="password"
                        placeholder="Confirme sua senha"
                        autoComplete="new-password"
                        registration={register("confirmPassword")}
                        error={errors.confirmPassword?.message}
                    />

                    {errors.root && (
                        <p className="
                            rounded-lg
                            border border-danger/30
                            bg-danger/10
                            px-4 py-3
                            text-sm text-danger
                        ">{errors.root.message}</p>
                    )}

                    <AuthButton
                        isSubmitting={isSubmitting}
                        text="Cadastrar"
                        loadingText="Cadastrando..."
                    />
                </form>

                <div className="mt-8 text-center">
                    <p className="text-sm text-ink-dim">
                        Já tem uma conta?{" "}
                        <Link
                            to="/login"
                            className="font-semibold text-brand hover:underline"
                        >Entrar</Link>
                    </p>
                </div>
            </div>
        </AuthLayout>
    )
}
