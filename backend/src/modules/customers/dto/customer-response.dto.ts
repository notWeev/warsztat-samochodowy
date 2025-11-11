import { CustomerType } from '../entities/customer.entity';

export class CustomerResponseDto {
  id: string;
  type: CustomerType;
  firstName: string;
  lastName: string;
  email?: string;
  phone: string;
  street?: string;
  postalCode?: string;
  city?: string;
  pesel?: string;
  nip?: string;
  companyName?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}
