import { z } from "zod";

const priorityEnum = z.enum(["LOW", "NORMAL", "HIGH", "URGENT"]);
const statusEnum = z.enum([
  "PENDING",
  "SCHEDULED",
  "IN_PROGRESS",
  "WAITING_FOR_PARTS",
  "COMPLETED",
  "CLOSED",
  "CANCELLED",
]);

export const step1Schema = z.object({
  customerId: z.string().uuid("Wybierz klienta").min(1, "Klient jest wymagany"),
  vehicleId: z.string().uuid("Wybierz pojazd").min(1, "Pojazd jest wymagany"),
});

export const step2Schema = z.object({
  description: z
    .string()
    .min(10, "Opis musi mieć minimum 10 znaków")
    .max(2000, "Opis może mieć maksymalnie 2000 znaków"),
  priority: priorityEnum.default("NORMAL"),
  scheduledAt: z.string().optional().or(z.literal("")),
  mileageAtAcceptance: z.coerce
    .number()
    .int()
    .min(0, "Przebieg nie może być ujemny")
    .optional()
    .or(z.literal("")),
  internalNotes: z.string().max(1000).optional().or(z.literal("")),
});

export const step3Schema = z.object({
  assignedMechanicId: z.string().uuid().optional().or(z.literal("")),
});

export const createServiceOrderSchema = step1Schema
  .merge(step2Schema)
  .merge(step3Schema);

export const updateServiceOrderSchema = z.object({
  description: z.string().min(10).max(2000).optional(),
  priority: priorityEnum.optional(),
  status: statusEnum.optional(),
  scheduledAt: z.string().optional().or(z.literal("")),
  assignedMechanicId: z.string().uuid().optional().or(z.literal("")),
  laborCost: z.coerce.number().min(0).optional().or(z.literal("")),
  mechanicNotes: z.string().max(2000).optional().or(z.literal("")),
  internalNotes: z.string().max(1000).optional().or(z.literal("")),
});

export const addPartSchema = z.object({
  partId: z.string().uuid("Wybierz część"),
  quantity: z.coerce
    .number()
    .int("Ilość musi być liczbą całkowitą")
    .min(1, "Ilość musi być większa niż 0"),
  unitPrice: z.coerce.number().min(0).optional().or(z.literal("")),
  notes: z.string().max(500).optional().or(z.literal("")),
});

export type CreateServiceOrderFormData = z.infer<
  typeof createServiceOrderSchema
>;
export type UpdateServiceOrderFormData = z.infer<
  typeof updateServiceOrderSchema
>;
export type Step1Data = z.infer<typeof step1Schema>;
export type Step2Data = z.infer<typeof step2Schema>;
export type Step3Data = z.infer<typeof step3Schema>;
export type AddPartFormData = z.infer<typeof addPartSchema>;
