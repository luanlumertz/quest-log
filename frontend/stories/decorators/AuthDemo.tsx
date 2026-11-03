import { useState } from "react";
import { useForm } from "react-hook-form";
import { AuthInput } from "../../src/components/auth/AuthInput";
import { Button } from "../../src/components/ui/Button";

export function AuthDemoContent({ long = false }: { long?: boolean }) {
    const [activated, setActivated] = useState(false);
    const { register } = useForm({ defaultValues: { demoEmail: "jogador@exemplo.com" } });
    return (
        <div className="mt-8 space-y-5">
            <AuthInput
                label="E-mail"
                type="email"
                autoComplete="email"
                registration={register("demoEmail")}
            />
            {long &&
                Array.from({ length: 8 }, (_, index) => (
                    <p key={index} className="text-sm leading-relaxed text-ink-dim">
                        Seção {index + 1}: conteúdo ilustrativo para conferir a rolagem e o
                        posicionamento do painel de marca quando a área do formulário cresce.
                    </p>
                ))}
            <Button fullWidth onClick={() => setActivated(true)}>
                Experimentar ação
            </Button>
            {activated && (
                <p role="status" className="text-sm text-ink-dim">
                    Ação local da demonstração. Nenhum dado foi enviado.
                </p>
            )}
        </div>
    );
}
