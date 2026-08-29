import { Router } from "express";
import { pongRoute } from "./pong.router.js"
import { userRoutes } from "./auth.router.js";

export const routes = Router();

routes.use("/ping", pongRoute)
routes.use("/auth", userRoutes)