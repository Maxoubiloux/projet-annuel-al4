import { Brand, UpdateBrandParams } from '../entities/Brand'
import { IBrandRepository } from '../repositories/IBrandRepository'
import { Result, ok, err } from '@shared/result/Result'
import { NotFoundError, ValidationError, DomainError } from '@shared/errors/DomainError'

export class UpdateBrandUseCase {
  constructor(private readonly brandRepository: IBrandRepository) {}

  async execute(id: string, params: UpdateBrandParams): Promise<Result<Brand, DomainError>> {
    const existing = await this.brandRepository.findById(id)

    if (!existing) {
      return err(new NotFoundError('Brand', id))
    }

    if (params.name !== undefined) {
      const name = params.name.trim()
      if (!name) {
        return err(new ValidationError('Le nom de la marque ne peut pas être vide'))
      }

      const conflict = await this.brandRepository.findByName(name)
      if (conflict && conflict.id !== id) {
        return err(new ValidationError('Une marque avec ce nom existe déjà'))
      }

      params = { name }
    }

    const updated = await this.brandRepository.update(id, params)

    return ok(updated)
  }
}
