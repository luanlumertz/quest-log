import { http, HttpResponse } from "msw";

import { API_URL } from "../../src/services/api";
import { server } from "./server.mock";

type MockJson = string | number | boolean | null | MockJson[] | { [key: string]: MockJson };

type MockApiOptions = {
    method: "GET" | "POST" | "PATCH";
    endpoint: string;
    responseBody?: MockJson;
    status?: number;
};

type CapturedRequest = {
    url: string;
    method: string;
    body: unknown;
    contentType: string | null;
};

export function mockApiResponse({
    method,
    endpoint,
    responseBody = { ok: true },
    status = 200,
}: MockApiOptions) {
    const requests: CapturedRequest[] = [];

    async function handleRequest(request: Request) {
        const contentType = request.headers.get("Content-Type");

        let body: unknown;

        if (!request.body) {
            body = undefined;
        } else if (contentType?.includes("application/json")) {
            body = await request.json();
        } else {
            body = await request.text();
        }

        requests.push({
            url: request.url,
            method: request.method,
            body,
            contentType,
        });

        return HttpResponse.json(responseBody, { status });
    }

    switch (method) {
        case "GET":
            server.use(http.get(`${API_URL}${endpoint}`, ({ request }) => handleRequest(request)));
            break;
        case "POST":
            server.use(http.post(`${API_URL}${endpoint}`, ({ request }) => handleRequest(request)));
            break;
        case "PATCH":
            server.use(
                http.patch(`${API_URL}${endpoint}`, ({ request }) => handleRequest(request)),
            );
            break;
    }

    return { requests };
}
