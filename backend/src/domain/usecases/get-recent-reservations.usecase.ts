import { Reservation } from '../entities/Reservation'
import { IReservationRepository } from '../repositories/IReservationRepository'

export class GetRecentReservationsUseCase {
  constructor(private readonly reservationRepository: IReservationRepository) { }

  async execute(limit: number): Promise<Reservation[]> {
    return this.reservationRepository.findRecent(limit)
  }
}
