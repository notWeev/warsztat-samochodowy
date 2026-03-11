import { z } from "zod";

export const createUserSchema = z.object({
  firstName: z.string().min(2, "Imię musi mieć co najmniej 2 znaki"),
  lastName: z.string().min(2, "Nazwisko musi mieć co najmniej 2 znaki"),
  email: z.string().email("Nieprawidłowy adres email"),
  phone: z.string().optional(),
  password: z
    .string()
    .min(8, "Hasło musi mieć co najmniej 8 znaków")
    .regex(/[A-Z]/, "Hasło musi zawierać wielką literę")
    .regex(/[0-9]/, "Hasło musi zawierać cyfrę")
    .regex(/[!@#$%^&*]/, "Hasło musi zawierać znak specjalny (!@#$%^&*)"),
  role: z.enum(["ADMIN", "MANAGER", "MECHANIC", "RECEPTION"]),
});

export const updateUserSchema = z.object({
  firstName: z.string().min(2, "Imię musi mieć co najmniej 2 znaki").optional(),
  lastName: z
    .string()
    .min(2, "Nazwisko musi mieć co najmniej 2 znaki")
    .optional(),
  phone: z.string().optional(),
  role: z.enum(["ADMIN", "MANAGER", "MECHANIC", "RECEPTION"]).optional(),
  status: z.enum(["ACTIVE", "INACTIVE", "SUSPENDED"]).optional(),
  emailVerified: z.boolean().optional(),
});

export type CreateUserFormData = z.infer<typeof createUserSchema>;
export type UpdateUserFormData = z.infer<typeof updateUserSchema>;
