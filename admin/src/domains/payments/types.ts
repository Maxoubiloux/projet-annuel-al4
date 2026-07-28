export type PaymentStatus = 'paid' | 'pending' | 'refunded' | 'failed';

export interface Payment {
  id: string;
  ref: string;
  customer: string;
  customerId?: string;
  reservationId?: string;
  amount: number;
  deposit: number;
  method: string;
  date: string;
  status: PaymentStatus;
}
