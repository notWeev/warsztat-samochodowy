import { axiosInstance } from "./axiosInstance";
import type { Mechanic } from "../types/service-order.types";
import type {
  StaffUser,
  CreateUserPayload,
  UpdateUserPayload,
  UsersListParams,
  PaginatedUsers,
} from "../types/user.types";

export const usersApi = {
  getUsers: async (params: UsersListParams = {}): Promise<PaginatedUsers> => {
    const { data } = await axiosInstance.get("/users", {
      params: {
        page: params.page ?? 1,
        limit: params.limit ?? 10,
        ...(params.role && { role: params.role }),
        ...(params.status && { status: params.status }),
      },
    });
    return {
      data: data.data || data || [],
      total: data.total || 0,
      page: data.page || params.page || 1,
      limit: data.limit || params.limit || 10,
    };
  },

  getUser: async (id: string): Promise<StaffUser> => {
    const { data } = await axiosInstance.get(`/users/${id}`);
    return data;
  },

  createUser: async (payload: CreateUserPayload): Promise<StaffUser> => {
    const { data } = await axiosInstance.post("/users", payload);
    return data;
  },

  updateUser: async (
    id: string,
    payload: UpdateUserPayload,
  ): Promise<StaffUser> => {
    const { data } = await axiosInstance.patch(`/users/${id}`, payload);
    return data;
  },

  deleteUser: async (id: string): Promise<void> => {
    await axiosInstance.delete(`/users/${id}`);
  },

  getMechanics: async (): Promise<Mechanic[]> => {
    const { data } = await axiosInstance.get("/users", {
      params: { role: "MECHANIC", limit: 100 },
    });
    return data.data || data || [];
  },
};
