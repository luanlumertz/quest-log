import { Router } from "express";
import { authenticateToken } from "../middlewares/auth.middleware.js";
import { getDashboardDataController } from "../controllers/dashboard.controller.js";

export const dashboardRoutes = Router();

dashboardRoutes.get("/", authenticateToken, getDashboardDataController)
