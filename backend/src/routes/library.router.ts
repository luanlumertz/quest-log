import { Router } from "express";
import { authenticateToken } from "../middlewares/auth.middleware.js";
import { validateBody } from "../middlewares/validate.middleware.js";
import { addGameToLibrarySchema } from "../schemas/library.schema.js";
import { addGameToLibraryEntryController } from "../controllers/library.controller.js";

export const libraryRoutes = Router();

libraryRoutes.post("/register", authenticateToken, validateBody(addGameToLibrarySchema), addGameToLibraryEntryController)