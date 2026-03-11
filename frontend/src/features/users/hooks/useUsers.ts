import {
  useMutation,
  useQuery,
  useQueryClient,
  keepPreviousData,
} from "@tanstack/react-query";
import { usersApi } from "@/shared/api/usersApi";
import type {
  CreateUserPayload,
  UpdateUserPayload,
  UsersListParams,
} from "@/shared/types/user.types";

export const useUsers = (params: UsersListParams = {}) =>
  useQuery({
    queryKey: ["users", "list", params],
    queryFn: () => usersApi.getUsers(params),
    staleTime: 2 * 60 * 1000,
    placeholderData: keepPreviousData,
  });

export const useUser = (id: string) =>
  useQuery({
    queryKey: ["users", id],
    queryFn: () => usersApi.getUser(id),
    staleTime: 2 * 60 * 1000,
    enabled: !!id,
  });

export const useCreateUser = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateUserPayload) => usersApi.createUser(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["users"] });
    },
  });
};

export const useUpdateUser = (id: string | null | undefined) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateUserPayload) => {
      if (!id) throw new Error("User ID is required");
      return usersApi.updateUser(id, data);
    },
    onSuccess: () => {
      if (id) qc.invalidateQueries({ queryKey: ["users", id] });
      qc.invalidateQueries({ queryKey: ["users", "list"] });
    },
  });
};

export const useDeleteUser = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => usersApi.deleteUser(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["users"] });
    },
  });
};
