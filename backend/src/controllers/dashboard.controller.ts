import type { Request, Response } from "express";
import { getDashboardData } from "../services/dashboard.service.js";

export async function getDashboardDataController(req: Request, res: Response) {
    const userId = req.userId!

    const dashboardData = await getDashboardData(userId);

    return res.status(200).json({ dashboardData })
}
