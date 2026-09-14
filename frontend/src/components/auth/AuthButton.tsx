type AuthButtonProps = {
    isSubmitting: boolean;
    text: string;
    loadingText: string;
};

export function AuthButton({
    isSubmitting,
    text,
    loadingText
}: AuthButtonProps) {
    return (
        <button
            type="submit"
            disabled={isSubmitting}
            className="
                w-full rounded-xl
                bg-brand
                px-5 py-4
                font-display
                text-lg font-bold
                text-white
                transition
                hover:bg-brand-dim
                disabled:cursor-not-allowed
                disabled:opacity-60
                cursor-pointer
            "
        >
            {isSubmitting ? loadingText : text}
        </button>
    );
}