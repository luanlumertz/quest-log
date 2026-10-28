import express from "express";
import { Prisma } from "../../../src/generated/prisma/client.js";
import request from "supertest";

import app from "../../../src/app.js";
import { csrfHeaders } from "../../helpers/http/csrf.helper.js";
import { errorHandler } from "../../../src/middlewares/errorHandler.middleware.js";
import { withRequestContext } from "../../../src/middlewares/requestContext.middleware.js";
import { AppError } from "../../../src/errors/AppError.js";

export function registerWithMalformedJson() {
    return request(app)
        .post("/auth/register")
        .set(csrfHeaders)
        .set("Content-Type", "application/json")
        .send('{"name": "Test Name",');
}

export function requestUnexpectedError() {
    const app = express();
    app.use(withRequestContext);

    app.get("/erro-teste", () => {
        throw new Error("Erro interno de teste");
    });

    app.use(errorHandler);

    return request(app).get("/erro-teste");
}

export function requestHandledError(error: AppError) {
    const app = express();
    app.use(withRequestContext);
    app.get("/erro-integracao", () => {
        throw error;
    });
    app.use(errorHandler);

    return request(app).get("/erro-integracao?key=NAO_LOGAR").set("X-Request-Id", "id-forjado");
}

export function requestPrismaNotFound() {
    const app = express();

    app.get("/erro-prisma", () => {
        throw new Prisma.PrismaClientKnownRequestError("Registro não encontrado", {
            code: "P2025",
            clientVersion: Prisma.prismaVersion.client,
        });
    });

    app.use(errorHandler);

    return request(app).get("/erro-prisma");
}
