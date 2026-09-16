type StatCardProps = {
    label: string;
    content: string | number;
    variant?: "purple" | "green" | "pink" | "blue" | "orange";
};

const textColors = {
    purple: "text-[#6C5CFF]",
    green: "text-[#26E6A6]",
    pink: "text-[#C65CFF]",
    blue: "text-[#5B9BFF]",
    orange: "text-[#FF862E]",
};

export function StatCard({
    label,
    content,
    variant = "purple",
}: StatCardProps) {
    return (
        <section className="rounded-[20px] border border-white/5 bg-[#0D0F17] px-5 py-5 overflow-x-hidden">
            <h2 className="mb-4 text-[11px] font-semibold uppercase tracking-[0.18em] text-ink-mute">
                {label}
            </h2>

            <p className={`font-display text-[30px] font-bold leading-none ${textColors[variant]}`}>
                {content}
            </p>
        </section>
    );
}
