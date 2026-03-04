import type { Vehicle } from "./vehicle.types";
import type { Customer } from "./customer.types";

// ─── Enums ────────────────────────────────────────────────────────────────────

export const ServiceOrderStatus = {
  PENDING: "PENDING",
  SCHEDULED: "SCHEDULED",
  IN_PROGRESS: "IN_PROGRESS",
  WAITING_FOR_PARTS: "WAITING_FOR_PARTS",
  COMPLETED: "COMPLETED",
  CLOSED: "CLOSED",
  CANCELLED: "CANCELLED",
} as const;
export type ServiceOrderStatus =
  (typeof ServiceOrderStatus)[keyof typeof ServiceOrderStatus];

export const ServiceOrderPriority = {
  LOW: "LOW",
  NORMAL: "NORMAL",
  HIGH: "HIGH",
  URGENT: "URGENT",
} as const;
export type ServiceOrderPriority =
  (typeof ServiceOrderPriority)[keyof typeof ServiceOrderPriority];

// ─── Mechanic (embedded user info) ───────────────────────────────────────────

export interface Mechanic {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  role: string;
}

// ─── Part in order ────────────────────────────────────────────────────────────

export interface OrderPart {
  id: string;
  serviceOrderId: string;
  partId: string;
  part?: {
    id: string;
    partNumber: string;
    name: string;
    sellingPrice: number;
    quantityInStock: number;
  };
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  notes?: string;
  createdAt: string;
}

// ─── Service Order ────────────────────────────────────────────────────────────

export interface ServiceOrder {
  id: string;
  orderNumber: string;
  customerId: string;
  customer?: Customer;
  vehicleId: string;
  vehicle?: Vehicle;
  assignedMechanicId?: string;
  assignedMechanic?: Mechanic;
  description: string;
  status: ServiceOrderStatus;
  priority: ServiceOrderPriority;
  scheduledAt?: string;
  startedAt?: string;
  completedAt?: string;
  closedAt?: string;
  mileageAtAcceptance?: number;
  laborCost: number;
  partsCost: number;
  totalCost: number;
  mechanicNotes?: string;
  internalNotes?: string;
  parts?: OrderPart[];
  createdAt: string;
  updatedAt: string;
}

// ─── List response ────────────────────────────────────────────────────────────

export interface ServiceOrdersListResponse {
  data: ServiceOrder[];
  total: number;
  page: number;
  limit: number;
}

// ─── Stats ───────────────────────────────────────────────────────────────────

export interface ServiceOrdersStats {
  total: number;
  pending: number;
  inProgress: number;
  completed: number;
  closed: number;
  cancelled: number;
}

// ─── Payloads ─────────────────────────────────────────────────────────────────

export interface CreateServiceOrderPayload {
  customerId: string;
  vehicleId: string;
  assignedMechanicId?: string;
  description: string;
  priority?: ServiceOrderPriority;
  scheduledAt?: string;
  mileageAtAcceptance?: number;
  internalNotes?: string;
}

export interface UpdateServiceOrderPayload {
  assignedMechanicId?: string;
  description?: string;
  priority?: ServiceOrderPriority;
  status?: ServiceOrderStatus;
  scheduledAt?: string;
  startedAt?: string;
  completedAt?: string;
  closedAt?: string;
  mileageAtAcceptance?: number;
  laborCost?: number;
  partsCost?: number;
  mechanicNotes?: string;
  internalNotes?: string;
}

export interface AddPartToOrderPayload {
  partId: string;
  quantity: number;
  unitPrice?: number;
  notes?: string;
}

export interface UpdateOrderPartPayload {
  quantity?: number;
  unitPrice?: number;
  notes?: string;
}
