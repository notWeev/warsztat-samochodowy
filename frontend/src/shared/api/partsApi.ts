import { axiosInstance } from "./axiosInstance";
import type {
  Part,
  PartsListResponse,
  PartsStats,
  PartsListParams,
  CreatePartPayload,
  UpdatePartPayload,
} from "../types/part.types";

export const partsApi = {
  getParts: async (
    params: PartsListParams = {},
  ): Promise<PartsListResponse> => {
    const { page = 1, limit = 10, search, category, status, lowStock } = params;
    const query = new URLSearchParams();
    query.append("page", String(page));
    query.append("limit", String(limit));
    if (search) query.append("search", search);
    if (category) query.append("category", category);
    if (status) query.append("status", status);
    if (lowStock) query.append("lowStock", "true");

    const { data } = await axiosInstance.get("/parts", { params: query });
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

  getStats: async (): Promise<PartsStats> => {
    const { data } = await axiosInstance.get("/parts/stats");
    return data;
  },

  getLowStock: async (): Promise<Part[]> => {
    const { data } = await axiosInstance.get("/parts/low-stock");
    return data;
  },

  getByPartNumber: async (partNumber: string): Promise<Part> => {
    const { data } = await axiosInstance.get(
      `/parts/part-number/${encodeURIComponent(partNumber)}`,
    );
    return data;
  },

  createPart: async (payload: CreatePartPayload): Promise<Part> => {
    const { data } = await axiosInstance.post("/parts", payload);
    return data;
  },

  updatePart: async (id: string, payload: UpdatePartPayload): Promise<Part> => {
    const { data } = await axiosInstance.patch(`/parts/${id}`, payload);
    return data;
  },

  deletePart: async (id: string): Promise<void> => {
    await axiosInstance.delete(`/parts/${id}`);
  },
};
