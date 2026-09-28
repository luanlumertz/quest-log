import { useEffect } from "react";

export function useDocumentTitle(title?: string) {
    useEffect(() => {
        document.title = title ? `${title} | QuestLog` : "QuestLog";

        return () => {
            document.title = "QuestLog";
        };
    }, [title]);
}
