import { v4 as uuidv4 } from 'uuid'
import { Brand, CreateBrandParams } from '../entities/Brand'
import { IBrandRepository } from '../repositories/IBrandRepository'
import { Result, ok, err } from '@shared/result/Result'
import { ValidationError } from '@shared/errors/DomainError'

export class CreateBrandUseCase {
  constructor(private readonly brandRepository: IBrandRepository) {}

  async execute(params: CreateBrandParams): Promise<Result<Brand, ValidationError>> {
    const name = params.name?.trim()

    if (!name) {
      return err(new ValidationError('Le nom de la marque est requis'))
    }

    const existing = await this.brandRepository.findByName(name)
    if (existing) {
      return err(new ValidationError('Une marque avec ce nom existe déjà'))
    }

    const brand = Brand.create(uuidv4(), { name })
    const saved = await this.brandRepository.save(brand)

    return ok(saved)
  }
}
