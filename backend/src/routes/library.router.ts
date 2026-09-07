import { Router } from "express";
import { authenticateToken } from "../middlewares/auth.middleware.js";
import { validateBody, validateParams } from "../middlewares/validate.middleware.js";
import { addGameToLibrarySchema, getLibraryEntryDetailsSchema } from "../schemas/library.schema.js";
import { addGameToLibraryEntryController, getLibraryEntriesController, getLibraryEntryDetailsController } from "../controllers/library.controller.js";

export const libraryRoutes = Router();

libraryRoutes.post("/", authenticateToken, validateBody(addGameToLibrarySchema), addGameToLibraryEntryController)
libraryRoutes.get("/", authenticateToken, getLibraryEntriesController)
libraryRoutes.get("/:gameId", authenticateToken, validateParams(getLibraryEntryDetailsSchema), getLibraryEntryDetailsController)
