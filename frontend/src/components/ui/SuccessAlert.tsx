import { useEffect, type ReactNode } from "react";
import { Alert } from "./Alert";

type SuccessAlertProps = {
    visible: boolean;
    onVisibleChange: (visible: boolean) => void;
    children: ReactNode;
    className?: string;
};

export function SuccessAlert({
    visible,
    onVisibleChange,
    children,
    className = "",
}: SuccessAlertProps) {
    useEffect(() => {
        if (!visible) return;

        const timeout = window.setTimeout(() => onVisibleChange(false), 3000);
        return () => window.clearTimeout(timeout);
    }, [visible, onVisibleChange]);

    return (
        <div
            aria-hidden={!visible}
            className={`
                grid transition-[grid-template-rows,opacity,transform]
                duration-300 ease-in-out motion-reduce:transition-none
                ${
                    visible
                        ? "grid-rows-[1fr] translate-y-0 opacity-100"
                        : "pointer-events-none grid-rows-[0fr] -translate-y-1 opacity-0"
                }
            `}
        >
            <div className="min-h-0 overflow-hidden">
                <div className={className}>
                    <Alert variant="success">{children}</Alert>
                </div>
            </div>
        </div>
    );
}
