import { Router } from "express";
import { getCurrentUserController, loginUserController, registerUserController } from "../controllers/auth.controller.js";
import { validateBody } from "../middlewares/validate.middleware.js";
import { loginSchema, registerSchema } from "../schemas/auth.schema.js";
import { authenticateToken } from "../middlewares/auth.middleware.js";

export const userRoutes = Router();

userRoutes.post("/register", validateBody(registerSchema), registerUserController)
userRoutes.post("/login", validateBody(loginSchema), loginUserController)
userRoutes.get("/me", authenticateToken, getCurrentUserController)