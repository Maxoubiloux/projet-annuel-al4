export const PAYMENT_STATUSES = ['pending', 'paid', 'failed', 'refunded'] as const
export type PaymentStatusName = (typeof PAYMENT_STATUSES)[number]

export interface CreatePaymentParams {
  ref: string
  customerId: string
  amount: number
  deposit: number
  method: string
  status: string
  bookingId?: string
}

export class Payment {
  constructor(
    readonly id: string,
    readonly ref: string,
    readonly customerId: string,
    readonly amount: number,
    readonly deposit: number,
    readonly method: string,
    readonly date: Date,
    readonly status: string,
    readonly customerName?: string,
    readonly bookingId?: string,
  ) { }

  static create(id: string, params: CreatePaymentParams): Payment {
    return new Payment(
      id,
      params.ref,
      params.customerId,
      params.amount,
      params.deposit,
      params.method,
      new Date(),
      params.status,
      undefined,
      params.bookingId,
    )
  }
}
