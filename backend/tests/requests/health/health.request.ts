import request from "supertest";
import app from "../../../src/app.js";

export function getHealth() {
    return request(app).get("/healthz");
}
