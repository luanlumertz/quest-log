type LoadingStateProps = {
    label?: string;
    className?: string;
};

export function LoadingState({ label = "Carregando...", className = "" }: LoadingStateProps) {
    return (
        <div
            role="status"
            aria-live="polite"
            className={`
                flex min-h-80
                flex-col
                items-center justify-center
                gap-3
                ${className}
            `}
        >
            <span
                aria-hidden="true"
                className="
                    size-7
                    animate-spin
                    rounded-full
                    border-2
                    border-divider-bright
                    border-t-brand
                "
            />

            <span className="text-sm text-ink-mute">
                {label}
            </span>
        </div>
    );
}
