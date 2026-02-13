import { axiosInstance } from "./axiosInstance";
import type {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  ResetPasswordRequest,
  ConfirmResetPasswordRequest,
  User,
} from "../types/auth.types";

export const authApi = {
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    const { data } = await axiosInstance.post<LoginResponse>(
      "/auth/login",
      credentials,
    );
    return data;
  },

  register: async (userData: RegisterRequest): Promise<LoginResponse> => {
    const { data } = await axiosInstance.post<LoginResponse>(
      "/auth/register",
      userData,
    );
    return data;
  },

  logout: async (): Promise<void> => {
    await axiosInstance.post("/auth/logout");
  },

  resetPassword: async (
    email: ResetPasswordRequest,
  ): Promise<{ message: string }> => {
    const { data } = await axiosInstance.post("/auth/reset-password", email);
    return data;
  },

  confirmResetPassword: async (
    payload: ConfirmResetPasswordRequest,
  ): Promise<{ message: string }> => {
    const { data } = await axiosInstance.post(
      "/auth/confirm-reset-password",
      payload,
    );
    return data;
  },

  getCurrentUser: async (): Promise<User> => {
    const { data } = await axiosInstance.get<User>("/auth/me");
    return data;
  },
};
