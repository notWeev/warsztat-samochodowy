import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { vehiclesApi } from "@/shared/api/vehiclesApi";
import type {
  CreateVehiclePayload,
  UpdateVehiclePayload,
} from "@/shared/types/vehicle.types";

// ===== QUERIES =====

/**
 * Hook do pobierania listy pojazdów z paginacją i filtrami
 */
export const useVehicles = (
  page = 1,
  limit = 10,
  search = "",
  customerId?: string,
  status?: string,
) => {
  return useQuery({
    queryKey: ["vehicles", page, limit, search, customerId, status],
    queryFn: () =>
      vehiclesApi.getVehicles(page, limit, search, customerId, status),
    staleTime: 2 * 60 * 1000, // 2 minuty
  });
};

/**
 * Hook do pobierania szczegółów pojedynczego pojazdu
 */
export const useVehicle = (id: string) => {
  return useQuery({
    queryKey: ["vehicles", id],
    queryFn: () => vehiclesApi.getVehicle(id),
    staleTime: 2 * 60 * 1000,
    enabled: !!id,
  });
};

/**
 * Hook do pobierania pojazdów klienta
 */
export const useVehiclesByCustomer = (customerId: string) => {
  return useQuery({
    queryKey: ["vehicles", "customer", customerId],
    queryFn: () => vehiclesApi.getVehiclesByCustomer(customerId),
    staleTime: 2 * 60 * 1000,
    enabled: !!customerId,
  });
};

/**
 * Hook do pobierania statystyk pojazdów
 */
export const useVehiclesStats = () => {
  return useQuery({
    queryKey: ["vehicles", "stats"],
    queryFn: vehiclesApi.getStats,
    staleTime: 5 * 60 * 1000, // 5 minut
  });
};

// ===== MUTATIONS =====

/**
 * Hook do tworzenia nowego pojazdu
 */
export const useCreateVehicle = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateVehiclePayload) => vehiclesApi.createVehicle(data),
    onSuccess: () => {
      // Unieważnij cache listy pojazdów
      queryClient.invalidateQueries({ queryKey: ["vehicles"] });
      // Unieważnij statystyki
      queryClient.invalidateQueries({ queryKey: ["vehicles", "stats"] });
    },
  });
};

/**
 * Hook do aktualizacji pojazdu
 */
export const useUpdateVehicle = (id: string | null | undefined) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateVehiclePayload) => {
      if (!id) throw new Error("Vehicle ID is required for update");
      return vehiclesApi.updateVehicle(id, data);
    },
    onSuccess: () => {
      // Unieważnij cache dla tego pojazdu
      if (id) {
        queryClient.invalidateQueries({ queryKey: ["vehicles", id] });
      }
      // Unieważnij cache listy pojazdów
      queryClient.invalidateQueries({ queryKey: ["vehicles"] });
      // Unieważnij statystyki
      queryClient.invalidateQueries({ queryKey: ["vehicles", "stats"] });
    },
  });
};

/**
 * Hook do usuwania pojazdu
 */
export const useDeleteVehicle = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => vehiclesApi.deleteVehicle(id),
    onSuccess: () => {
      // Unieważnij cache listy pojazdów
      queryClient.invalidateQueries({ queryKey: ["vehicles"] });
      // Unieważnij statystyki
      queryClient.invalidateQueries({ queryKey: ["vehicles", "stats"] });
    },
  });
};
