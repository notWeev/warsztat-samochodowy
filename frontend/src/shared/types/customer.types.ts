export const CustomerType = {
  INDIVIDUAL: "INDIVIDUAL",
  BUSINESS: "BUSINESS",
} as const;

export type CustomerType = (typeof CustomerType)[keyof typeof CustomerType];

// Typ klienta (osoba prywatna)
export interface IndividualCustomer {
  id: string;
  type: "INDIVIDUAL";
  firstName: string;
  lastName: string;
  email?: string;
  phone: string;
  street?: string;
  postalCode?: string;
  city?: string;
  pesel: string;
  nip?: never;
  companyName?: never;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// Typ klienta (firma)
export interface BusinessCustomer {
  id: string;
  type: "BUSINESS";
  companyName: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone: string;
  street?: string;
  postalCode?: string;
  city?: string;
  pesel?: never;
  nip: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export type Customer = IndividualCustomer | BusinessCustomer;

export interface CreateCustomerPayload {
  type: CustomerType;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone: string;
  street?: string;
  postalCode?: string;
  city?: string;
  pesel?: string;
  nip?: string;
  companyName?: string;
  notes?: string;
}

export interface UpdateCustomerPayload extends CreateCustomerPayload {}

export interface CustomersListResponse {
  data: Customer[];
  total: number;
  page: number;
  limit: number;
}

export interface CustomersStats {
  total: number;
  individual: number;
  business: number;
}

export interface CustomerDetailsContext {
  customer: Customer | null;
  vehicles: any[];
  orders: any[];
  isLoading: boolean;
}
