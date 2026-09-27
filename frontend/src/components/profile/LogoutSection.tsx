import { Alert } from "../ui/Alert";
import { Button } from "../ui/Button";

type LogoutSectionProps = {
    isLoggingOut: boolean;
    logoutError: string;
    disabled: boolean;
    onLogout: () => void;
};

export function LogoutSection({
    isLoggingOut,
    logoutError,
    disabled,
    onLogout
}: LogoutSectionProps) {
    return (
        <section className="mt-4 rounded-2xl border border-divider bg-surface p-5">
            <div className="flex flex-col items-stretch gap-3 min-[420px]:flex-row min-[420px]:items-center min-[420px]:justify-between">
                <div className="min-w-0">
                    <h2 className="text-sm font-medium text-ink">Sair</h2>
                    <p className="mt-1 text-xs text-ink-mute">
                        Encerre sua sessão atual.
                    </p>
                </div>

                <Button
                    variant="danger"
                    size="sm"
                    onClick={onLogout}
                    disabled={disabled}
                    isLoading={isLoggingOut}
                    loadingText="Saindo..."
                    fullWidth
                    className="shrink-0 min-[420px]:w-auto"
                >
                    Sair
                </Button>
            </div>

            {logoutError && (
                <Alert className="mt-3">
                    {logoutError}
                </Alert>
            )}
        </section>
    );
}
