import { useState } from "react";
import type { HTMLInputTypeAttribute } from "react";
import type { UseFormRegisterReturn } from "react-hook-form";
import { MaterialIcon } from "../ui/MaterialIcon";

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
    const isPassword = type === "password";

    const [showPassword, setShowPassword] = useState(false);

    const inputType = isPassword && showPassword ? "text" : type;

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

            <div className="relative">
                <input
                    id={id}
                    type={inputType}
                    placeholder={placeholder}
                    autoComplete={autoComplete}
                    {...registration}
                    className={`
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
                        ${isPassword ? "pr-12" : ""}
                    `}
                />

                {isPassword && (
                    <button
                        type="button"
                        onClick={() => setShowPassword((current) => !current)}
                        aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                        className="
                            absolute
                            inset-y-0 right-3
                            flex w-8
                            items-center justify-center
                          text-ink-mute
                            transition-colors
                          hover:text-ink
                            focus-visible:outline-2
                          focus-visible:outline-brand
                          cursor-pointer
                        "
                    >
                        <MaterialIcon
                            name={showPassword ? "visibility_off" : "visibility"}
                            className="text-[20px] leading-none"
                        />
                    </button>
                )}
            </div>

            {error && (
                <p className="mt-2 text-sm text-danger">
                    {error}
                </p>
            )}
        </div>
    );
}
