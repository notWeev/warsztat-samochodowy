import { axiosInstance } from "./axiosInstance";
import type {
  Vehicle,
  VehiclesListResponse,
  VehiclesStats,
  CreateVehiclePayload,
  UpdateVehiclePayload,
} from "../types/vehicle.types";

export const vehiclesApi = {
  // Pobierz listę pojazdów z paginacją i filtrami
  getVehicles: async (
    page = 1,
    limit = 10,
    search = "",
    customerId?: string,
    status?: string,
  ): Promise<VehiclesListResponse> => {
    const params = new URLSearchParams();
    params.append("page", String(page));
    params.append("limit", String(limit));
    if (search) params.append("search", search);
    if (customerId) params.append("customerId", customerId);
    if (status) params.append("status", status);

    const { data } = await axiosInstance.get("/vehicles", { params });
    return {
      data: data.data || [],
      total: data.total || 0,
      page: data.page || 1,
      limit: data.limit || 10,
    };
  },

  // Pobierz szczegóły pojazdu
  getVehicle: async (id: string): Promise<Vehicle> => {
    const { data } = await axiosInstance.get(`/vehicles/${id}`);
    return data;
  },

  // Utwórz nowy pojazd
  createVehicle: async (payload: CreateVehiclePayload): Promise<Vehicle> => {
    const cleanPayload = {
      ...payload,
      registrationNumber: payload.registrationNumber || undefined,
      color: payload.color || undefined,
      notes: payload.notes || undefined,
    };
    const { data } = await axiosInstance.post("/vehicles", cleanPayload);
    return data;
  },

  // Zaktualizuj pojazd
  updateVehicle: async (
    id: string,
    payload: UpdateVehiclePayload & { customerId?: string; vin?: string },
  ): Promise<Vehicle> => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { customerId: _cid, vin: _vin, ...rest } = payload as any;
    const cleanPayload = {
      ...rest,
      registrationNumber: rest.registrationNumber || undefined,
      color: rest.color || undefined,
      notes: rest.notes || undefined,
    };
    const { data } = await axiosInstance.patch(`/vehicles/${id}`, cleanPayload);
    return data;
  },

  // Usuń pojazd
  deleteVehicle: async (id: string): Promise<void> => {
    await axiosInstance.delete(`/vehicles/${id}`);
  },

  // Pobierz pojazd po VIN
  getVehicleByVin: async (vin: string): Promise<Vehicle | null> => {
    try {
      const { data } = await axiosInstance.get(`/vehicles/vin/${vin}`);
      return data;
    } catch {
      return null;
    }
  },

  // Pobierz pojazdy klienta
  getVehiclesByCustomer: async (customerId: string): Promise<Vehicle[]> => {
    const { data } = await axiosInstance.get(
      `/vehicles/customer/${customerId}`,
    );
    return data;
  },

  // Pobierz statystyki pojazdów
  getStats: async (): Promise<VehiclesStats> => {
    const { data } = await axiosInstance.get("/vehicles/stats");
    return data;
  },
};
