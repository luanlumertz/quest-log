import { Link, useLocation, useNavigate } from "react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AuthStepLayout } from "../components/auth/AuthStepLayout";
import { AuthInput } from "../components/auth/AuthInput";
import { Alert } from "../components/ui/Alert";
import { Button } from "../components/ui/Button";
import { useAuth } from "../contexts/AuthContext";
import { usePasswordRecovery } from "../contexts/PasswordRecoveryContext";
import { useDocumentTitle } from "../hooks/useDocumentTitle";
import { forgotPasswordSchema, type ForgotPasswordData } from "../schema/auth.schema";
import { requestPasswordRecovery } from "../services/auth.service";
import { getErrorMessage } from "../utils/getErrorMessage";

export function ForgotPassword() {
    useDocumentTitle("Recuperar senha");
    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useAuth();
    const { recovery, saveRecovery, discardAuthorization } = usePasswordRecovery();
    const {
        register,
        handleSubmit,
        setError,
        formState: { errors, isSubmitting },
    } = useForm<ForgotPasswordData>({
        resolver: zodResolver(forgotPasswordSchema),
        defaultValues: {
            email:
                typeof location.state?.email === "string"
                    ? location.state.email
                    : (recovery?.email ?? user?.email ?? ""),
        },
    });
    const returnTo = user ? "/profile" : "/login";

    async function onSubmit(data: ForgotPasswordData) {
        discardAuthorization();
        try {
            await requestPasswordRecovery(data);
            saveRecovery(data.email);
            navigate("/forgot-password/verify");
        } catch (error) {
            setError("root", {
                message: getErrorMessage(
                    error,
                    "Não foi possível solicitar o código. Tente novamente.",
                ),
            });
        }
    }

    return (
        <AuthStepLayout
            title="Esqueceu sua senha?"
            onBack={() => navigate(returnTo)}
            description={<p>Informe o e-mail da sua conta para recuperar o acesso ao QuestLog.</p>}
        >
            <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-6" noValidate>
                <fieldset disabled={isSubmitting} className="min-w-0">
                    <AuthInput
                        label="Email"
                        type="email"
                        placeholder="seuemail@exemplo.com"
                        autoComplete="email"
                        registration={register("email")}
                        error={errors.email?.message}
                    />
                </fieldset>
                <p className="text-sm leading-relaxed text-ink-dim">
                    Se houver uma conta com este e-mail, enviaremos um código de seis dígitos.
                </p>
                {errors.root?.message && <Alert>{errors.root.message}</Alert>}
                <Button
                    type="submit"
                    size="lg"
                    fullWidth
                    isLoading={isSubmitting}
                    loadingText="Solicitando..."
                >
                    Enviar código
                </Button>
            </form>
            <p className="mt-8 text-center text-sm text-ink-dim">
                <Link to={returnTo} className="font-semibold text-brand hover:underline">
                    {user ? "Voltar ao perfil" : "Voltar para o login"}
                </Link>
            </p>
        </AuthStepLayout>
    );
}
