import type { UserRole } from "./auth.types";

export type UserStatus = "ACTIVE" | "INACTIVE" | "SUSPENDED";

export const USER_STATUS_LABELS: Record<UserStatus, string> = {
  ACTIVE: "Aktywny",
  INACTIVE: "Nieaktywny",
  SUSPENDED: "Zawieszony",
};

export const USER_STATUS_COLORS: Record<
  UserStatus,
  "success" | "default" | "error"
> = {
  ACTIVE: "success",
  INACTIVE: "default",
  SUSPENDED: "error",
};

export const USER_ROLE_LABELS: Record<UserRole, string> = {
  ADMIN: "Administrator",
  MANAGER: "Kierownik",
  MECHANIC: "Mechanik",
  RECEPTION: "Recepcja",
};

export const USER_ROLE_COLORS: Record<
  UserRole,
  "error" | "warning" | "primary" | "info"
> = {
  ADMIN: "error",
  MANAGER: "warning",
  MECHANIC: "primary",
  RECEPTION: "info",
};

export interface StaffUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  role: UserRole;
  status: UserStatus;
  emailVerified: boolean;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserPayload {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  password: string;
  role: UserRole;
}

export interface UpdateUserPayload {
  firstName?: string;
  lastName?: string;
  phone?: string;
  role?: UserRole;
  status?: UserStatus;
  emailVerified?: boolean;
}

export interface UsersListParams {
  page?: number;
  limit?: number;
  role?: string;
  status?: string;
}

export interface PaginatedUsers {
  data: StaffUser[];
  total: number;
  page: number;
  limit: number;
}

export interface UsersStats {
  total: number;
  active: number;
  inactive: number;
  suspended: number;
  byRole: Record<UserRole, number>;
}
