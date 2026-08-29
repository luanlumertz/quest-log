import { Router } from "express";
import { loginUserController, registerUserController } from "../controllers/auth.controller.js";
import { validateBody } from "../middlewares/validate.middleware.js";
import { loginSchema, registerSchema } from "../schemas/auth.schema.js";

export const userRoutes = Router();

userRoutes.post("/register", validateBody(registerSchema), registerUserController)
userRoutes.post("/login", validateBody(loginSchema), loginUserController)
