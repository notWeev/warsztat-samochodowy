import { z } from "zod";
import { PartCategory } from "@/shared/types/part.types";

export const partSchema = z.object({
  partNumber: z.string().min(1, "Numer katalogowy jest wymagany").max(100),
  name: z.string().min(1, "Nazwa jest wymagana").max(200),
  description: z.string().optional(),
  category: z.nativeEnum(PartCategory, {
    errorMap: () => ({ message: "Wybierz kategorię" }),
  }),
  manufacturer: z.string().max(100).optional(),
  brand: z.string().max(100).optional(),
  purchasePrice: z
    .number({ invalid_type_error: "Podaj cenę zakupu" })
    .min(0, "Cena nie może być ujemna"),
  sellingPrice: z
    .number({ invalid_type_error: "Podaj cenę sprzedaży" })
    .min(0, "Cena nie może być ujemna"),
  quantityInStock: z.number({ invalid_type_error: "Podaj ilość" }).int().min(0),
  minStockLevel: z
    .number({ invalid_type_error: "Podaj minimalny stan" })
    .int()
    .min(0),
  location: z.string().max(50).optional(),
  supplier: z.string().optional(),
  supplierEmail: z
    .string()
    .email("Nieprawidłowy adres email")
    .optional()
    .or(z.literal("")),
  supplierPhone: z.string().optional(),
  compatibleVehicles: z.string().optional(),
  notes: z.string().optional(),
});

export type PartFormData = z.infer<typeof partSchema>;
