export const VehicleStatus = {
  ACTIVE: "ACTIVE",
  SOLD: "SOLD",
  SCRAPPED: "SCRAPPED",
  INACTIVE: "INACTIVE",
} as const;

export type VehicleStatus = (typeof VehicleStatus)[keyof typeof VehicleStatus];

export const FuelType = {
  PETROL: "PETROL",
  DIESEL: "DIESEL",
  LPG: "LPG",
  ELECTRIC: "ELECTRIC",
  HYBRID: "HYBRID",
  PLUGIN_HYBRID: "PLUGIN_HYBRID",
} as const;

export type FuelType = (typeof FuelType)[keyof typeof FuelType];

export interface Vehicle {
  id: string;
  customerId: string;
  customer?: {
    id: string;
    type: "INDIVIDUAL" | "BUSINESS";
    firstName: string;
    lastName: string;
    companyName?: string;
    email?: string;
    phone: string;
    createdAt: string;
    updatedAt: string;
  };
  vin: string;
  brand: string;
  model: string;
  year: number;
  registrationNumber?: string;
  fuelType?: FuelType;
  engineCapacity?: number;
  enginePower?: number;
  mileage: number;
  color?: string;
  status: VehicleStatus;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateVehiclePayload {
  customerId: string;
  vin: string;
  brand: string;
  model: string;
  year: number;
  registrationNumber?: string;
  fuelType?: FuelType;
  engineCapacity?: number;
  enginePower?: number;
  mileage: number;
  color?: string;
  notes?: string;
}

export interface UpdateVehiclePayload {
  vin?: string;
  brand?: string;
  model?: string;
  year?: number;
  registrationNumber?: string;
  fuelType?: FuelType;
  engineCapacity?: number;
  enginePower?: number;
  mileage?: number;
  color?: string;
  status?: VehicleStatus;
  notes?: string;
}

export interface VehiclesListResponse {
  data: Vehicle[];
  total: number;
  page: number;
  limit: number;
}

export interface VehiclesStats {
  total: number;
  active: number;
  sold: number;
  scrapped: number;
  inactive: number;
}
