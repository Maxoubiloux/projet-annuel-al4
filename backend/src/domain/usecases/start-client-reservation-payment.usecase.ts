import { Result, err, ok } from '@shared/result/Result'
import { DomainError, ForbiddenError, NotFoundError, ValidationError } from '@shared/errors/DomainError'
import { IReservationRepository } from '../repositories/IReservationRepository'
import { IPaymentGateway } from '../repositories/IPaymentGateway'

export interface StartReservationPaymentResult {
  sessionId: string
  checkoutUrl: string
}

export class StartClientReservationPaymentUseCase {
  constructor(
    private readonly reservationRepository: IReservationRepository,
    private readonly paymentGateway: IPaymentGateway,
  ) { }

  async execute(
    bookingId: string,
    userId: string,
    frontendUrl: string,
  ): Promise<Result<StartReservationPaymentResult, DomainError>> {
    const reservation = await this.reservationRepository.findById(bookingId)
    if (!reservation) return err(new NotFoundError('Reservation', bookingId))
    if (reservation.customerId !== userId) return err(new ForbiddenError('Cette réservation ne vous appartient pas'))
    if (reservation.paymentStatus === 'paid') return err(new ValidationError('Cette réservation est déjà payée'))
    if (reservation.status === 'cancelled') return err(new ValidationError('Cette réservation est annulée'))
    if (reservation.totalAmount <= 0) return err(new ValidationError('Le montant de la réservation est invalide'))

    try {
      const motoLabel = reservation.moto
        ? `${reservation.moto.brand} ${reservation.moto.model}`
        : 'moto'
      const session = await this.paymentGateway.createCheckoutSession({
        reservationId: reservation.id,
        customerId: reservation.customerId,
        customerEmail: reservation.customer?.email ?? '',
        motoLabel,
        amount: reservation.totalAmount,
        successUrl: `${frontendUrl}/reservations/payment/success?reservationId=${reservation.id}&session_id={CHECKOUT_SESSION_ID}`,
        cancelUrl: reservation.moto
          ? `${frontendUrl}/motos/${reservation.moto.id}`
          : `${frontendUrl}/reservations`,
      })

      return ok({ sessionId: session.id, checkoutUrl: session.url })
    } catch {
      return err(new ValidationError('Service de paiement indisponible'))
    }
  }
}
