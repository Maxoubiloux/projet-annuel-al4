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
