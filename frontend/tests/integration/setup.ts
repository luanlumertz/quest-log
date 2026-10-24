import "@testing-library/jest-dom/vitest";

import { afterAll, afterEach, beforeAll } from "vitest";
import { cleanup } from "@testing-library/react";
import { server } from "../mocks/server.mock";

beforeAll(() => {
    HTMLElement.prototype.scrollTo ??= () => {};
    // O JSDOM não calcula dimensões; testes de layout podem substituir este observer.
    globalThis.ResizeObserver ??= class implements ResizeObserver {
        observe() {}
        unobserve() {}
        disconnect() {}
    };
    server.listen({ onUnhandledFrame: "error" });
});

afterEach(() => {
    cleanup();
    sessionStorage.clear();
    server.resetHandlers();
});

afterAll(() => {
    server.close();
});
