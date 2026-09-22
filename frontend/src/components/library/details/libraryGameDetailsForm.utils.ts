export function getTodayInputValue() {
    const today = new Date();

    const year = today.getFullYear();

    const month = String(today.getMonth() + 1).padStart(2, "0");

    const day = String(today.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}

export function dateToInputValue(value: string | null) {
    if (!value) return "";

    return value.slice(0, 10);
}

export function dateInputToDate(value: string): Date | null {
    if (!value) return null;

    return new Date(`${value}T00:00:00.000Z`);
}

export function minutesToHoursInput(minutes: number) {
    if (minutes === 0) {
        return "";
    }

    const hours = minutes / 60;

    return Number(hours.toFixed(2)).toString().replace(".", ",");
}

export function hoursInputToMinutes(value: string) {
    const normalizedValue = value.trim().replace(",", ".");

    if (!normalizedValue) {
        return 0;
    }

    const hours = Number(normalizedValue);

    if (!Number.isFinite(hours)) {
        return Number.NaN;
    }

    return Math.round(hours * 60);
}

export function normalizeHoursInput(value: string) {
    const normalized = value.replace(".", ",").replace(/[^\d,]/g, "");

    const [hours, decimal] = normalized.split(",");

    if (!normalized.includes(",")) {
        return hours;
    }

    return `${hours},${decimal?.slice(0, 1) ?? ""}`;
}

export function ratingInputToNumber(value: string): number | null {
    const normalizedValue = value.trim().replace(",", ".");

    if (!normalizedValue) {
        return null;
    }

    return Number(normalizedValue);
}
