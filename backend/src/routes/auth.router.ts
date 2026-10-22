import { Router } from "express";
import { authenticateToken } from "../middlewares/auth.middleware.js";
import { validateBody } from "../middlewares/validate.middleware.js";
import { registrationRateLimiter } from "../middlewares/rateLimit.middleware.js";
import {
    loginUserSchema,
    registerUserSchema,
    resendRegistrationCodeSchema,
    updateUserSchema,
    verifyRegistrationSchema,
} from "../schemas/auth.schema.js";
import {
    deleteUserController,
    getCurrentUserController,
    loginUserController,
    logoutUserController,
    refreshTokenController,
    registerUserController,
    resendRegistrationCodeController,
    updateUserController,
    verifyRegistrationController,
} from "../controllers/auth.controller.js";

export const userRoutes = Router();

userRoutes.post(
    "/register",
    registrationRateLimiter,
    validateBody(registerUserSchema),
    registerUserController,
);
userRoutes.post("/login", validateBody(loginUserSchema), loginUserController);
userRoutes.post("/logout", logoutUserController);
userRoutes.get("/me", authenticateToken, getCurrentUserController);
userRoutes.patch("/me", authenticateToken, validateBody(updateUserSchema), updateUserController);
userRoutes.delete("/me", authenticateToken, deleteUserController);
userRoutes.post("/refresh", refreshTokenController);
userRoutes.post(
    "/register/verify",
    validateBody(verifyRegistrationSchema),
    verifyRegistrationController,
);
userRoutes.post(
    "/register/resend",
    validateBody(resendRegistrationCodeSchema),
    resendRegistrationCodeController,
);
