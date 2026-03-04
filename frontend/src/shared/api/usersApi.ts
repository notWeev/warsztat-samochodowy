import { axiosInstance } from "./axiosInstance";
import type { Mechanic } from "../types/service-order.types";

export const usersApi = {
  // Pobierz listę użytkowników (ADMIN/MANAGER only)
  getUsers: async (
    page = 1,
    limit = 100,
    role?: string,
  ): Promise<{ data: Mechanic[]; total: number }> => {
    const params = new URLSearchParams();
    params.append("page", String(page));
    params.append("limit", String(limit));
    if (role) params.append("role", role);

    const { data } = await axiosInstance.get("/users", { params });
    return {
      data: data.data || data || [],
      total: data.total || 0,
    };
  },

  // Pobierz mechaników
  getMechanics: async (): Promise<Mechanic[]> => {
    const params = new URLSearchParams();
    params.append("role", "MECHANIC");
    params.append("limit", "100");

    const { data } = await axiosInstance.get("/users", { params });
    return data.data || data || [];
  },
};
