import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:3001/api";

export const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor - dodaje token do każdego zapytania
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Response interceptor - obsługa błędów i refresh tokena
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Jeśli 401 i nie próbowaliśmy jeszcze odświeżyć tokena
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem("refreshToken");
        if (!refreshToken) {
          throw new Error("No refresh token");
        }

        // Wywołaj endpoint do odświeżenia tokena (gdy będzie zaimplementowany)
        const { data } = await axios.post(`${API_BASE_URL}/auth/refresh`, {
          refreshToken,
        });

        localStorage.setItem("accessToken", data.accessToken);

        // Ponów oryginalne zapytanie z nowym tokenem
        originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        // Jeśli refresh się nie udał, wyloguj użytkownika
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);
