import type { ReactNode } from "react";
import { MaterialIcon, type MaterialIconName } from "./MaterialIcon";

type StateViewTone = "neutral" | "danger";

type StateViewProps = {
    icon: MaterialIconName;
    title: string;
    description?: ReactNode;
    action?: ReactNode;
    tone?: StateViewTone;
    className?: string;
};

export function StateView({
    icon,
    title,
    description,
    action,
    tone = "neutral",
    className = ""
}: StateViewProps) {
    const iconColor = tone === "danger" ? "text-danger" : "text-ink-mute";

    return (
        <div
            className={`
                flex min-h-80
                flex-col
                items-center justify-center
                px-4
                text-center
                ${className}
            `}
        >
            <MaterialIcon
                name={icon}
                className={`text-5xl! ${iconColor}`}
            />

            <h2
                className="
                    mt-4
                    font-display
                    text-xl
                    font-semibold
                    text-ink
                "
            >
                {title}
            </h2>

            {description && (
                <div
                    className="
                        mt-2
                        max-w-md
                        text-sm
                        leading-relaxed
                        text-ink-dim
                    "
                >
                    {description}
                </div>
            )}

            {action && (
                <div className="mt-5">
                    {action}
                </div>
            )}
        </div>
    );
}
