import { Reservation } from '../entities/Reservation'
import { IReservationRepository } from '../repositories/IReservationRepository'
import { Result, ok, err } from '@shared/result/Result'
import { DomainError, NotFoundError, ValidationError } from '@shared/errors/DomainError'

export class ConfirmReservationUseCase {
  constructor(private readonly reservationRepository: IReservationRepository) { }

  async execute(id: string): Promise<Result<Reservation, DomainError>> {
    const existing = await this.reservationRepository.findById(id)

    if (!existing) {
      return err(new NotFoundError('Reservation', id))
    }

    if (existing.status !== 'pending') {
      return err(new ValidationError('Seule une réservation en attente peut être confirmée'))
    }

    const updated = await this.reservationRepository.updateStatus(id, 'confirmed')

    return ok(updated)
  }
}
