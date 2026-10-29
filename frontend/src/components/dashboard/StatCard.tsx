import { Link } from "react-router";

type StatCardProps = {
    label: string;
    content: string | number;
    color?: string;
    to?: string;
    className?: string;
};

export function StatCard({ label, content, color, to, className = "" }: StatCardProps) {
    const cardClassName = `
        grid min-w-0 row-span-2 grid-rows-subgrid gap-y-4 overflow-x-hidden text-center
        rounded-[20px]
        border border-white/5
        bg-[#0D0F17]
        px-3 py-5
        transition-[translate,scale,transform] duration-300 ease-out
        ${to ? "hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-brand" : ""}
        ${className}
    `;

    const cardContent = (
        <>
            <h2 className="self-center text-[11px] font-semibold uppercase tracking-[0.18em] text-ink-mute">
                {label}
            </h2>

            <p
                className="min-w-0 break-all font-display text-[30px] font-bold leading-none text-brand"
                style={color ? { color } : undefined}
            >
                {content}
            </p>
        </>
    );

    if (to) {
        return (
            <Link to={to} className={cardClassName}>
                {cardContent}
            </Link>
        );
    }

    return <section className={cardClassName}>{cardContent}</section>;
}
