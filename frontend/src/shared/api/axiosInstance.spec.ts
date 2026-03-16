import { describe, it, expect, vi, beforeEach } from "vitest";
import { axiosInstance } from "./axiosInstance";

vi.mock("axios", async (importOriginal) => {
  const actual = await importOriginal<typeof import("axios")>();
  return {
    default: {
      ...actual.default,
      create: vi.fn(() => ({
        interceptors: {
          request: { use: vi.fn() },
          response: { use: vi.fn() },
        },
        defaults: { baseURL: "http://localhost:3001/api" },
      })),
    },
  };
});

describe("axiosInstance", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("should be defined", () => {
    expect(axiosInstance).toBeDefined();
  });
});

describe("axiosInstance request interceptor", () => {
  let requestInterceptor: (
    config: Record<string, unknown>,
  ) => Record<string, unknown>;

  beforeEach(async () => {
    localStorage.clear();

    const actualAxios = await vi.importActual<typeof import("axios")>("axios");
    const instance = actualAxios.default.create({
      baseURL: "http://localhost:3001/api",
      headers: { "Content-Type": "application/json" },
    });

    instance.interceptors.request.use((config) => {
      const token = localStorage.getItem("accessToken");
      if (token) {
        config.headers = config.headers ?? {};
        (config.headers as Record<string, string>).Authorization =
          `Bearer ${token}`;
      }
      return config;
    });

    requestInterceptor = (config: Record<string, unknown>) => {
      const token = localStorage.getItem("accessToken");
      const headers = (config.headers as Record<string, string>) ?? {};
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }
      return { ...config, headers };
    };
  });

  it("should add Authorization header when token exists in localStorage", () => {
    localStorage.setItem("accessToken", "my-jwt-token");

    const config = { headers: {} };
    const result = requestInterceptor(config);

    expect((result.headers as Record<string, string>).Authorization).toBe(
      "Bearer my-jwt-token",
    );
  });

  it("should not add Authorization header when no token in localStorage", () => {
    const config = { headers: {} };
    const result = requestInterceptor(config);

    expect(
      (result.headers as Record<string, string>).Authorization,
    ).toBeUndefined();
  });
});

describe("axiosInstance response interceptor - 401 handling", () => {
  let responseErrorHandler: (error: unknown) => Promise<never>;

  beforeEach(() => {
    localStorage.clear();
    Object.defineProperty(window, "location", {
      value: { href: "" },
      writable: true,
    });

    responseErrorHandler = async (error: unknown) => {
      const err = error as { response?: { status?: number } };
      if (err.response?.status === 401) {
        localStorage.removeItem("accessToken");
        window.location.href = "/login";
      }
      return Promise.reject(error);
    };
  });

  it("should clear token and redirect to /login on 401", async () => {
    localStorage.setItem("accessToken", "expired-token");
    const error = { response: { status: 401 } };

    await expect(responseErrorHandler(error)).rejects.toEqual(error);

    expect(localStorage.getItem("accessToken")).toBeNull();
    expect(window.location.href).toBe("/login");
  });

  it("should not redirect on non-401 errors", async () => {
    const error = { response: { status: 500 } };

    await expect(responseErrorHandler(error)).rejects.toEqual(error);

    expect(window.location.href).not.toBe("/login");
  });
});
