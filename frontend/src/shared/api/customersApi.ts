import { axiosInstance } from "./axiosInstance";
import type {
  Customer,
  CustomersListResponse,
  CustomersStats,
  CreateCustomerPayload,
  UpdateCustomerPayload,
} from "../types/customer.types";

export const customersApi = {
  // Pobierz listę klientów z paginacją i filtrami
  getCustomers: async (
    page = 1,
    limit = 10,
    search = "",
    type?: string,
  ): Promise<CustomersListResponse> => {
    const params = new URLSearchParams();
    params.append("page", String(page));
    params.append("limit", String(limit));
    if (search) params.append("search", search);
    if (type) params.append("type", type);

    const { data } = await axiosInstance.get("/customers", { params });
    return {
      data: data.data || [],
      total: data.total || 0,
      page: data.page || 1,
      limit: data.limit || 10,
    };
  },

  // Pobierz szczegóły pojedynczego klienta
  getCustomer: async (id: string): Promise<Customer> => {
    const { data } = await axiosInstance.get(`/customers/${id}`);
    return data;
  },

  // Utwórz nowego klienta
  createCustomer: async (payload: CreateCustomerPayload): Promise<Customer> => {
    const { data } = await axiosInstance.post("/customers", payload);
    return data;
  },

  // Zaktualizuj klienta
  updateCustomer: async (
    id: string,
    payload: UpdateCustomerPayload,
  ): Promise<Customer> => {
    const { data } = await axiosInstance.patch(`/customers/${id}`, payload);
    return data;
  },

  // Usuń klienta
  deleteCustomer: async (id: string): Promise<void> => {
    await axiosInstance.delete(`/customers/${id}`);
  },

  // Pobierz statystyki klientów
  getStats: async (): Promise<CustomersStats> => {
    const { data } = await axiosInstance.get("/customers/stats");
    return data;
  },
};
