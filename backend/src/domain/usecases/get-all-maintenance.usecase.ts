import { IMaintenanceRepository, MaintenanceListParams, MaintenanceListResult } from '../repositories/IMaintenanceRepository'

export class GetAllMaintenanceUseCase {
  constructor(private readonly maintenanceRepository: IMaintenanceRepository) { }

  async execute(params: MaintenanceListParams): Promise<MaintenanceListResult> {
    return this.maintenanceRepository.findAll(params)
  }
}
