export const PartCategory = {
  ENGINE: "ENGINE",
  BRAKES: "BRAKES",
  SUSPENSION: "SUSPENSION",
  ELECTRICAL: "ELECTRICAL",
  TRANSMISSION: "TRANSMISSION",
  EXHAUST: "EXHAUST",
  FILTERS: "FILTERS",
  FLUIDS: "FLUIDS",
  TIRES: "TIRES",
  BODYWORK: "BODYWORK",
  INTERIOR: "INTERIOR",
  OTHER: "OTHER",
} as const;
export type PartCategory = (typeof PartCategory)[keyof typeof PartCategory];

export const PartStatus = {
  AVAILABLE: "AVAILABLE",
  LOW_STOCK: "LOW_STOCK",
  OUT_OF_STOCK: "OUT_OF_STOCK",
  DISCONTINUED: "DISCONTINUED",
} as const;
export type PartStatus = (typeof PartStatus)[keyof typeof PartStatus];

export interface Part {
  id: string;
  partNumber: string;
  name: string;
  description?: string;
  category: PartCategory;
  manufacturer?: string;
  brand?: string;
  purchasePrice: number;
  sellingPrice: number;
  quantityInStock: number;
  minStockLevel: number;
  location?: string;
  status: PartStatus;
  supplier?: string;
  supplierEmail?: string;
  supplierPhone?: string;
  compatibleVehicles?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PartsListResponse {
  data: Part[];
  total: number;
  page: number;
  limit: number;
}

export interface PartsStats {
  total: number;
  available: number;
  lowStock: number;
  outOfStock: number;
  discontinued: number;
  totalValue: number;
}

export interface PartsListParams {
  page?: number;
  limit?: number;
  search?: string;
  category?: PartCategory;
  status?: PartStatus;
  lowStock?: boolean;
}

export interface CreatePartPayload {
  partNumber: string;
  name: string;
  description?: string;
  category: PartCategory;
  manufacturer?: string;
  brand?: string;
  purchasePrice: number;
  sellingPrice: number;
  quantityInStock?: number;
  minStockLevel?: number;
  location?: string;
  supplier?: string;
  supplierEmail?: string;
  supplierPhone?: string;
  compatibleVehicles?: string;
  notes?: string;
}

export type UpdatePartPayload = Partial<CreatePartPayload>;
