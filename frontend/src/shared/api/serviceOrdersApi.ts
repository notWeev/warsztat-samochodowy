import { axiosInstance } from "./axiosInstance";
import type {
  ServiceOrder,
  ServiceOrdersListResponse,
  ServiceOrdersStats,
  CreateServiceOrderPayload,
  UpdateServiceOrderPayload,
} from "../types/service-order.types";

export const serviceOrdersApi = {
  // Pobierz listę zleceń z paginacją i filtrami
  getOrders: async (
    page = 1,
    limit = 10,
    status?: string,
    priority?: string,
    customerId?: string,
    mechanicId?: string,
    dateFrom?: string,
    dateTo?: string,
  ): Promise<ServiceOrdersListResponse> => {
    const params = new URLSearchParams();
    params.append("page", String(page));
    params.append("limit", String(limit));
    if (status) params.append("status", status);
    if (priority) params.append("priority", priority);
    if (customerId) params.append("customerId", customerId);
    if (mechanicId) params.append("mechanicId", mechanicId);
    if (dateFrom) params.append("dateFrom", dateFrom);
    if (dateTo) params.append("dateTo", dateTo);

    const { data } = await axiosInstance.get("/service-orders", { params });
    return {
      data: data.data || [],
      total: data.total || 0,
      page: data.page || 1,
      limit: data.limit || 10,
    };
  },

  // Szczegóły zlecenia
  getOrder: async (id: string): Promise<ServiceOrder> => {
    const { data } = await axiosInstance.get(`/service-orders/${id}`);
    return data;
  },

  // Utwórz zlecenie
  createOrder: async (
    payload: CreateServiceOrderPayload,
  ): Promise<ServiceOrder> => {
    const clean: Record<string, unknown> = {
      ...payload,
      internalNotes: payload.internalNotes || undefined,
      assignedMechanicId: payload.assignedMechanicId || undefined,
      scheduledAt: payload.scheduledAt || undefined,
      mileageAtAcceptance: payload.mileageAtAcceptance || undefined,
    };
    const { data } = await axiosInstance.post("/service-orders", clean);
    return data;
  },

  // Aktualizuj zlecenie
  updateOrder: async (
    id: string,
    payload: UpdateServiceOrderPayload,
  ): Promise<ServiceOrder> => {
    const clean: Record<string, unknown> = { ...payload };
    // Remove undefined/empty string fields
    Object.keys(clean).forEach((key) => {
      if (clean[key] === "" || clean[key] === undefined) {
        delete clean[key];
      }
    });
    const { data } = await axiosInstance.patch(`/service-orders/${id}`, clean);
    return data;
  },

  // Usuń zlecenie
  deleteOrder: async (id: string): Promise<void> => {
    await axiosInstance.delete(`/service-orders/${id}`);
  },

  // Statystyki
  getStats: async (): Promise<ServiceOrdersStats> => {
    const { data } = await axiosInstance.get("/service-orders/stats");
    return data;
  },
};
