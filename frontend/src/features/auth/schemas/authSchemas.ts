import { z } from "zod";

export const loginSchema = z.object({
  email: z
    .string({
      error: (issue) =>
        issue.input === undefined
          ? "Email jest wymagany"
          : "Email musi być tekstem",
    })
    .min(1, "Email jest wymagany")
    .email(),
  password: z
    .string({
      error: (issue) =>
        issue.input === undefined
          ? "Hasło jest wymagane"
          : "Hasło musi być tekstem",
    })
    .min(1, "Hasło jest wymagane")
    .min(8, "Hasło musi mieć co najmniej 8 znaków"),
});

export const registerSchema = z
  .object({
    firstName: z
      .string({
        error: (issue) =>
          issue.input === undefined
            ? "Imię jest wymagane"
            : "Imię musi być tekstem",
      })
      .min(1, "Imię jest wymagane")
      .min(2, "Imię musi mieć co najmniej 2 znaki"),
    lastName: z
      .string({
        error: (issue) =>
          issue.input === undefined
            ? "Nazwisko jest wymagane"
            : "Nazwisko musi być tekstem",
      })
      .min(1, "Nazwisko jest wymagane")
      .min(2, "Nazwisko musi mieć co najmniej 2 znaki"),
    email: z
      .string({
        error: (issue) =>
          issue.input === undefined
            ? "Email jest wymagany"
            : "Email musi być tekstem",
      })
      .min(1, "Email jest wymagany")
      .email(),
    phone: z
      .string()
      .regex(
        /^(\+48)?[\s-]?\d{3}[\s-]?\d{3}[\s-]?\d{3}$/,
        "Nieprawidłowy numer telefonu",
      )
      .optional()
      .or(z.literal("")),
    password: z
      .string({
        error: (issue) =>
          issue.input === undefined
            ? "Hasło jest wymagane"
            : "Hasło musi być tekstem",
      })
      .min(8, "Hasło musi mieć co najmniej 8 znaków")
      .regex(/[A-Z]/, "Hasło musi zawierać co najmniej jedną wielką literę")
      .regex(/[a-z]/, "Hasło musi zawierać co najmniej jedną małą literę")
      .regex(/[0-9]/, "Hasło musi zawierać co najmniej jedną cyfrę")
      .regex(
        /[^A-Za-z0-9]/,
        "Hasło musi zawierać co najmniej jeden znak specjalny",
      ),
    confirmPassword: z
      .string({
        error: (issue) =>
          issue.input === undefined
            ? "Potwierdzenie hasła jest wymagane"
            : "Potwierdzenie hasła musi być tekstem",
      })
      .min(1, "Potwierdzenie hasła jest wymagane"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Hasła muszą być identyczne",
    path: ["confirmPassword"],
  });

export const resetPasswordSchema = z.object({
  email: z
    .string({
      error: (issue) =>
        issue.input === undefined
          ? "Email jest wymagany"
          : "Email musi być tekstem",
    })
    .min(1, "Email jest wymagany")
    .email(),
});

export const newPasswordSchema = z
  .object({
    password: z
      .string({
        error: (issue) =>
          issue.input === undefined
            ? "Hasło jest wymagane"
            : "Hasło musi być tekstem",
      })
      .min(8, "Hasło musi mieć co najmniej 8 znaków")
      .regex(/[A-Z]/, "Hasło musi zawierać co najmniej jedną wielką literę")
      .regex(/[a-z]/, "Hasło musi zawierać co najmniej jedną małą literę")
      .regex(/[0-9]/, "Hasło musi zawierać co najmniej jedną cyfrę")
      .regex(
        /[^A-Za-z0-9]/,
        "Hasło musi zawierać co najmniej jeden znak specjalny",
      ),
    confirmPassword: z
      .string({
        error: (issue) =>
          issue.input === undefined
            ? "Potwierdzenie hasła jest wymagane"
            : "Potwierdzenie hasła musi być tekstem",
      })
      .min(1, "Potwierdzenie hasła jest wymagane"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Hasła muszą być identyczne",
    path: ["confirmPassword"],
  });

export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;
export type NewPasswordFormData = z.infer<typeof newPasswordSchema>;
