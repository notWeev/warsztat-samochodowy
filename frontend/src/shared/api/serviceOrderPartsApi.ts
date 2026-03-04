import { axiosInstance } from "./axiosInstance";
import type {
  OrderPart,
  AddPartToOrderPayload,
  UpdateOrderPartPayload,
} from "../types/service-order.types";

export const serviceOrderPartsApi = {
  // Pobierz części zlecenia
  getParts: async (serviceOrderId: string): Promise<OrderPart[]> => {
    const { data } = await axiosInstance.get(
      `/service-orders/${serviceOrderId}/parts`,
    );
    return data;
  },

  // Dodaj część do zlecenia
  addPart: async (
    serviceOrderId: string,
    payload: AddPartToOrderPayload,
  ): Promise<OrderPart> => {
    const { data } = await axiosInstance.post(
      `/service-orders/${serviceOrderId}/parts`,
      {
        ...payload,
        notes: payload.notes || undefined,
        unitPrice: payload.unitPrice || undefined,
      },
    );
    return data;
  },

  // Aktualizuj ilość/cenę części
  updatePart: async (
    serviceOrderId: string,
    partEntryId: string,
    payload: UpdateOrderPartPayload,
  ): Promise<OrderPart> => {
    const { data } = await axiosInstance.patch(
      `/service-orders/${serviceOrderId}/parts/${partEntryId}`,
      payload,
    );
    return data;
  },

  // Usuń część ze zlecenia
  removePart: async (
    serviceOrderId: string,
    partEntryId: string,
  ): Promise<void> => {
    await axiosInstance.delete(
      `/service-orders/${serviceOrderId}/parts/${partEntryId}`,
    );
  },
};
