import { DashboardKPIs } from '../entities/Dashboard'
import { IDashboardRepository } from '../repositories/IDashboardRepository'

export class GetDashboardKpisUseCase {
  constructor(private readonly dashboardRepository: IDashboardRepository) { }

  async execute(): Promise<DashboardKPIs> {
    return this.dashboardRepository.getKpis()
  }
}
