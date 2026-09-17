type StatCardProps = {
    label: string;
    content: string | number;
    color?: string;
};

export function StatCard({
    label,
    content,
    color,
}: StatCardProps) {
    return (
        <section className="overflow-x-hidden rounded-[20px] border border-white/5 bg-[#0D0F17] px-5 py-5">
            <h2 className="mb-4 text-[11px] font-semibold uppercase tracking-[0.18em] text-ink-mute">
                {label}
            </h2>

            <p
                className="font-display text-[30px] font-bold leading-none text-brand"
                style={color ? { color } : undefined}
            >
                {content}
            </p>
        </section>
    );
}
