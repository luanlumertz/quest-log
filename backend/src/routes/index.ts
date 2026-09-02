import { Router } from "express";
import { userRoutes } from "./auth.router.js";
import { gameRoutes } from "./game.router.js";

export const routes = Router();

routes.use("/auth", userRoutes)
routes.use("/games", gameRoutes)