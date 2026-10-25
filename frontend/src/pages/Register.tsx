import { Link, useNavigate } from "react-router";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { registerSchema, type RegisterData, type RegisterFormData } from "../schema/auth.schema";
import { register as signUp } from "../services/auth.service";
import { useDocumentTitle } from "../hooks/useDocumentTitle";
import { getErrorMessage } from "../utils/getErrorMessage";

import { AuthLayout } from "../components/auth/AuthLayout";
import { AuthInput } from "../components/auth/AuthInput";
import { Button } from "../components/ui/Button";
import { Alert } from "../components/ui/Alert";
import { useRegistration } from "../contexts/RegistrationContext";
import { useCountdown } from "../hooks/useCountdown";

export function Register() {
    useDocumentTitle("Criar conta");

    const navigate = useNavigate();
    const {
        pending,
        draft,
        submittedData,
        setDraft,
        saveRegistration,
        discardPendingRegistration,
    } = useRegistration();
    const expiresIn = useCountdown(pending?.expiresAt ?? 0);

    const {
        register,
        handleSubmit,
        setError,
        getValues,
        formState: { errors, isSubmitting },
    } = useForm<RegisterFormData, unknown, RegisterData>({
        resolver: zodResolver(registerSchema),
        defaultValues: draft ?? { name: "", email: "", password: "", confirmPassword: "" },
    });

    async function onSubmit(data: RegisterData) {
        setDraft(getValues());
        const unchanged =
            submittedData &&
            submittedData.name === data.name &&
            submittedData.email === data.email &&
            submittedData.password === data.password;

        if (pending && expiresIn > 0 && unchanged) {
            navigate("/register/verify");
            return;
        }

        // Uma requisição nova pode substituir a tentativa anterior mesmo se a resposta se perder.
        discardPendingRegistration();
        try {
            const response = await signUp(data);
            saveRegistration(response, data);
            navigate("/register/verify");
        } catch (error) {
            setError("root", {
                message: getErrorMessage(
                    error,
                    "Não foi possível criar sua conta. Tente novamente.",
                ),
            });
        }
    }

    return (
        <AuthLayout>
            <div>
                <h1 className="font-display text-3xl font-bold text-white">Crie uma conta!</h1>
                <p className="mt-1 text-ink-dim">Comece a acompanhar seus jogos.</p>

                <form
                    onSubmit={handleSubmit(onSubmit)}
                    onChange={() => setDraft(getValues())}
                    className="mt-10 space-y-6"
                >
                    <AuthInput
                        label="Nome de exibição"
                        type="text"
                        placeholder="Seu nome de exibição"
                        autoComplete="nickname"
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

                    {errors.root?.message && <Alert>{errors.root.message}</Alert>}

                    <Button
                        type="submit"
                        size="lg"
                        fullWidth
                        isLoading={isSubmitting}
                        loadingText="Cadastrando..."
                    >
                        Cadastrar
                    </Button>
                </form>

                <div className="mt-8 text-center">
                    <p className="text-sm text-ink-dim">
                        Já tem uma conta?{" "}
                        <Link to="/login" className="font-semibold text-brand hover:underline">
                            Entrar
                        </Link>
                    </p>
                </div>
            </div>
        </AuthLayout>
    );
}
