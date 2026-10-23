import { Router } from "express";
import { authenticateToken } from "../middlewares/auth.middleware.js";
import { validateBody } from "../middlewares/validate.middleware.js";
import {
    loginRateLimiter,
    refreshRateLimiter,
    registrationRateLimiter,
    resendRateLimiter,
    verificationRateLimiter,
    passwordChangeRateLimiter,
    passwordChangeIpRateLimiter,
    passwordRecoveryRateLimiter,
    passwordResetRateLimiter,
    passwordVerificationRateLimiter,
} from "../middlewares/rateLimit.middleware.js";
import {
    loginUserSchema,
    registerUserSchema,
    resendRegistrationCodeSchema,
    updateUserSchema,
    verifyRegistrationSchema,
    changePasswordSchema,
    requestPasswordRecoverySchema,
    resetPasswordSchema,
    verifyPasswordRecoverySchema,
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
import {
    changePasswordController,
    requestPasswordRecoveryController,
    resetPasswordController,
    verifyPasswordRecoveryController,
} from "../controllers/password.controller.js";

export const userRoutes = Router();

userRoutes.post(
    "/register",
    registrationRateLimiter,
    validateBody(registerUserSchema),
    registerUserController,
);
userRoutes.post("/login", loginRateLimiter, validateBody(loginUserSchema), loginUserController);
userRoutes.post("/logout", logoutUserController);
userRoutes.get("/me", authenticateToken, getCurrentUserController);
userRoutes.patch("/me", authenticateToken, validateBody(updateUserSchema), updateUserController);
userRoutes.delete("/me", authenticateToken, deleteUserController);
userRoutes.post("/refresh", refreshRateLimiter, refreshTokenController);
userRoutes.post(
    "/register/verify",
    verificationRateLimiter,
    validateBody(verifyRegistrationSchema),
    verifyRegistrationController,
);
userRoutes.post(
    "/register/resend",
    resendRateLimiter,
    validateBody(resendRegistrationCodeSchema),
    resendRegistrationCodeController,
);
userRoutes.post(
    "/password/forgot",
    passwordRecoveryRateLimiter,
    validateBody(requestPasswordRecoverySchema),
    requestPasswordRecoveryController,
);
userRoutes.post(
    "/password/resend",
    passwordRecoveryRateLimiter,
    validateBody(requestPasswordRecoverySchema),
    requestPasswordRecoveryController,
);
userRoutes.post(
    "/password/verify",
    passwordVerificationRateLimiter,
    validateBody(verifyPasswordRecoverySchema),
    verifyPasswordRecoveryController,
);
userRoutes.post(
    "/password/reset",
    passwordResetRateLimiter,
    validateBody(resetPasswordSchema),
    resetPasswordController,
);
userRoutes.patch(
    "/me/password",
    passwordChangeIpRateLimiter,
    authenticateToken,
    passwordChangeRateLimiter,
    validateBody(changePasswordSchema),
    changePasswordController,
);
