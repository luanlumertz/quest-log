import { Link, useNavigate } from "react-router";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { loginSchema, type LoginData } from "../schema/auth.schema";
import { login } from "../services/auth.service";
import { AuthLayout } from "../components/auth/AuthLayout";
import { AuthInput } from "../components/auth/AuthInput";
import { AuthButton } from "../components/auth/AuthButton";

export function Login() {
    const navigate = useNavigate();

    const {
        register,
        handleSubmit,
        setError,
        formState: {
            errors,
            isSubmitting
        }
    } = useForm<LoginData>({ resolver: zodResolver(loginSchema) });

    async function onSubmit(data: LoginData) {
        try {
            await login(data);
            navigate("/dashboard");
        } catch (error) {
            if (error instanceof Error) {
                setError("root", {
                    message: error.message
                });
            }
        }
    }

    return (
        <AuthLayout>
            <div>
                <h1 className="font-display text-3xl font-bold text-white">Bem-vindo!</h1>
                <p className="mt-1 text-ink-dim">Acesse sua biblioteca de jogos.</p>

                <form
                    onSubmit={handleSubmit(onSubmit)}
                    className="mt-10 space-y-6"
                >
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
                        autoComplete="current-password"
                        registration={register("password")}
                        error={errors.password?.message}
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
                        text="Entrar"
                        loadingText="Entrando..."
                    />
                </form>

                <div className="mt-8 text-center">
                    <p className="text-sm text-ink-dim">
                        Não tem uma conta?{" "}
                        <Link
                            to="/register"
                            className="font-semibold text-brand hover:underline"
                        >Cadastre-se </Link>
                    </p>
                </div>
            </div>
        </AuthLayout>
    );
}
