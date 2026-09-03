import { Router } from "express";
import { getRawgGameController, searchGameController } from "../controllers/game.controller.js";
import { authenticateToken } from "../middlewares/auth.middleware.js";

export const gameRoutes = Router();

gameRoutes.get("/search", authenticateToken, searchGameController);
gameRoutes.get("/:externalId", authenticateToken, getRawgGameController);