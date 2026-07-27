export interface CheckoutSessionRequest {
  reservationId: string
  customerId: string
  customerEmail: string
  motoLabel: string
  amount: number
  successUrl: string
  cancelUrl: string
}

export interface CheckoutSessionResult {
  id: string
  url: string
}

export interface CheckoutSessionStatus {
  id: string
  reservationId: string | null
  paymentStatus: 'paid' | 'unpaid' | 'no_payment_required'
}

export interface IPaymentGateway {
  createCheckoutSession(input: CheckoutSessionRequest): Promise<CheckoutSessionResult>
  retrieveCheckoutSession(sessionId: string): Promise<CheckoutSessionStatus>
}
