import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import { normalizeGameDescription } from "../../utils/normalizeGameDescription";

type GameDetailsAboutProps = {
    description: string;
    releaseYear: string | null;
    developers: string;
};

export function GameDetailsAbout({ description, releaseYear, developers }: GameDetailsAboutProps) {
    const [showFullDescription, setShowFullDescription] = useState(false);
    const [descriptionOverflows, setDescriptionOverflows] = useState(false);
    const descriptionRef = useRef<HTMLDivElement>(null);

    const normalizedDescription = normalizeGameDescription(
        description || "Descrição não disponível."
    );

    useEffect(() => {
        if (showFullDescription) return;

        const descriptionElement = descriptionRef.current;

        if (!descriptionElement) return;

        const checkOverflow = () => {
            setDescriptionOverflows(
                descriptionElement.scrollHeight > descriptionElement.clientHeight
            );
        };

        checkOverflow();

        window.addEventListener("resize", checkOverflow);

        return () => {
            window.removeEventListener("resize", checkOverflow);
        };
    }, [description, showFullDescription]);

    return (
        <section className="py-7 lg:py-9">
            <h2
                className="
                    font-display
                    text-xl font-bold
                    text-ink
                "
            >
                Sobre
            </h2>

            <div className="mt-3 max-w-4xl">
                <div
                    ref={descriptionRef}
                    className={`
                        text-sm leading-7 text-ink-dim
                        ${showFullDescription ? "" : "line-clamp-4"}
                    `}
                >
                    <ReactMarkdown
                        components={{
                            h1: ({ children }) => (
                                <h3 className="mt-5 mb-2 font-display text-lg font-bold text-brand">
                                    {children}
                                </h3>
                            ),

                            h2: ({ children }) => (
                                <h3 className="mt-5 mb-2 font-display text-lg font-bold text-brand">
                                    {children}
                                </h3>
                            ),

                            h3: ({ children }) => (
                                <h3 className="mt-5 mb-2 font-display text-lg font-bold text-brand">
                                    {children}
                                </h3>
                            ),

                            p: ({ children }) => (
                                <p className="mb-3">
                                    {children}
                                </p>
                            ),

                            strong: ({ children }) => (
                                <strong className="font-semibold text-ink">
                                    {children}
                                </strong>
                            ),

                            ul: ({ children }) => (
                                <ul className="mb-3 list-disc pl-5">
                                    {children}
                                </ul>
                            ),

                            ol: ({ children }) => (
                                <ol className="mb-3 list-decimal pl-5">
                                    {children}
                                </ol>
                            ),

                            li: ({ children }) => (
                                <li className="mb-1">
                                    {children}
                                </li>
                            )
                        }}
                    >
                        {normalizedDescription}
                    </ReactMarkdown>
                </div>

                {descriptionOverflows && (
                    <button
                        type="button"
                        onClick={() =>
                            setShowFullDescription((prev) => !prev)
                        }
                        className="
                            mt-2
                            text-sm font-semibold
                            text-brand
                            hover:underline
                            cursor-pointer
                        "
                    >
                        {showFullDescription ? "Ver menos" : "Ver mais"}

                        <span
                            className={`
                                inline-block
                                text-[12px]
                                ml-1
                                transition-transform
                                duration-200
                                ${showFullDescription ? "rotate-180" : ""}
                            `}
                        >
                            ▼
                        </span>
                    </button>
                )}
            </div>

            <div className="mt-6 border-t border-divider" />

            <div
                className="
                    grid grid-cols-2 gap-6
                    py-5
                    lg:max-w-2xl
                "
            >
                <div>
                    <p
                        className="
                            text-[10px] font-semibold
                            uppercase tracking-widest
                            text-ink-mute
                        "
                    >
                        Ano de lançamento
                    </p>

                    <p className="mt-2 text-sm font-medium text-ink">
                        {releaseYear ?? "Não informado"}
                    </p>
                </div>

                <div>
                    <p
                        className="
                            text-[10px] font-semibold
                            uppercase tracking-widest
                            text-ink-mute
                        "
                    >
                        Desenvolvedor
                    </p>

                    <p className="mt-2 text-sm font-medium text-ink">
                        {developers}
                    </p>
                </div>
            </div>
        </section>
    );
}
