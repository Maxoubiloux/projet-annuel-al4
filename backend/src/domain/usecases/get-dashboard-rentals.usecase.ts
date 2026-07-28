import { RentalsPoint } from '../entities/Dashboard'
import { IDashboardRepository } from '../repositories/IDashboardRepository'

export class GetDashboardRentalsUseCase {
  constructor(private readonly dashboardRepository: IDashboardRepository) { }

  async execute(days: number): Promise<RentalsPoint[]> {
    return this.dashboardRepository.getRentals(days)
  }
}
