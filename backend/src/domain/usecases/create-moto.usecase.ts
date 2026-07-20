import { v4 as uuidv4 } from 'uuid'
import { Moto, CreateMotoParams, MOTO_STATUSES } from '../entities/Moto'
import { IMotoRepository } from '../repositories/IMotoRepository'
import { Result, ok, err } from '@shared/result/Result'
import { ValidationError } from '@shared/errors/DomainError'

export class CreateMotoUseCase {
  constructor(private readonly motoRepository: IMotoRepository) {}

  async execute(params: CreateMotoParams): Promise<Result<Moto, ValidationError>> {
    if (!params.brand?.trim()) return err(new ValidationError('La marque est requise'))
    if (!params.model?.trim()) return err(new ValidationError('Le modèle est requis'))
    if (!params.plate?.trim()) return err(new ValidationError("La plaque d'immatriculation est requise"))
    if (!params.category?.trim()) return err(new ValidationError('La catégorie est requise'))
    if (!params.location?.trim()) return err(new ValidationError('La localisation est requise'))
    if (!params.description?.trim()) return err(new ValidationError('La description est requise'))
    if (!MOTO_STATUSES.includes(params.status as never)) {
      return err(new ValidationError(`Statut invalide, doit être l'un de : ${MOTO_STATUSES.join(', ')}`))
    }
    if (params.pricePerDay <= 0) return err(new ValidationError('Le prix par jour doit être supérieur à 0'))
    if (params.mileage < 0) return err(new ValidationError('Le kilométrage ne peut pas être négatif'))
    if (params.deposit < 0) return err(new ValidationError('La caution ne peut pas être négative'))

    const moto = Moto.create(uuidv4(), params)
    const saved = await this.motoRepository.save(moto)

    return ok(saved)
  }
}
