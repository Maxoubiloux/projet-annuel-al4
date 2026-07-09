import { Reservation } from '../entities/Reservation'
import { IReservationRepository } from '../repositories/IReservationRepository'
import { IPaymentRepository } from '../repositories/IPaymentRepository'
import { Result, ok, err } from '@shared/result/Result'
import { DomainError, NotFoundError, ValidationError } from '@shared/errors/DomainError'

export class RefundReservationUseCase {
  constructor(
    private readonly reservationRepository: IReservationRepository,
    private readonly paymentRepository: IPaymentRepository,
  ) { }

  async execute(id: string): Promise<Result<Reservation, DomainError>> {
    const existing = await this.reservationRepository.findById(id)

    if (!existing) {
      return err(new NotFoundError('Reservation', id))
    }

    if (existing.paymentStatus === 'refunded') {
      return err(new ValidationError('Cette réservation a déjà été remboursée'))
    }

    const updated = await this.reservationRepository.updatePaymentStatus(id, 'refunded')

    const payment = await this.paymentRepository.findByBookingId(id)
    if (payment) {
      await this.paymentRepository.refund(payment.id)
    }

    return ok(updated)
  }
}
