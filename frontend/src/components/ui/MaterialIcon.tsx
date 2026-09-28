import type { MaterialIconName } from "./materialIcon.config";
export type { MaterialIconName } from "./materialIcon.config";

type MaterialIconProps = {
    name: MaterialIconName;
    className?: string;
};

export function MaterialIcon({ name, className = "" }: MaterialIconProps) {
    return (
        <span
            aria-hidden="true"
            className={`material-symbols-rounded ${className}`}
        >
            {name}
        </span>
    );
}
