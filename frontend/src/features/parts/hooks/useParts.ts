import {
  useMutation,
  useQuery,
  useQueryClient,
  keepPreviousData,
} from "@tanstack/react-query";
import { partsApi } from "@/shared/api/partsApi";
import type {
  CreatePartPayload,
  UpdatePartPayload,
  PartsListParams,
} from "@/shared/types/part.types";

// ===== QUERIES =====

export const useParts = (params: PartsListParams = {}) => {
  return useQuery({
    queryKey: ["parts", params],
    queryFn: () => partsApi.getParts(params),
    staleTime: 2 * 60 * 1000,
    placeholderData: keepPreviousData,
  });
};

export const usePart = (id: string) => {
  return useQuery({
    queryKey: ["parts", id],
    queryFn: () => partsApi.getPart(id),
    staleTime: 2 * 60 * 1000,
    enabled: !!id,
  });
};

export const usePartsStats = () => {
  return useQuery({
    queryKey: ["parts", "stats"],
    queryFn: partsApi.getStats,
    staleTime: 5 * 60 * 1000,
  });
};

// ===== MUTATIONS =====

export const useCreatePart = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreatePartPayload) => partsApi.createPart(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["parts"] });
    },
  });
};

export const useUpdatePart = (id: string | null | undefined) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdatePartPayload) => {
      if (!id) throw new Error("Part ID is required for update");
      return partsApi.updatePart(id, data);
    },
    onSuccess: () => {
      if (id) {
        queryClient.invalidateQueries({ queryKey: ["parts", id] });
      }
      queryClient.invalidateQueries({ queryKey: ["parts"] });
    },
  });
};

export const useDeletePart = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => partsApi.deletePart(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["parts"] });
    },
  });
};
