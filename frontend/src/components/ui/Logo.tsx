export function Logo() {
    return (
        <div className="flex items-center gap-3">
            <div
                className="
                    flex size-12 items-center justify-center
                    rounded-xl bg-brand
                    text-white
                "
            >
                <span className="material-symbols-rounded text-white text-[32px]!">
                    stadia_controller
                </span>
            </div>

            <span className="font-display text-2xl font-bold text-white">
                QuestLog
            </span>
        </div>
    );
}
