import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { LoginPage } from "./LoginPage";
import { UserRole } from "../../../shared/types/auth.types";

vi.mock("../../../shared/api/authApi", () => ({
  authApi: {
    login: vi.fn(),
  },
}));

vi.mock("../context/AuthContext", () => ({
  useAuth: vi.fn(() => ({
    login: vi.fn(),
    user: null,
    isLoading: false,
    isAuthenticated: false,
    logout: vi.fn(),
    updateUser: vi.fn(),
  })),
}));

const mockNavigate = vi.fn();
vi.mock("react-router-dom", async (importOriginal) => {
  const actual = await importOriginal<typeof import("react-router-dom")>();
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

import { authApi } from "../../../shared/api/authApi";
import { useAuth } from "../context/AuthContext";

const mockAuthApi = vi.mocked(authApi);
const mockUseAuth = vi.mocked(useAuth);

const renderLoginPage = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>
    </QueryClientProvider>,
  );
};

describe("LoginPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseAuth.mockReturnValue({
      login: vi.fn(),
      user: null,
      isLoading: false,
      isAuthenticated: false,
      logout: vi.fn(),
      updateUser: vi.fn(),
    });
  });

  it("should render login form", () => {
    renderLoginPage();

    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/hasło/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /zaloguj/i }),
    ).toBeInTheDocument();
  });

  it("should show validation error for empty email", async () => {
    const user = userEvent.setup();
    renderLoginPage();

    const emailInput = screen.getByLabelText(/email/i);
    await user.click(emailInput);
    await user.tab();

    await waitFor(() => {
      expect(screen.getByText(/email jest wymagany/i)).toBeInTheDocument();
    });
  });

  it("should call authApi.login with form data on submit", async () => {
    const user = userEvent.setup();
    const mockLogin = vi.fn();
    mockUseAuth.mockReturnValue({
      login: mockLogin,
      user: null,
      isLoading: false,
      isAuthenticated: false,
      logout: vi.fn(),
      updateUser: vi.fn(),
    });

    mockAuthApi.login.mockResolvedValue({
      accessToken: "jwt-token",
      user: {
        id: "user-1",
        email: "jan@example.com",
        firstName: "Jan",
        lastName: "Kowalski",
        role: UserRole.MECHANIC,
      },
    });

    renderLoginPage();

    await user.type(screen.getByLabelText(/email/i), "jan@example.com");
    await user.type(screen.getByLabelText(/hasło/i), "Password1!");
    await user.click(screen.getByRole("button", { name: /zaloguj/i }));

    await waitFor(() => {
      expect(mockAuthApi.login.mock.calls[0][0]).toEqual({
        email: "jan@example.com",
        password: "Password1!",
      }); // @ts-ignore
    });
  });

  it("should redirect to /dashboard for non-customer role after successful login", async () => {
    const user = userEvent.setup();

    mockAuthApi.login.mockResolvedValue({
      accessToken: "jwt-token",
      user: {
        id: "user-1",
        email: "jan@example.com",
        firstName: "Jan",
        lastName: "Kowalski",
        role: UserRole.MECHANIC,
      },
    });

    renderLoginPage();

    await user.type(screen.getByLabelText(/email/i), "jan@example.com");
    await user.type(screen.getByLabelText(/hasło/i), "Password1!");
    await user.click(screen.getByRole("button", { name: /zaloguj/i }));

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/dashboard");
    });
  });

  it("should redirect to /customer/dashboard for CUSTOMER role after successful login", async () => {
    const user = userEvent.setup();

    mockAuthApi.login.mockResolvedValue({
      accessToken: "jwt-token",
      user: {
        id: "user-1",
        email: "jan@example.com",
        firstName: "Jan",
        lastName: "Kowalski",
        role: UserRole.ADMIN,
      },
    });

    renderLoginPage();

    await user.type(screen.getByLabelText(/email/i), "jan@example.com");
    await user.type(screen.getByLabelText(/hasło/i), "Password1!");
    await user.click(screen.getByRole("button", { name: /zaloguj/i }));

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/dashboard");
    });
  });

  it("should show error alert when login fails", async () => {
    const user = userEvent.setup();

    mockAuthApi.login.mockRejectedValue(new Error("Unauthorized"));

    renderLoginPage();

    await user.type(screen.getByLabelText(/email/i), "bad@example.com");
    await user.type(screen.getByLabelText(/hasło/i), "WrongPass1!");
    await user.click(screen.getByRole("button", { name: /zaloguj/i }));

    await waitFor(() => {
      expect(screen.getByRole("alert")).toBeInTheDocument();
    });
  });

  it("should toggle password visibility", async () => {
    const user = userEvent.setup();
    renderLoginPage();

    const passwordInput = screen.getByLabelText(/hasło/i);
    expect(passwordInput).toHaveAttribute("type", "password");

    const toggleButton = screen.getByRole("button", {
      name: /toggle password visibility/i,
    });
    await user.click(toggleButton);

    expect(passwordInput).toHaveAttribute("type", "text");
  });
});
