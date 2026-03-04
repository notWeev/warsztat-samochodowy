import type {
  ServiceOrderStatus,
  ServiceOrderPriority,
} from "@/shared/types/service-order.types";

export const STATUS_LABELS: Record<ServiceOrderStatus, string> = {
  PENDING: "Oczekujące",
  SCHEDULED: "Zaplanowane",
  IN_PROGRESS: "W realizacji",
  WAITING_FOR_PARTS: "Czeka na części",
  COMPLETED: "Ukończone",
  CLOSED: "Zamknięte",
  CANCELLED: "Anulowane",
};

export const STATUS_COLORS: Record<
  ServiceOrderStatus,
  "default" | "primary" | "secondary" | "error" | "info" | "success" | "warning"
> = {
  PENDING: "default",
  SCHEDULED: "info",
  IN_PROGRESS: "primary",
  WAITING_FOR_PARTS: "warning",
  COMPLETED: "success",
  CLOSED: "secondary",
  CANCELLED: "error",
};

export const PRIORITY_LABELS: Record<ServiceOrderPriority, string> = {
  LOW: "Niski",
  NORMAL: "Normalny",
  HIGH: "Wysoki",
  URGENT: "Pilny",
};

export const PRIORITY_COLORS: Record<
  ServiceOrderPriority,
  "default" | "primary" | "error" | "warning"
> = {
  LOW: "default",
  NORMAL: "primary",
  HIGH: "warning",
  URGENT: "error",
};

export const formatCurrency = (value: number | string): string => {
  const n = typeof value === "string" ? parseFloat(value) : value;
  return new Intl.NumberFormat("pl-PL", {
    style: "currency",
    currency: "PLN",
  }).format(n || 0);
};

export const formatDate = (dateStr?: string | Date | null): string => {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("pl-PL", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

export const formatDateTime = (dateStr?: string | Date | null): string => {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleString("pl-PL", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

// Status transitions - what's allowed from each status
export const ALLOWED_TRANSITIONS: Record<
  ServiceOrderStatus,
  ServiceOrderStatus[]
> = {
  PENDING: ["SCHEDULED", "IN_PROGRESS", "CANCELLED"],
  SCHEDULED: ["IN_PROGRESS", "CANCELLED"],
  IN_PROGRESS: ["WAITING_FOR_PARTS", "COMPLETED", "CANCELLED"],
  WAITING_FOR_PARTS: ["IN_PROGRESS", "CANCELLED"],
  COMPLETED: ["CLOSED", "IN_PROGRESS"],
  CLOSED: [],
  CANCELLED: [],
};
