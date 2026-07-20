import { v4 as uuidv4 } from 'uuid'
import { MaintenanceJob, CreateMaintenanceParams, MAINTENANCE_SEVERITIES, MAINTENANCE_STATUSES } from '../entities/MaintenanceJob'
import { IMaintenanceRepository } from '../repositories/IMaintenanceRepository'
import { Result, ok, err } from '@shared/result/Result'
import { ValidationError } from '@shared/errors/DomainError'

export class CreateMaintenanceUseCase {
  constructor(private readonly maintenanceRepository: IMaintenanceRepository) { }

  async execute(params: CreateMaintenanceParams): Promise<Result<MaintenanceJob, ValidationError>> {
    if (!params.motoId?.trim()) return err(new ValidationError('La moto est requise'))
    if (!params.type?.trim()) return err(new ValidationError("Le type d'intervention est requis"))
    if (!params.date?.trim()) return err(new ValidationError("La date d'échéance est requise"))
    if (!params.km?.trim() || !/^\d+$/.test(params.km)) {
      return err(new ValidationError('Le kilométrage doit être un nombre'))
    }
    if (params.cost < 0) return err(new ValidationError('Le coût ne peut pas être négatif'))
    if (!MAINTENANCE_SEVERITIES.includes(params.sev as never)) {
      return err(new ValidationError('Sévérité invalide'))
    }
    if (!MAINTENANCE_STATUSES.includes(params.status as never)) {
      return err(new ValidationError('Statut invalide'))
    }

    const job = MaintenanceJob.create(uuidv4(), params)
    const saved = await this.maintenanceRepository.save(job)

    return ok(saved)
  }
}
