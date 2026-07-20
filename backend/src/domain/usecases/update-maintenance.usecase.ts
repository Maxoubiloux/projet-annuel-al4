import { MaintenanceJob, UpdateMaintenanceParams, MAINTENANCE_STATUSES } from '../entities/MaintenanceJob'
import { IMaintenanceRepository } from '../repositories/IMaintenanceRepository'
import { Result, ok, err } from '@shared/result/Result'
import { DomainError, NotFoundError, ValidationError } from '@shared/errors/DomainError'

export class UpdateMaintenanceUseCase {
  constructor(private readonly maintenanceRepository: IMaintenanceRepository) { }

  async execute(id: string, params: UpdateMaintenanceParams): Promise<Result<MaintenanceJob, DomainError>> {
    const existing = await this.maintenanceRepository.findById(id)

    if (!existing) {
      return err(new NotFoundError('MaintenanceJob', id))
    }

    if (params.status !== undefined && !MAINTENANCE_STATUSES.includes(params.status as never)) {
      return err(new ValidationError('Statut invalide'))
    }

    if (params.cost !== undefined && params.cost < 0) {
      return err(new ValidationError('Le coût ne peut pas être négatif'))
    }

    const updated = await this.maintenanceRepository.update(id, params)

    return ok(updated)
  }
}
