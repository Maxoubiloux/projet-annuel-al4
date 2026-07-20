import { Payment } from '@domain/entities/Payment'

export function toPaymentResponse(p: Payment) {
  return {
    id: p.id,
    ref: p.ref,
    customerId: p.customerId,
    customer: p.customerName,
    amount: p.amount,
    deposit: p.deposit,
    method: p.method,
    date: p.date,
    status: p.status,
    bookingId: p.bookingId,
  }
}
