import { Router } from "express";
import { deleteUserController, getCurrentUserController, loginUserController, logoutUserController, registerUserController, updateUserController } from "../controllers/auth.controller.js";
import { validateBody } from "../middlewares/validate.middleware.js";
import { loginUserSchema, registerUserSchema, updateUserSchema } from "../schemas/auth.schema.js";
import { authenticateToken } from "../middlewares/auth.middleware.js";

export const userRoutes = Router();

userRoutes.post("/register", validateBody(registerUserSchema), registerUserController)
userRoutes.post("/login", validateBody(loginUserSchema), loginUserController)
userRoutes.post("/logout", logoutUserController)
userRoutes.get("/me", authenticateToken, getCurrentUserController)
userRoutes.patch("/me", authenticateToken, validateBody(updateUserSchema), updateUserController)
userRoutes.delete("/me", authenticateToken, deleteUserController)
