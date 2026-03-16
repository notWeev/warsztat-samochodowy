import { describe, it, expect, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { UserForm } from "./UserForm";
import type { StaffUser } from "@/shared/types/user.types";
import { UserRole } from "@/shared/types/auth.types";

const mockOnSubmit = vi.fn();
const mockOnCancel = vi.fn();

const mockUser: StaffUser = {
  id: "user-1",
  firstName: "Jan",
  lastName: "Kowalski",
  email: "jan@example.com",
  phone: "123456789",
  role: UserRole.MECHANIC,
  status: "ACTIVE",
  emailVerified: true,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

describe("UserForm — Create mode", () => {
  it("should render create form fields", () => {
    render(<UserForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

    expect(screen.getByLabelText(/imię/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/nazwisko/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/hasło/i)).toBeInTheDocument();
  });

  it('should render "Dodaj pracownika" submit button in create mode', () => {
    render(<UserForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

    expect(
      screen.getByRole("button", { name: /dodaj pracownika/i }),
    ).toBeInTheDocument();
  });

  it("should show validation errors when submitting empty form", async () => {
    const user = userEvent.setup();
    render(<UserForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

    await user.click(screen.getByRole("button", { name: /dodaj pracownika/i }));

    await waitFor(() => {
      expect(
        screen.getByText(/imię musi mieć co najmniej/i),
      ).toBeInTheDocument();
    });
  });

  it("should show password validation error for weak password", async () => {
    const user = userEvent.setup();
    render(<UserForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

    const passwordInput = screen.getByLabelText(/hasło/i);
    await user.type(passwordInput, "weak");
    await user.tab();

    await waitFor(() => {
      expect(
        screen.getByText(/hasło musi mieć co najmniej 8 znaków/i),
      ).toBeInTheDocument();
    });
  });

  it("should call onCancel when cancel button is clicked", async () => {
    const user = userEvent.setup();
    render(<UserForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

    await user.click(screen.getByRole("button", { name: /anuluj/i }));

    expect(mockOnCancel).toHaveBeenCalledOnce();
  });

  it("should disable submit button when isLoading is true", () => {
    render(
      <UserForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} isLoading />,
    );

    expect(
      screen.getByRole("button", { name: /dodaj pracownika/i }),
    ).toBeDisabled();
  });
});

describe("UserForm — Edit mode", () => {
  it("should pre-fill form fields with user data", () => {
    render(
      <UserForm
        user={mockUser}
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />,
    );

    expect(screen.getByDisplayValue("Jan")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Kowalski")).toBeInTheDocument();
    expect(screen.getByDisplayValue("123456789")).toBeInTheDocument();
  });

  it('should render "Zapisz" submit button in edit mode', () => {
    render(
      <UserForm
        user={mockUser}
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />,
    );

    expect(screen.getByRole("button", { name: /zapisz/i })).toBeInTheDocument();
  });

  it("should not render password field in edit mode", () => {
    render(
      <UserForm
        user={mockUser}
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />,
    );

    expect(screen.queryByLabelText(/hasło/i)).not.toBeInTheDocument();
  });
});
