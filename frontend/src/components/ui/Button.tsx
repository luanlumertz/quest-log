import type { ButtonHTMLAttributes, ComponentProps, ReactNode } from "react";
import { Link } from "react-router";

export type ButtonVariant =
    | "primary"
    | "secondary"
    | "danger";

export type ButtonSize =
    | "sm"
    | "md"
    | "lg";

type ButtonStyleProps = {
    variant?: ButtonVariant;
    size?: ButtonSize;
    fullWidth?: boolean;
    className?: string;
    children: ReactNode;
};

type ButtonProps =
    Omit<
        ButtonHTMLAttributes<HTMLButtonElement>,
        "className" | "children"
    >
    & ButtonStyleProps
    & {
        isLoading?: boolean;
        loadingText?: string;
    };

type ButtonLinkProps =
    Omit<
        ComponentProps<typeof Link>,
        "className" | "children"
    >
    & ButtonStyleProps;

const variantClasses: Record<ButtonVariant, string> = {
    primary: `
        bg-brand-gradient
        text-white
        hover:brightness-110
        focus-visible:outline-brand
    `,

    secondary: `
        border border-divider-bright
        text-ink-dim
        hover:bg-surface-hover
        hover:text-ink
        focus-visible:outline-brand
    `,

    danger: `
        border border-danger/30
        bg-danger/10
        text-danger
        hover:bg-danger/20
        focus-visible:outline-danger
    `
};

const sizeClasses: Record<ButtonSize, string> = {
    sm: `
        min-h-9
        px-4
        text-xs
        font-semibold
    `,

    md: `
        min-h-11
        px-5
        text-sm
        font-semibold
    `,

    lg: `
        min-h-14
        px-5
        text-lg
        font-display
        font-bold
    `
};

function getButtonClassName({
    variant,
    size,
    fullWidth,
    className
}: {
    variant: ButtonVariant;
    size: ButtonSize;
    fullWidth: boolean;
    className: string;
}) {
    return `
        inline-flex
        items-center justify-center
        gap-2
        rounded-xl
        cursor-pointer
        transition-[color,background-color,border-color,filter]
        focus-visible:outline-2
        focus-visible:outline-offset-2
        disabled:cursor-not-allowed
        disabled:opacity-50
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${fullWidth ? "w-full" : ""}
        ${className}
    `;
}

export function Button({
    variant = "primary",
    size = "md",
    fullWidth = false,
    isLoading = false,
    loadingText,
    className = "",
    children,
    disabled,
    type = "button",
    ...props
}: ButtonProps) {
    return (
        <button
            {...props}
            type={type}
            disabled={disabled || isLoading}
            aria-busy={isLoading || undefined}
            className={getButtonClassName({
                variant,
                size,
                fullWidth,
                className
            })}
        >
            {isLoading && loadingText
                ? loadingText
                : children}
        </button>
    );
}

export function ButtonLink({
    variant = "primary",
    size = "md",
    fullWidth = false,
    className = "",
    children,
    ...props
}: ButtonLinkProps) {
    return (
        <Link
            {...props}
            className={getButtonClassName({
                variant,
                size,
                fullWidth,
                className
            })}
        >
            {children}
        </Link>
    );
}
