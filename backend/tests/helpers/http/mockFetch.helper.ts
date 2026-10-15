import { vi } from "vitest";

export function mockFetchResponse(body: unknown, status = 200) {
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValue(
        new Response(JSON.stringify(body), {
            status,
            headers: {
                "Content-Type": "application/json",
            },
        }),
    );

    vi.stubGlobal("fetch", fetchMock);

    return fetchMock;
}

export function mockFetchError(error: Error = new TypeError("Failed to fetch")) {
    const fetchMock = vi.fn<typeof fetch>().mockRejectedValue(error);

    vi.stubGlobal("fetch", fetchMock);

    return fetchMock;
}

export function mockFetchInvalidJson() {
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValue(
        new Response("JSON inválido", {
            status: 200,
            headers: {
                "Content-Type": "application/json",
            },
        }),
    );

    vi.stubGlobal("fetch", fetchMock);

    return fetchMock;
}
