import { IMaintenanceRepository, MaintenanceAlert } from '../repositories/IMaintenanceRepository'

export class GetMaintenanceAlertsUseCase {
  constructor(private readonly maintenanceRepository: IMaintenanceRepository) { }

  async execute(limit: number): Promise<MaintenanceAlert[]> {
    return this.maintenanceRepository.findAlerts(limit)
  }
}
