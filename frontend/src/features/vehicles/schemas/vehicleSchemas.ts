import { z } from "zod";

// Enums
const fuelTypeEnum = z.enum([
  "PETROL",
  "DIESEL",
  "LPG",
  "ELECTRIC",
  "HYBRID",
  "PLUGIN_HYBRID",
]);

const vehicleStatusEnum = z.enum(["ACTIVE", "SOLD", "SCRAPPED", "INACTIVE"]);

// Schemat tworzenia pojazdu
export const createVehicleSchema = z.object({
  customerId: z
    .string()
    .uuid("Nieprawidłowy format ID klienta")
    .min(1, "ID klienta jest wymagane"),
  vin: z
    .string()
    .length(17, "VIN musi mieć dokładnie 17 znaków")
    .regex(
      /^[A-HJ-NPR-Z0-9]{17}$/,
      "VIN może zawierać tylko cyfry i wielkie litery (bez I, O, Q)",
    )
    .toUpperCase(),
  brand: z
    .string()
    .min(2, "Marka musi mieć minimum 2 znaki")
    .max(50, "Marka może mieć max 50 znaków"),
  model: z
    .string()
    .min(1, "Model jest wymagany")
    .max(50, "Model może mieć max 50 znaków"),
  year: z.coerce
    .number()
    .int("Rok musi być liczbą całkowitą")
    .min(1900, "Rok produkcji nie może być wcześniejszy niż 1900")
    .max(
      new Date().getFullYear() + 1,
      "Rok produkcji nie może być z przyszłości",
    ),
  registrationNumber: z
    .string()
    .regex(
      /^[A-Z0-9]{2,15}$/,
      "Numer rejestracyjny może zawierać tylko wielkie litery i cyfry (2-15 znaków)",
    )
    .optional()
    .or(z.literal("")),
  fuelType: fuelTypeEnum.optional(),
  engineCapacity: z
    .union([z.string(), z.number()])
    .transform((val): number | undefined => {
      if (val === "" || val === null || val === undefined) return undefined;
      const num = typeof val === "string" ? parseInt(val, 10) : val;
      return isNaN(num) ? undefined : num;
    })
    .optional()
    .refine(
      (val) =>
        val === undefined ||
        (Number.isInteger(val) && val >= 50 && val <= 10000),
      "Pojemność silnika musi być liczbą całkowitą od 50 do 10000 cm³",
    ) as any,
  enginePower: z
    .union([z.string(), z.number()])
    .transform((val): number | undefined => {
      if (val === "" || val === null || val === undefined) return undefined;
      const num = typeof val === "string" ? parseInt(val, 10) : val;
      return isNaN(num) ? undefined : num;
    })
    .optional()
    .refine(
      (val) =>
        val === undefined || (Number.isInteger(val) && val >= 1 && val <= 2000),
      "Moc silnika musi być liczbą całkowitą od 1 do 2000 KM",
    ) as any,
  mileage: z.coerce
    .number()
    .int("Przebieg musi być liczbą całkowitą")
    .min(0, "Przebieg nie może być ujemny"),
  color: z
    .string()
    .max(30, "Kolor może mieć max 30 znaków")
    .optional()
    .or(z.literal("")),
  notes: z.string().optional().or(z.literal("")),
});

// Schemat aktualizacji pojazdu
export const updateVehicleSchema = z.object({
  vin: z
    .string()
    .length(17, "VIN musi mieć dokładnie 17 znaków")
    .regex(
      /^[A-HJ-NPR-Z0-9]{17}$/,
      "VIN może zawierać tylko cyfry i wielkie litery (bez I, O, Q)",
    )
    .toUpperCase()
    .optional(),
  brand: z
    .string()
    .min(2, "Marka musi mieć minimum 2 znaki")
    .max(50, "Marka może mieć max 50 znaków")
    .optional(),
  model: z
    .string()
    .min(1, "Model jest wymagany")
    .max(50, "Model może mieć max 50 znaków")
    .optional(),
  year: z.coerce
    .number()
    .int("Rok musi być liczbą całkowitą")
    .min(1900, "Rok produkcji nie może być wcześniejszy niż 1900")
    .max(
      new Date().getFullYear() + 1,
      "Rok produkcji nie może być z przyszłości",
    )
    .optional(),
  registrationNumber: z
    .string()
    .regex(
      /^[A-Z0-9]{2,15}$/,
      "Numer rejestracyjny może zawierać tylko wielkie litery i cyfry (2-15 znaków)",
    )
    .optional()
    .or(z.literal("")),
  fuelType: fuelTypeEnum.optional(),
  engineCapacity: z
    .union([z.string(), z.number()])
    .transform((val): number | undefined => {
      if (val === "" || val === null || val === undefined) return undefined;
      const num = typeof val === "string" ? parseInt(val, 10) : val;
      return isNaN(num) ? undefined : num;
    })
    .optional()
    .refine(
      (val) =>
        val === undefined ||
        (Number.isInteger(val) && val >= 50 && val <= 10000),
      "Pojemność silnika musi być liczbą całkowitą od 50 do 10000 cm³",
    ) as any,
  enginePower: z
    .union([z.string(), z.number()])
    .transform((val): number | undefined => {
      if (val === "" || val === null || val === undefined) return undefined;
      const num = typeof val === "string" ? parseInt(val, 10) : val;
      return isNaN(num) ? undefined : num;
    })
    .optional()
    .refine(
      (val) =>
        val === undefined || (Number.isInteger(val) && val >= 1 && val <= 2000),
      "Moc silnika musi być liczbą całkowitą od 1 do 2000 KM",
    ) as any,
  mileage: z.coerce
    .number()
    .int("Przebieg musi być liczbą całkowitą")
    .min(0, "Przebieg nie może być ujemny")
    .optional(),
  color: z
    .string()
    .max(30, "Kolor może mieć max 30 znaków")
    .optional()
    .or(z.literal("")),
  status: vehicleStatusEnum.optional(),
  notes: z.string().optional().or(z.literal("")),
});

// Typy wnioskowane ze schematów
export type CreateVehicleFormData = z.infer<typeof createVehicleSchema>;
export type UpdateVehicleFormData = z.infer<typeof updateVehicleSchema>;

// Type-safe form data types with correct number types
export type VehicleFormData = {
  customerId: string;
  vin: string;
  brand: string;
  model: string;
  year: number;
  registrationNumber?: string;
  fuelType?:
    | "PETROL"
    | "DIESEL"
    | "LPG"
    | "ELECTRIC"
    | "HYBRID"
    | "PLUGIN_HYBRID";
  engineCapacity?: number | undefined;
  enginePower?: number | undefined;
  mileage: number;
  color?: string;
  notes?: string;
} & Record<string, any>;
