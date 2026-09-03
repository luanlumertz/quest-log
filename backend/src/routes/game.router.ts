import { Router } from "express";
import { getRawgGameController, searchGameController } from "../controllers/game.controller.js";
import { authenticateToken } from "../middlewares/auth.middleware.js";
import { validateParams, validateQuery } from "../middlewares/validate.middleware.js";
import { getRawgGameSchema, searchGameSchema } from "../schemas/game.schema.js";

export const gameRoutes = Router();

gameRoutes.get("/search", authenticateToken, validateQuery(searchGameSchema), searchGameController);
gameRoutes.get("/:externalId", authenticateToken, validateParams(getRawgGameSchema), getRawgGameController);