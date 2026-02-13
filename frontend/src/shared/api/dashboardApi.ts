import { axiosInstance } from "./axiosInstance";
import type { DashboardStats, RecentOrder } from "../types/dashboard.types";

export const dashboardApi = {
  // Pobierz statystyki
  getStats: async (): Promise<DashboardStats> => {
    const { data } = await axiosInstance.get("/service-orders/stats");
    return data;
  },

  // Pobierz ostatnie zlecenia
  getRecentOrders: async (limit = 5): Promise<RecentOrder[]> => {
    const { data } = await axiosInstance.get("/service-orders", {
      params: { page: 1, limit },
    });
    return data.data || [];
  },
};
