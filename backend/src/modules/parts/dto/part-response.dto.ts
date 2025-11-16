import { PartCategory, PartStatus } from '../entities/part.entity';

export class PartResponseDto {
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
  createdAt: Date;
  updatedAt: Date;
}
