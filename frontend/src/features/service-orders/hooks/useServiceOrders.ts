import {
  useMutation,
  useQuery,
  useQueryClient,
  keepPreviousData,
} from "@tanstack/react-query";
import { serviceOrdersApi } from "@/shared/api/serviceOrdersApi";
import { serviceOrderPartsApi } from "@/shared/api/serviceOrderPartsApi";
import { partsApi } from "@/shared/api/partsApi";
import { usersApi } from "@/shared/api/usersApi";
import type {
  CreateServiceOrderPayload,
  UpdateServiceOrderPayload,
  AddPartToOrderPayload,
  UpdateOrderPartPayload,
} from "@/shared/types/service-order.types";

export const useServiceOrders = (
  page = 1,
  limit = 10,
  status?: string,
  priority?: string,
  customerId?: string,
  mechanicId?: string,
  dateFrom?: string,
  dateTo?: string,
) =>
  useQuery({
    queryKey: [
      "service-orders",
      page,
      limit,
      status,
      priority,
      customerId,
      mechanicId,
      dateFrom,
      dateTo,
    ],
    queryFn: () =>
      serviceOrdersApi.getOrders(
        page,
        limit,
        status,
        priority,
        customerId,
        mechanicId,
        dateFrom,
        dateTo,
      ),
    staleTime: 2 * 60 * 1000,
    placeholderData: keepPreviousData,
  });

export const useServiceOrder = (id: string) =>
  useQuery({
    queryKey: ["service-orders", id],
    queryFn: () => serviceOrdersApi.getOrder(id),
    staleTime: 1 * 60 * 1000,
    enabled: !!id,
  });

export const useServiceOrdersStats = () =>
  useQuery({
    queryKey: ["service-orders", "stats"],
    queryFn: serviceOrdersApi.getStats,
    staleTime: 5 * 60 * 1000,
  });

export const useCreateServiceOrder = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateServiceOrderPayload) =>
      serviceOrdersApi.createOrder(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["service-orders"] });
    },
  });
};

export const useUpdateServiceOrder = (id: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateServiceOrderPayload) =>
      serviceOrdersApi.updateOrder(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["service-orders"] });
      qc.invalidateQueries({ queryKey: ["service-orders", id] });
    },
  });
};

export const useDeleteServiceOrder = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => serviceOrdersApi.deleteOrder(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["service-orders"] });
    },
  });
};

export const useOrderParts = (serviceOrderId: string) =>
  useQuery({
    queryKey: ["service-orders", serviceOrderId, "parts"],
    queryFn: () => serviceOrderPartsApi.getParts(serviceOrderId),
    staleTime: 1 * 60 * 1000,
    enabled: !!serviceOrderId,
  });

export const useAddPartToOrder = (serviceOrderId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: AddPartToOrderPayload) =>
      serviceOrderPartsApi.addPart(serviceOrderId, data),
    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: ["service-orders", serviceOrderId, "parts"],
      });
      qc.invalidateQueries({ queryKey: ["service-orders", serviceOrderId] });
      qc.invalidateQueries({ queryKey: ["service-orders"] });
    },
  });
};

export const useUpdateOrderPart = (serviceOrderId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      partEntryId,
      data,
    }: {
      partEntryId: string;
      data: UpdateOrderPartPayload;
    }) => serviceOrderPartsApi.updatePart(serviceOrderId, partEntryId, data),
    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: ["service-orders", serviceOrderId, "parts"],
      });
      qc.invalidateQueries({ queryKey: ["service-orders", serviceOrderId] });
    },
  });
};

export const useRemoveOrderPart = (serviceOrderId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (partEntryId: string) =>
      serviceOrderPartsApi.removePart(serviceOrderId, partEntryId),
    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: ["service-orders", serviceOrderId, "parts"],
      });
      qc.invalidateQueries({ queryKey: ["service-orders", serviceOrderId] });
      qc.invalidateQueries({ queryKey: ["service-orders"] });
    },
  });
};

export const useParts = (search = "", page = 1, limit = 50) =>
  useQuery({
    queryKey: ["parts", page, limit, search],
    queryFn: () => partsApi.getParts({ page, limit, search }),
    staleTime: 5 * 60 * 1000,
  });

export const useMechanics = () =>
  useQuery({
    queryKey: ["users", "mechanics"],
    queryFn: usersApi.getMechanics,
    staleTime: 10 * 60 * 1000,
  });
