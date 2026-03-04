import { axiosInstance } from "./axiosInstance";
import type { Part, PartsListResponse } from "../types/part.types";

export const partsApi = {
  getParts: async (
    page = 1,
    limit = 10,
    search = "",
    category?: string,
    status?: string,
  ): Promise<PartsListResponse> => {
    const params = new URLSearchParams();
    params.append("page", String(page));
    params.append("limit", String(limit));
    if (search) params.append("search", search);
    if (category) params.append("category", category);
    if (status) params.append("status", status);

    const { data } = await axiosInstance.get("/parts", { params });
    return {
      data: data.data || [],
      total: data.total || 0,
      page: data.page || 1,
      limit: data.limit || 10,
    };
  },

  getPart: async (id: string): Promise<Part> => {
    const { data } = await axiosInstance.get(`/parts/${id}`);
    return data;
  },
};
