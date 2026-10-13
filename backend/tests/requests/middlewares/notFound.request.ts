import request from "supertest";

import app from "../../../src/app.js";

export function requestNotFoundRoute() {
    return request(app).get("/rota-inexistente");
}
