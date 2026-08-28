import { Router } from "express";
import { registerUserController } from "../controllers/user.controller.js";
import { validateBody } from "../middlewares/validate.middleware.js";
import { registerSchema } from "../schemas/user.schema.js";

export const userRoutes = Router();

userRoutes.post("/register", validateBody(registerSchema), registerUserController)