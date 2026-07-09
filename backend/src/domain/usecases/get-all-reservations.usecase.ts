import { IReservationRepository, ReservationListParams, ReservationListResult } from '../repositories/IReservationRepository'

export class GetAllReservationsUseCase {
  constructor(private readonly reservationRepository: IReservationRepository) { }

  async execute(params: ReservationListParams): Promise<ReservationListResult> {
    return this.reservationRepository.findAll(params)
  }
}
