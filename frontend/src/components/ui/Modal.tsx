import { useEffect, useRef, type ReactNode } from "react";

type ModalProps = {
    children: ReactNode;
    onClose: () => void;
    ariaLabelledBy: string;
    ariaDescribedBy?: string;
    preventClose?: boolean;
};

const FOCUSABLE_SELECTOR = [
    "a[href]",
    "button:not([disabled])",
    "input:not([disabled])",
    "select:not([disabled])",
    "textarea:not([disabled])",
    '[tabindex]:not([tabindex="-1"])'
].join(",");

function getFocusableElements(container: HTMLElement) {
    return Array.from(
        container.querySelectorAll<HTMLElement>(
            FOCUSABLE_SELECTOR
        )
    );
}

export function Modal({
    children,
    onClose,
    ariaLabelledBy,
    ariaDescribedBy,
    preventClose = false
}: ModalProps) {
    const dialogRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const previousOverflow = document.body.style.overflow;

        const previouslyFocusedElement = document.activeElement instanceof HTMLElement
            ? document.activeElement
            : null;

        document.body.style.overflow = "hidden";

        const frameId = window.requestAnimationFrame(() => {
            const dialog = dialogRef.current;

            if (!dialog) return;

            const [firstFocusableElement] = getFocusableElements(dialog);

            (firstFocusableElement ?? dialog).focus();
        });

        return () => {
            window.cancelAnimationFrame(frameId);

            document.body.style.overflow = previousOverflow;

            previouslyFocusedElement?.focus();
        };
    }, []);

    useEffect(() => {
        function handleKeyDown(event: KeyboardEvent) {
            const dialog = dialogRef.current;

            if (!dialog) return;

            if (event.key === "Escape") {
                if (preventClose) return;

                event.preventDefault();
                onClose();

                return;
            }

            if (event.key !== "Tab") return;

            const focusableElements = getFocusableElements(dialog);

            if (focusableElements.length === 0) {
                event.preventDefault();
                dialog.focus();

                return;
            }

            const firstElement = focusableElements[0];

            const lastElement = focusableElements[focusableElements.length - 1];

            const activeElement = document.activeElement;

            if (event.shiftKey && (activeElement === firstElement || activeElement === dialog)) {
                event.preventDefault();
                lastElement.focus();

                return;
            }

            if (!event.shiftKey && activeElement === lastElement) {
                event.preventDefault();
                firstElement.focus();

                return;
            }

            if (activeElement && !dialog.contains(activeElement)) {
                event.preventDefault();
                firstElement.focus();
            }
        }

        window.addEventListener("keydown", handleKeyDown);

        return () => {
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, [onClose, preventClose]);

    return (
        <div
            className="
                fixed inset-0 z-50
                flex items-center justify-center
                bg-black/75
                p-4
                backdrop-blur-sm
            "
            onMouseDown={(event) => {
                if (event.target === event.currentTarget && !preventClose) {
                    onClose();
                }
            }}
        >
            <div
                ref={dialogRef}
                role="dialog"
                aria-modal="true"
                aria-labelledby={ariaLabelledBy}
                aria-describedby={ariaDescribedBy}
                tabIndex={-1}
                className="
                    max-h-[calc(100dvh-2rem)]
                    w-full
                    max-w-md
                    overflow-y-auto
                    rounded-2xl
                    border border-divider-bright
                    bg-surface
                    shadow-2xl
                    outline-none
                "
            >
                {children}
            </div>
        </div>
    );
}
