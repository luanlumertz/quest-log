import { MaterialIcon } from "./MaterialIcon";

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
                <MaterialIcon
                    name="stadia_controller"
                    className="text-[32px]! text-white"
                />
            </div>

            <span className="font-display text-2xl font-bold text-white">
                QuestLog
            </span>
        </div>
    );
}
