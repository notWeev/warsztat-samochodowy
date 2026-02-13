import { useQuery } from "@tanstack/react-query";
import { dashboardApi } from "../../../shared/api/dashboardApi";

export const useDashboardStats = () => {
  return useQuery({
    queryKey: ["dashboard", "stats"],
    queryFn: dashboardApi.getStats,
    staleTime: 2 * 60 * 1000, // 2 minuty
  });
};

export const useRecentOrders = (limit = 5) => {
  return useQuery({
    queryKey: ["dashboard", "recentOrders", limit],
    queryFn: () => dashboardApi.getRecentOrders(limit),
    staleTime: 1 * 60 * 1000, // 1 minuta
  });
};
