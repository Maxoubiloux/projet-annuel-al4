import Stripe from 'stripe'
import {
  CheckoutSessionRequest,
  CheckoutSessionResult,
  CheckoutSessionStatus,
  IPaymentGateway,
} from '@domain/repositories/IPaymentGateway'

export class StripePaymentGateway implements IPaymentGateway {
  private readonly stripe: Stripe

  constructor(secretKey: string) {
    this.stripe = new Stripe(secretKey)
  }

  async createCheckoutSession(input: CheckoutSessionRequest): Promise<CheckoutSessionResult> {
    const session = await this.stripe.checkout.sessions.create({
      mode: 'payment',
      submit_type: 'book',
      client_reference_id: input.reservationId,
      customer_email: input.customerEmail,
      success_url: input.successUrl,
      cancel_url: input.cancelUrl,
      metadata: {
        reservationId: input.reservationId,
        customerId: input.customerId,
      },
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: 'eur',
            unit_amount: Math.round(input.amount * 100),
            product_data: {
              name: `Reservation ${input.motoLabel}`,
            },
          },
        },
      ],
    })

    if (!session.url) {
      throw new Error('Stripe n\'a pas retourné d\'URL de paiement')
    }

    return { id: session.id, url: session.url }
  }

  async retrieveCheckoutSession(sessionId: string): Promise<CheckoutSessionStatus> {
    const session = await this.stripe.checkout.sessions.retrieve(sessionId)

    return {
      id: session.id,
      reservationId: session.metadata?.reservationId ?? session.client_reference_id ?? null,
      paymentStatus: session.payment_status,
    }
  }
}
