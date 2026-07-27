export type ReservationStatus = 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';

export interface Customer {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  licenseNumber: string;
  licenseVerified: boolean;
  status: 'active' | 'suspended';
  totalRentals?: number;
  totalSpent?: number;
  createdAt?: string;
}

export interface Reservation {
  id: string;
  motoId: string;
  customerId: string;
  startDate: string;
  endDate: string;
  totalAmount: number;
  depositAmount: number;
  status: ReservationStatus;
  paymentStatus: PaymentStatus;
  createdAt: string;
}

export interface ReservationRow extends Reservation {
  customer?: Pick<Customer, 'id' | 'firstName' | 'lastName' | 'email' | 'phone'>;
  moto?: {
    id: string;
    brand: string;
    model: string;
    plate?: string;
  };
}
