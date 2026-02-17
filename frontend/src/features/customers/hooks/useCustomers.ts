import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { customersApi } from "@/shared/api/customersApi";
import type {
  CreateCustomerPayload,
  UpdateCustomerPayload,
} from "@/shared/types/customer.types";

// ===== QUERIES =====

/**
 * Hook do pobierania listy klientów z paginacją i filtrami
 */
export const useCustomers = (
  page = 1,
  limit = 10,
  search = "",
  type?: string,
) => {
  return useQuery({
    queryKey: ["customers", page, limit, search, type],
    queryFn: () => customersApi.getCustomers(page, limit, search, type),
    staleTime: 2 * 60 * 1000, // 2 minuty
  });
};

/**
 * Hook do pobierania szczegółów pojedynczego klienta
 */
export const useCustomer = (id: string) => {
  return useQuery({
    queryKey: ["customers", id],
    queryFn: () => customersApi.getCustomer(id),
    staleTime: 2 * 60 * 1000,
    enabled: !!id, // Nie wysyłaj zapytania jeśli nie ma id
  });
};

/**
 * Hook do pobierania statystyk klientów
 */
export const useCustomersStats = () => {
  return useQuery({
    queryKey: ["customers", "stats"],
    queryFn: customersApi.getStats,
    staleTime: 5 * 60 * 1000, // 5 minut
  });
};

// ===== MUTATIONS =====

/**
 * Hook do tworzebiania nowego klienta
 */
export const useCreateCustomer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateCustomerPayload) =>
      customersApi.createCustomer(data),
    onSuccess: () => {
      // Unieważnij cache listy klientów
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      // Unieważnij statystyki
      queryClient.invalidateQueries({ queryKey: ["customers", "stats"] });
    },
  });
};

/**
 * Hook do aktualizacji klienta
 */
export const useUpdateCustomer = (id: string | null | undefined) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateCustomerPayload) => {
      if (!id) throw new Error("Customer ID is required for update");
      return customersApi.updateCustomer(id, data);
    },
    onSuccess: () => {
      // Unieważnij cache dla tego klienta
      if (id) {
        queryClient.invalidateQueries({ queryKey: ["customers", id] });
      }
      // Unieważnij cache listy klientów
      queryClient.invalidateQueries({ queryKey: ["customers"] });
    },
  });
};

/**
 * Hook do usuwania klienta
 */
export const useDeleteCustomer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => customersApi.deleteCustomer(id),
    onSuccess: () => {
      // Unieważnij cache listy klientów
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      // Unieważnij statystyki
      queryClient.invalidateQueries({ queryKey: ["customers", "stats"] });
    },
  });
};
