type AddGameModalHeaderProps = {
    title: string;
    coverUrl: string | null;
    isSubmitting: boolean;
    onClose: () => void;
};

export function AddGameModalHeader({
    title,
    coverUrl,
    isSubmitting,
    onClose
}: AddGameModalHeaderProps) {
    return (
        <div className="relative min-h-36 overflow-hidden border-b border-divider">
            {coverUrl && (
                <div
                    className="absolute inset-0 bg-cover bg-position-[center_25%]"
                    style={{ backgroundImage: `url("${coverUrl}")` }}
                />
            )}

            <div className="absolute inset-0 bg-black/45" />

            <div
                className="
                    absolute inset-0 bg-linear-to-r
                    from-backdrop/10 via-backdrop/35 to-backdrop/65
                "
            />

            <div className="relative z-10 flex min-h-36 items-end justify-between gap-4 px-5 py-4">
                <div className="min-w-0">
                    <p className="text-[10px] font-semibold uppercase tracking-widest text-ink-dim">
                        Adicionar à biblioteca
                    </p>

                    <h2
                        id="add-game-title"
                        className="mt-1 line-clamp-2 font-display text-lg font-bold text-white"
                    >
                        {title}
                    </h2>
                </div>

                <button
                    type="button"
                    onClick={onClose}
                    disabled={isSubmitting}
                    aria-label="Fechar"
                    className="
                        flex size-9 shrink-0 items-center justify-center
                        rounded-xl bg-white/10 text-ink-dim
                        transition-colors cursor-pointer
                        hover:bg-white/15 hover:text-white
                        disabled:cursor-not-allowed disabled:opacity-50
                    "
                >
                    <span className="material-symbols-rounded text-xl!">
                        close
                    </span>
                </button>
            </div>
        </div>
    );
}
