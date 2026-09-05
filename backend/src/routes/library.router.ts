import { Router } from "express";
import { authenticateToken } from "../middlewares/auth.middleware.js";
import { validateBody } from "../middlewares/validate.middleware.js";
import { addGameToLibrarySchema } from "../schemas/library.schema.js";
import { addGameToLibraryEntryController, getLibraryEntriesController } from "../controllers/library.controller.js";

export const libraryRoutes = Router();

libraryRoutes.post("/", authenticateToken, validateBody(addGameToLibrarySchema), addGameToLibraryEntryController)
libraryRoutes.get("/", authenticateToken, getLibraryEntriesController)
