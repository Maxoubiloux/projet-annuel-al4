import { z } from 'zod';

const RESERVATION_STATUSES = ['pending', 'confirmed', 'in_progress', 'completed', 'cancelled'] as const;
const PAYMENT_STATUSES = ['pending', 'paid', 'failed', 'refunded'] as const;

export const reservationSchema = z.object({
  motoId: z.string().min(1, 'Select a motorcycle'),
  customerId: z.string().min(1, 'Select a customer'),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().min(1, 'End date is required'),
  totalAmount: z.number().positive('Total amount must be greater than 0'),
  depositAmount: z.number().min(0, 'Deposit cannot be negative'),
  status: z.enum(RESERVATION_STATUSES),
  paymentStatus: z.enum(PAYMENT_STATUSES),
}).refine(f => !f.startDate || !f.endDate || f.endDate >= f.startDate, {
  message: 'End date must be on or after the start date',
  path: ['endDate'],
});
