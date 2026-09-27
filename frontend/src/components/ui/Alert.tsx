import type { ReactNode } from "react";
import { MaterialIcon, type MaterialIconName } from "./MaterialIcon";

type AlertVariant = "error" | "success";

type AlertProps = {
    children: ReactNode;
    variant?: AlertVariant;
    className?: string;
};

const variantConfig: Record<
    AlertVariant,
    {
        icon: MaterialIconName;
        classes: string;
    }
> = {
    error: {
        icon: "error",
        classes: `
            border-danger/30
            bg-danger/10
            text-danger
        `
    },

    success: {
        icon: "check_circle",
        classes: `
            border-emerald-500/20
            bg-emerald-500/10
            text-emerald-400
        `
    }
};

export function Alert({ children, variant = "error", className = "" }: AlertProps) {
    const config = variantConfig[variant];

    return (
        <div
            role={variant === "error" ? "alert" : "status"}
            className={`
                flex items-start
                gap-2
                rounded-xl
                border
                px-4 py-3
                text-sm
                ${config.classes}
                ${className}
            `}
        >

            <MaterialIcon
                name={config.icon}
                className="mt-px shrink-0 text-[18px]! leading-none"
            />

            <div className="min-w-0">
                {children}
            </div>
        </div>
    );
}
