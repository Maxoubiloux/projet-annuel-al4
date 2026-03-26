import { Moto, UpdateMotoParams } from '../entities/Moto'
import { IMotoRepository } from '../repositories/IMotoRepository'
import { Result, ok, err } from '@shared/result/Result'
import { NotFoundError, ValidationError } from '@shared/errors/DomainError'
import { DomainError } from '@shared/errors/DomainError'

export class UpdateMotoUseCase {
  constructor(private readonly motoRepository: IMotoRepository) {}

  async execute(id: string, params: UpdateMotoParams): Promise<Result<Moto, DomainError>> {
    const existing = await this.motoRepository.findById(id)

    if (!existing) {
      return err(new NotFoundError('Moto', id))
    }

    if (params.pricePerDay !== undefined && params.pricePerDay <= 0) {
      return err(new ValidationError('Le prix par jour doit être supérieur à 0'))
    }

    if (params.currentKm !== undefined && params.currentKm < 0) {
      return err(new ValidationError('Le kilométrage ne peut pas être négatif'))
    }

    const updated = await this.motoRepository.update(id, params)

    return ok(updated)
  }
}
