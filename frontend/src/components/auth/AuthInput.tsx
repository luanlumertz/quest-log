import type { HTMLInputTypeAttribute } from "react";
import type { UseFormRegisterReturn } from "react-hook-form";

type AuthInputProps = {
    label: string;
    type?: HTMLInputTypeAttribute;
    placeholder?: string;
    autoComplete?: string;
    registration: UseFormRegisterReturn;
    error?: string;
};

export function AuthInput({
    label,
    type = "text",
    placeholder,
    autoComplete,
    registration,
    error
}: AuthInputProps) {
    const id = registration.name;

    return (
        <div>
            <label
                htmlFor={id}
                className="
                    mb-2 block
                    text-xs font-semibold
                    uppercase tracking-widest
                    text-ink-mute
                "
            >
                {label}
            </label>

            <input
                id={id}
                type={type}
                placeholder={placeholder}
                autoComplete={autoComplete}
                {...registration}
                className="
                    h-12 w-full rounded-xl
                    border border-divider-bright
                    bg-surface
                    px-5
                    text-ink
                    outline-none
                    transition
                    placeholder:text-ink-dim
                    focus:border-brand
                    focus:ring-2
                    focus:ring-brand-glow
                "
            />

            {error && (
                <p className="mt-2 text-sm text-danger">
                    {error}
                </p>
            )}
        </div>
    );
}