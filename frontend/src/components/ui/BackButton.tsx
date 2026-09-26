type BackButtonProps = {
    children: React.ReactNode;
    onClick: () => void;
};

export function BackButton({ children, onClick }: BackButtonProps) {
    return (
        <button
            type="button"
            onClick={onClick}
            className="
                group
                -ml-2
                inline-flex
                cursor-pointer
                items-center
                gap-1.5
                rounded-lg
                px-2 py-1.5
                text-sm
                text-ink-dim
                transition-colors
                hover:bg-white/5
                hover:text-ink
                focus-visible:outline-2
                focus-visible:outline-brand
            "
        >
            <span
                className="
                    material-symbols-rounded
                    text-lg!
                    transition-transform
                    group-hover:-translate-x-0.5
                "
            >
                arrow_back
            </span>

            {children}
        </button>
    );
}
