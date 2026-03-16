import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { ProtectedRoute } from "./ProtectedRoute";
import { UserRole, type User } from "../types/auth.types";

vi.mock("../../features/auth/context/AuthContext", () => ({
  useAuth: vi.fn(),
}));

import { useAuth } from "../../features/auth/context/AuthContext";

const mockUseAuth = vi.mocked(useAuth);

const mockUser = (role: UserRole): User => ({
  id: "user-1",
  email: "jan@example.com",
  firstName: "Jan",
  lastName: "Kowalski",
  role,
});

const renderWithRouter = (ui: React.ReactElement, { initialEntries = ["/protected"] } = {}) =>
  render(
    <MemoryRouter initialEntries={initialEntries}>
      <Routes>
        <Route path="/protected" element={ui} />
        <Route path="/login" element={<div>Login Page</div>} />
        <Route path="/unauthorized" element={<div>Unauthorized Page</div>} />
      </Routes>
    </MemoryRouter>
  );

describe("ProtectedRoute", () => {
  it("should show loading spinner when isLoading is true", () => {
    mockUseAuth.mockReturnValue({
      user: null,
      isLoading: true,
      isAuthenticated: false,
      login: vi.fn(),
      logout: vi.fn(),
      updateUser: vi.fn(),
    });

    renderWithRouter(
      <ProtectedRoute>
        <div>Protected Content</div>
      </ProtectedRoute>
    );

    expect(screen.queryByText("Protected Content")).not.toBeInTheDocument();
  });

  it("should redirect to /login when not authenticated", () => {
    mockUseAuth.mockReturnValue({
      user: null,
      isLoading: false,
      isAuthenticated: false,
      login: vi.fn(),
      logout: vi.fn(),
      updateUser: vi.fn(),
    });

    renderWithRouter(
      <ProtectedRoute>
        <div>Protected Content</div>
      </ProtectedRoute>
    );

    expect(screen.getByText("Login Page")).toBeInTheDocument();
    expect(screen.queryByText("Protected Content")).not.toBeInTheDocument();
  });

  it("should render children when authenticated without role restriction", () => {
    mockUseAuth.mockReturnValue({
      user: mockUser(UserRole.MECHANIC),
      isLoading: false,
      isAuthenticated: true,
      login: vi.fn(),
      logout: vi.fn(),
      updateUser: vi.fn(),
    });

    renderWithRouter(
      <ProtectedRoute>
        <div>Protected Content</div>
      </ProtectedRoute>
    );

    expect(screen.getByText("Protected Content")).toBeInTheDocument();
  });

  it("should render children when user has required role", () => {
    mockUseAuth.mockReturnValue({
      user: mockUser(UserRole.ADMIN),
      isLoading: false,
      isAuthenticated: true,
      login: vi.fn(),
      logout: vi.fn(),
      updateUser: vi.fn(),
    });

    renderWithRouter(
      <ProtectedRoute allowedRoles={[UserRole.ADMIN, UserRole.MANAGER]}>
        <div>Admin Content</div>
      </ProtectedRoute>
    );

    expect(screen.getByText("Admin Content")).toBeInTheDocument();
  });

  it("should redirect to /unauthorized when user lacks required role", () => {
    mockUseAuth.mockReturnValue({
      user: mockUser(UserRole.MECHANIC),
      isLoading: false,
      isAuthenticated: true,
      login: vi.fn(),
      logout: vi.fn(),
      updateUser: vi.fn(),
    });

    renderWithRouter(
      <ProtectedRoute allowedRoles={[UserRole.ADMIN]}>
        <div>Admin Only Content</div>
      </ProtectedRoute>
    );

    expect(screen.getByText("Unauthorized Page")).toBeInTheDocument();
    expect(screen.queryByText("Admin Only Content")).not.toBeInTheDocument();
  });

  it("should allow MANAGER to access ADMIN|MANAGER route", () => {
    mockUseAuth.mockReturnValue({
      user: mockUser(UserRole.MANAGER),
      isLoading: false,
      isAuthenticated: true,
      login: vi.fn(),
      logout: vi.fn(),
      updateUser: vi.fn(),
    });

    renderWithRouter(
      <ProtectedRoute allowedRoles={[UserRole.ADMIN, UserRole.MANAGER]}>
        <div>Manager Content</div>
      </ProtectedRoute>
    );

    expect(screen.getByText("Manager Content")).toBeInTheDocument();
  });
});
