import request from "supertest";

export type AppTestAgent = ReturnType<typeof request.agent>;
