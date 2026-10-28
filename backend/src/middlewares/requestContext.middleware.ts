import { AsyncLocalStorage } from "node:async_hooks";
import { randomUUID } from "node:crypto";
import type { RequestHandler } from "express";

export const requestContext = new AsyncLocalStorage<{ requestId: string }>();

export const withRequestContext: RequestHandler = (_req, res, next) => {
    const requestId = randomUUID();
    res.set("X-Request-Id", requestId);
    requestContext.run({ requestId }, next);
};
