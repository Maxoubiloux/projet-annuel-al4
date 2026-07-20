import { RevenuePoint } from '../entities/Dashboard'
import { IDashboardRepository } from '../repositories/IDashboardRepository'

export class GetDashboardRevenueUseCase {
  constructor(private readonly dashboardRepository: IDashboardRepository) { }

  async execute(months: number): Promise<RevenuePoint[]> {
    return this.dashboardRepository.getRevenue(months)
  }
}
