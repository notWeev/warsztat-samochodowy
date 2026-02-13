export interface DashboardStats {
  total: number; 
  pending: number;
  inProgress: number;
  completed: number;
  closed: number;
  cancelled: number;
}

export interface RecentOrder {
  id: string;
  orderNumber: string;
  customer: {
    firstName: string;
    lastName: string;
  };
  vehicle: {
    brand: string;
    model: string;
    year: number;
  };
  status: string;
  priority: string;
  totalCost: number; 
  laborCost: number;
  partsCost: number;
  createdAt: string;
}
