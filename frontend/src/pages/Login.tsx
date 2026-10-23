import { Link, useLocation, useNavigate } from "react-router";
import { useEffect, useState } from "react";

import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { loginSchema, type LoginData } from "../schema/auth.schema";
import { login } from "../services/auth.service";
import { useDocumentTitle } from "../hooks/useDocumentTitle";
import { getErrorMessage } from "../utils/getErrorMessage";

import { AuthLayout } from "../components/auth/AuthLayout";
import { AuthInput } from "../components/auth/AuthInput";
import { useAuth } from "../contexts/AuthContext";
import { Button } from "../components/ui/Button";
import { Alert } from "../components/ui/Alert";
import { SuccessAlert } from "../components/ui/SuccessAlert";
import { readPasswordChangeNotice, clearPasswordChangeNotice } from "../lib/passwordChangeNotice";

export function Login() {
    useDocumentTitle("Entrar");

    const navigate = useNavigate();
    const location = useLocation();
    const [passwordNotice] = useState(readPasswordChangeNotice);
    const passwordChanged = location.state?.passwordChanged === true || !!passwordNotice;
    const [showSuccess, setShowSuccess] = useState(
        () => location.state?.registrationSuccess === true || passwordChanged,
    );

    const { setUser } = useAuth();

    const {
        register,
        handleSubmit,
        setError,
        control,
        formState: { errors, isSubmitting },
    } = useForm<LoginData>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            email:
                typeof location.state?.email === "string"
                    ? location.state.email
                    : (passwordNotice?.email ?? ""),
            password: "",
        },
    });
    const email = useWatch({ control, name: "email" });

    useEffect(() => {
        clearPasswordChangeNotice();
    }, []);

    async function onSubmit(data: LoginData) {
        try {
            const user = await login(data);

            setUser(user);

            navigate("/dashboard");
        } catch (error) {
            setError("root", {
                message: getErrorMessage(error, "Não foi possível entrar. Tente novamente."),
            });
        }
    }

    return (
        <AuthLayout>
            <div>
                <h1 className="font-display text-3xl font-bold text-white">Bem-vindo!</h1>
                <p className="mt-1 text-ink-dim">Acesse sua biblioteca de jogos.</p>

                <SuccessAlert
                    visible={showSuccess}
                    onVisibleChange={setShowSuccess}
                    className="mt-6"
                >
                    {passwordChanged
                        ? "Senha alterada com sucesso! Entre com sua nova senha."
                        : "E-mail confirmado! Sua conta foi criada. Entre para começar."}
                </SuccessAlert>

                <form onSubmit={handleSubmit(onSubmit)} className="mt-10 space-y-6">
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

                    {errors.root?.message && <Alert>{errors.root.message}</Alert>}

                    <div className="-mt-2 text-right">
                        <Link
                            to="/forgot-password"
                            state={{ email }}
                            className="text-sm font-semibold text-brand hover:underline"
                        >
                            Esqueceu sua senha?
                        </Link>
                    </div>

                    <Button
                        type="submit"
                        size="lg"
                        fullWidth
                        isLoading={isSubmitting}
                        loadingText="Entrando..."
                    >
                        Entrar
                    </Button>
                </form>

                <div className="mt-8 text-center">
                    <p className="text-sm text-ink-dim">
                        Não tem uma conta?{" "}
                        <Link to="/register" className="font-semibold text-brand hover:underline">
                            Cadastre-se{" "}
                        </Link>
                    </p>
                </div>
            </div>
        </AuthLayout>
    );
}
