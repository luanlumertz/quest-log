import { Router } from "express";
import { authenticateToken } from "../middlewares/auth.middleware.js";
import { validateBody, validateParams, validateQuery } from "../middlewares/validate.middleware.js";
import { addGameToLibrarySchema, gameIdParamsSchema, libraryQuerySchema, updateLibraryEntrySchema } from "../schemas/library.schema.js";
import { addGameToLibraryEntryController, deleteLibraryEntryController, getLibraryEntriesController, getLibraryEntryDetailsController, updateLibraryEntryController } from "../controllers/library.controller.js";

export const libraryRoutes = Router();

libraryRoutes.post("/", authenticateToken, validateBody(addGameToLibrarySchema), addGameToLibraryEntryController)
libraryRoutes.get("/", authenticateToken, validateQuery(libraryQuerySchema), getLibraryEntriesController)
libraryRoutes.get("/:gameId", authenticateToken, validateParams(gameIdParamsSchema), getLibraryEntryDetailsController)
libraryRoutes.patch("/:gameId", authenticateToken, validateParams(gameIdParamsSchema), validateBody(updateLibraryEntrySchema), updateLibraryEntryController)
libraryRoutes.delete("/:gameId", authenticateToken, validateParams(gameIdParamsSchema), deleteLibraryEntryController)
