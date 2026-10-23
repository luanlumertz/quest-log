import type { ReactNode } from "react";
import { AuthLayout } from "./AuthLayout";
import { BackButton } from "../ui/BackButton";
import { MaterialIcon, type MaterialIconName } from "../ui/MaterialIcon";

type AuthStepLayoutProps = {
    title: string;
    description: ReactNode;
    children: ReactNode;
    onBack: () => void;
    icon?: MaterialIconName;
};

export function AuthStepLayout({
    title,
    description,
    children,
    onBack,
    icon = "mail",
}: AuthStepLayoutProps) {
    const backButton = <BackButton onClick={onBack}>Voltar</BackButton>;

    return (
        <AuthLayout mobileNavigation={backButton}>
            <div className="mb-6 hidden lg:block">{backButton}</div>
            <div className="mb-6 hidden size-14 items-center justify-center rounded-2xl border border-brand/30 bg-brand/10 text-brand lg:flex">
                <MaterialIcon name={icon} className="text-3xl!" />
            </div>
            <h1 className="font-display text-3xl font-bold text-white">{title}</h1>
            <div className="mt-2 leading-relaxed text-ink-dim">{description}</div>
            {children}
        </AuthLayout>
    );
}
