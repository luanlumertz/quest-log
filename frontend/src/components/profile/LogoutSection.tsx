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

                <button
                    type="button"
                    onClick={onLogout}
                    disabled={isLoggingOut || disabled}
                    className="
                        min-h-10 w-full shrink-0 min-[420px]:w-auto
                        cursor-pointer rounded-xl border border-divider-bright
                        px-4 text-xs font-semibold text-danger transition-colors
                        hover:bg-danger/10 disabled:cursor-not-allowed
                        disabled:opacity-50
                    "
                >
                    {isLoggingOut ? "Saindo..." : "Sair"}
                </button>
            </div>

            {logoutError && (
                <p role="alert" className="mt-3 text-xs text-danger">
                    {logoutError}
                </p>
            )}
        </section>
    );
}
