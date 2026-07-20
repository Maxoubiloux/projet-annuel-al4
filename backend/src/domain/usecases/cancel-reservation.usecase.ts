import { Reservation } from '../entities/Reservation'
import { IReservationRepository } from '../repositories/IReservationRepository'
import { Result, ok, err } from '@shared/result/Result'
import { DomainError, NotFoundError, ValidationError } from '@shared/errors/DomainError'

export class CancelReservationUseCase {
  constructor(private readonly reservationRepository: IReservationRepository) { }

  async execute(id: string): Promise<Result<Reservation, DomainError>> {
    const existing = await this.reservationRepository.findById(id)

    if (!existing) {
      return err(new NotFoundError('Reservation', id))
    }

    if (existing.status === 'completed' || existing.status === 'cancelled') {
      return err(new ValidationError('Cette réservation ne peut plus être annulée'))
    }

    const updated = await this.reservationRepository.updateStatus(id, 'cancelled')

    return ok(updated)
  }
}
