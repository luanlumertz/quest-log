export const csrfHeaders = {
    Origin: process.env.FRONTEND_URL ?? "http://localhost:5173",
    "X-QuestLog-Request": "true",
};
