import { Link } from "react-router";

type StatCardProps = {
    label: string;
    content: string | number;
    color?: string;
    to?: string;
    fontSize?: string
};

export function StatCard({
    label,
    content,
    color,
    to,
    fontSize
}: StatCardProps) {
    const className = `
        block overflow-x-hidden
        rounded-[20px]
        border border-white/5
        bg-[#0D0F17]
        px-5 py-5
        transition-transform
        ${to ? "hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-brand" : ""}
    `;

    const cardContent = (
        <>
            <h2 className="mb-4 text-[11px] font-semibold uppercase tracking-[0.18em] text-ink-mute">
                {label}
            </h2>

            <p
                className={
                    `font-display font-bold leading-none text-brand wrap-break-word
                    ${fontSize ?? "text-[30px]"}
                `}
                style={color ? { color } : undefined}
            >
                {content}
            </p>
        </>
    );

    if (to) {
        return (
            <Link to={to} className={className}>
                {cardContent}
            </Link>
        );
    }

    return (
        <section className={className}>
            {cardContent}
        </section>
    );
}
