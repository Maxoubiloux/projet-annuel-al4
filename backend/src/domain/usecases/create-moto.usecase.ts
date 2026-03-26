import { v4 as uuidv4 } from 'uuid'
import { Moto, CreateMotoParams } from '../entities/Moto'
import { IMotoRepository } from '../repositories/IMotoRepository'
import { Result, ok, err } from '@shared/result/Result'
import { ValidationError } from '@shared/errors/DomainError'

export class CreateMotoUseCase {
  constructor(private readonly motoRepository: IMotoRepository) {}

  async execute(params: CreateMotoParams): Promise<Result<Moto, ValidationError>> {
    if (params.pricePerDay <= 0) {
      return err(new ValidationError('Le prix par jour doit être supérieur à 0'))
    }

    if (params.currentKm < 0) {
      return err(new ValidationError('Le kilométrage ne peut pas être négatif'))
    }

    const moto = Moto.create(uuidv4(), params)
    const saved = await this.motoRepository.save(moto)

    return ok(saved)
  }
}
