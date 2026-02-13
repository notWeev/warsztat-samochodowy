import { axiosInstance } from "./axiosInstance";
import type {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  ResetPasswordRequest,
  ConfirmResetPasswordRequest,
  User,
} from "../types/auth.types";

// Helper do konwersji snake_case na camelCase
const toCamelCase = (obj: any): LoginResponse => {
  return {
    accessToken: obj.access_token,
    user: obj.user,
  };
};

export const authApi = {
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    const { data } = await axiosInstance.post("/auth/login", credentials);
    return toCamelCase(data);
  },

  register: async (userData: RegisterRequest): Promise<LoginResponse> => {
    const { data } = await axiosInstance.post("/auth/register", userData);
    return toCamelCase(data);
  },

  logout: async (): Promise<void> => {
    localStorage.removeItem("accessToken");
  },

  resetPassword: async (
    email: ResetPasswordRequest,
  ): Promise<{ message: string }> => {
    const { data } = await axiosInstance.post("/auth/forgot-password", email);
    return data;
  },

  confirmResetPassword: async (
    payload: ConfirmResetPasswordRequest,
  ): Promise<{ message: string }> => {
    const { data } = await axiosInstance.post("/auth/reset-password", {
      token: payload.token,
      newPassword: payload.newPassword,
    });
    return data;
  },

  getCurrentUser: async (): Promise<User> => {
    const { data } = await axiosInstance.get("/auth/profile");
    return data.user;
  },
};
