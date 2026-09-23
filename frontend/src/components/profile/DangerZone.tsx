type DangerZoneProps = {
    disabled: boolean;
    onDelete: () => void;
};

export function DangerZone({ disabled, onDelete }: DangerZoneProps) {
    return (
        <section className="mt-5 rounded-2xl border border-danger/30 bg-surface p-5">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-danger">
                Zona de perigo
            </h2>

            <div className="mt-5 flex flex-col items-stretch gap-3 min-[420px]:flex-row min-[420px]:items-center min-[420px]:justify-between">
                <div className="min-w-0">
                    <h3 className="text-sm font-medium text-ink">
                        Excluir conta
                    </h3>
                    <p className="mt-1 text-xs leading-relaxed text-ink-mute">
                        Exclua permanentemente sua conta e todos os dados.
                    </p>
                </div>

                <button
                    type="button"
                    onClick={onDelete}
                    disabled={disabled}
                    className="
                        min-h-10 w-full shrink-0 min-[420px]:w-auto
                        cursor-pointer rounded-xl border border-danger/30
                        bg-danger/10 px-4 text-xs font-semibold text-red-400
                        transition-colors hover:bg-danger/20
                        disabled:cursor-not-allowed disabled:opacity-50
                    "
                >
                    Excluir conta
                </button>
            </div>
        </section>
    );
}
