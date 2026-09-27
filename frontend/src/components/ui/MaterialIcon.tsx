export const MATERIAL_ICON_NAMES = [
    "arrow_back",
    "calendar_month",
    "check",
    "check_circle",
    "close",
    "dashboard",
    "delete",
    "error",
    "library_add",
    "library_books",
    "logout",
    "person",
    "schedule",
    "search",
    "search_off",
    "stadia_controller",
    "undo",
    "visibility",
    "visibility_off"
] as const;

export type MaterialIconName = (typeof MATERIAL_ICON_NAMES)[number];

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
