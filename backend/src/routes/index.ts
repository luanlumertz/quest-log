import { Router } from "express";
import { userRoutes } from "./auth.router.js";
import { gameRoutes } from "./game.router.js";
import { libraryRoutes } from "./library.router.js";

export const routes = Router();

routes.use("/auth", userRoutes)
routes.use("/games", gameRoutes)
routes.use("/library", libraryRoutes)