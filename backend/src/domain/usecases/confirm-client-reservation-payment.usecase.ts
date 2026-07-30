import { Reservation } from '../entities/Reservation'
import { IReservationRepository } from '../repositories/IReservationRepository'
import { IPaymentRepository } from '../repositories/IPaymentRepository'
import { CheckoutSessionStatus, IPaymentGateway } from '../repositories/IPaymentGateway'
import { IContractQueuePublisher } from '../ports/IContractQueuePublisher'
import { Result, err, ok } from '@shared/result/Result'
import { DomainError, ForbiddenError, NotFoundError, ValidationError } from '@shared/errors/DomainError'

export class ConfirmClientReservationPaymentUseCase {
  constructor(
    private readonly reservationRepository: IReservationRepository,
    private readonly paymentRepository: IPaymentRepository,
    private readonly paymentGateway: IPaymentGateway,
    private readonly contractPublisher?: IContractQueuePublisher,
  ) { }

  async execute(
    bookingId: string,
    userId: string,
    sessionId: string,
    correlationId: string,
  ): Promise<Result<Reservation, DomainError>> {
    const reservation = await this.reservationRepository.findById(bookingId)
    if (!reservation) return err(new NotFoundError('Reservation', bookingId))
    if (reservation.customerId !== userId) return err(new ForbiddenError('Cette réservation ne vous appartient pas'))
    if (reservation.paymentStatus === 'paid') return ok(reservation)
    if (reservation.status === 'cancelled') return err(new ValidationError('Cette réservation est annulée'))

    let session: CheckoutSessionStatus
    try {
      session = await this.paymentGateway.retrieveCheckoutSession(sessionId)
    } catch {
      return err(new ValidationError('Service de paiement indisponible'))
    }
    if (session.reservationId !== bookingId) {
      return err(new ForbiddenError('Cette session de paiement ne correspond pas à la réservation'))
    }
    if (session.paymentStatus !== 'paid') {
      return err(new ValidationError('Le paiement Stripe n\'est pas validé'))
    }

    const payment = await this.paymentRepository.findByBookingId(bookingId)
    if (!payment) return err(new NotFoundError('Payment for booking', bookingId))

    await this.paymentRepository.updateStatus(payment.id, 'paid')
    await this.reservationRepository.updatePaymentStatus(bookingId, 'paid')
    const confirmed = await this.reservationRepository.updateStatus(bookingId, 'confirmed')

    if (this.contractPublisher) {
      try {
        await this.contractPublisher.publishContractGeneration({
          correlationId,
          reservation: {
            id: confirmed.id,
            motoId: confirmed.motoId,
            customerId: confirmed.customerId,
            startDate: confirmed.startDate,
            endDate: confirmed.endDate,
            totalAmount: confirmed.totalAmount,
            depositAmount: confirmed.depositAmount,
            customer: confirmed.customer,
            moto: confirmed.moto,
            shop: confirmed.shop,
          },
        })
      } catch {
        // contract generation is best-effort: publish failure must not block payment confirmation
      }
    }

    return ok(confirmed)
  }
}
