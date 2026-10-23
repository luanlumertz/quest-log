import { useEffect, useState } from "react";

export function useCountdown(deadline: number) {
    const [now, setNow] = useState(Date.now);

    useEffect(() => {
        const initialTick = window.setTimeout(() => setNow(Date.now()), 0);
        const interval = window.setInterval(() => setNow(Date.now()), 1000);
        return () => {
            window.clearTimeout(initialTick);
            window.clearInterval(interval);
        };
    }, [deadline]);

    return Math.max(0, Math.ceil((deadline - now) / 1000));
}
