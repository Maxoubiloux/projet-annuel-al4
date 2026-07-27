import {
  CheckoutSessionRequest,
  CheckoutSessionResult,
  CheckoutSessionStatus,
  IPaymentGateway,
} from '@domain/repositories/IPaymentGateway'

export class UnavailablePaymentGateway implements IPaymentGateway {
  async createCheckoutSession(_input: CheckoutSessionRequest): Promise<CheckoutSessionResult> {
    throw new Error('STRIPE_SECRET_KEY manquante')
  }

  async retrieveCheckoutSession(_sessionId: string): Promise<CheckoutSessionStatus> {
    throw new Error('STRIPE_SECRET_KEY manquante')
  }
}
