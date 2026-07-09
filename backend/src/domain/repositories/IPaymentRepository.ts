import { Payment } from '../entities/Payment'

export interface PaymentListParams {
  page?: number
  limit?: number
}

export interface PaymentListResult {
  items: Payment[]
  total: number
}

export interface IPaymentRepository {
  findAll(params: PaymentListParams): Promise<PaymentListResult>
  findById(id: string): Promise<Payment | null>
  findByBookingId(bookingId: string): Promise<Payment | null>
  save(payment: Payment): Promise<Payment>
  refund(id: string): Promise<Payment>
}
