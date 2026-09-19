import type { SubmitEvent } from "react";

type SearchGamesFormProps = {
    inputValue: string;
    onInputChange: (value: string) => void;
    onSubmit: (event: SubmitEvent<HTMLFormElement>) => void;
};

export function SearchGamesForm({ inputValue, onInputChange, onSubmit, }: SearchGamesFormProps) {
    return (
        <form
            onSubmit={onSubmit}
            className="
                mt-8 flex max-w-2xl
                flex-col gap-2
                min-[400px]:flex-row
            "
        >
            <div className="relative min-w-0 flex-1">
                <span
                    className="
                        material-symbols-rounded
                        absolute left-4 top-1/2
                        -translate-y-1/2
                        text-[22px]! text-ink-mute
                    "
                >
                    search
                </span>

                <input
                    type="search"
                    aria-label="Pesquisar jogos"
                    value={inputValue}
                    onChange={(event) =>
                        onInputChange(event.target.value)
                    }
                    placeholder="Digite o nome de um jogo..."
                    className="
                        w-full rounded-2xl
                        border border-divider
                        bg-surface
                        py-4 pl-12 pr-11
                        text-sm text-ink
                        outline-none
                        transition-colors
                        placeholder:text-ink-mute
                        focus:border-brand
                        [&::-webkit-search-cancel-button]:hidden
                    "
                />

                {inputValue && (
                    <button
                        type="button"
                        aria-label="Limpar pesquisa"
                        onClick={() => onInputChange("")}
                        className="
                            absolute right-4 top-1/2
                            -translate-y-1/2
                            cursor-pointer
                            text-ink-mute
                            transition
                            hover:text-white
                        "
                    >
                        <span className="material-symbols-rounded">
                            close
                        </span>
                    </button>
                )}
            </div>

            <button
                type="submit"
                disabled={!inputValue.trim()}
                className="
                    w-full rounded-2xl
                    bg-brand
                    px-1.5 min-[480px]:px-5 py-4
                    font-semibold
                    text-white
                    transition
                    hover:bg-brand-dim
                    disabled:cursor-not-allowed
                    disabled:opacity-50
                    cursor-pointer
                    min-[400px]:w-auto
                "
            >
                Pesquisar
            </button>
        </form>
    );
}
