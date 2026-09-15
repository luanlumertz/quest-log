import type { DashboardData } from "../types/dashboard.types";
import { apiRequest } from "./api";

export async function getDashboard(): Promise<DashboardData> {
    const response = await apiRequest("/dashboard");

    const data: { dashboardData: DashboardData } = await response.json();

    return data.dashboardData;
}
