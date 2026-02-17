import { z } from "zod";

// Wspólne pola dla obu typów
const baseFields = {
  email: z
    .string()
    .email("Nieprawidłowy adres email")
    .optional()
    .or(z.literal("")),
  phone: z
    .string()
    .regex(
      /^(\+48)?[\s-]?\d{3}[\s-]?\d{3}[\s-]?\d{3}$/,
      "Nieprawidłowy numer telefonu",
    ),
  street: z.string().max(100, "Ulica może mieć max 100 znaków").optional(),
  postalCode: z
    .string()
    .regex(/^\d{2}-\d{3}$/, "Kod pocztowy musi być w formacie XX-XXX")
    .optional()
    .or(z.literal("")),
  city: z.string().max(60, "Miasto może mieć max 60 znaków").optional(),
  notes: z.string().optional(),
};

// Schemat dla osoby prywatnej
export const individualCustomerSchema = z.object({
  type: z.literal("INDIVIDUAL"),
  firstName: z
    .string()
    .min(2, "Imię musi mieć co najmniej 2 znaki")
    .max(60, "Imię może mieć max 60 znaków"),
  lastName: z
    .string()
    .min(2, "Nazwisko musi mieć co najmniej 2 znaki")
    .max(60, "Nazwisko może mieć max 60 znaków"),
  pesel: z
    .string()
    .length(11, "PESEL musi mieć dokładnie 11 cyfr")
    .regex(/^\d{11}$/, "PESEL może zawierać tylko cyfry"),
  ...baseFields,
});

// Schemat dla firmy
export const businessCustomerSchema = z.object({
  type: z.literal("BUSINESS"),
  companyName: z
    .string()
    .min(3, "Nazwa firmy musi mieć co najmniej 3 znaki")
    .max(200, "Nazwa firmy może mieć max 200 znaków"),
  firstName: z
    .string()
    .min(2, "Imię musi mieć co najmniej 2 znaki")
    .max(60, "Imię może mieć max 60 znaków")
    .optional()
    .or(z.literal("")),
  lastName: z
    .string()
    .min(2, "Nazwisko musi mieć co najmniej 2 znaki")
    .max(60, "Nazwisko może mieć max 60 znaków")
    .optional()
    .or(z.literal("")),
  nip: z
    .string()
    .length(10, "NIP musi mieć dokładnie 10 cyfr")
    .regex(/^\d{10}$/, "NIP może zawierać tylko cyfry"),
  ...baseFields,
});

// Połączony schemat z walidacją discriminated union
export const customerSchema = z.discriminatedUnion("type", [
  individualCustomerSchema,
  businessCustomerSchema,
]);

// Typy wnioskowane ze schematów
export type IndividualCustomerFormData = z.infer<
  typeof individualCustomerSchema
>;
export type BusinessCustomerFormData = z.infer<typeof businessCustomerSchema>;
export type CustomerFormData = z.infer<typeof customerSchema>;
