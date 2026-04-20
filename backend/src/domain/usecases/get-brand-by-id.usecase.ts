import { Brand } from '../entities/Brand'
import { IBrandRepository } from '../repositories/IBrandRepository'
import { Result, ok, err } from '@shared/result/Result'
import { NotFoundError } from '@shared/errors/DomainError'

export class GetBrandByIdUseCase {
  constructor(private readonly brandRepository: IBrandRepository) {}

  async execute(id: string): Promise<Result<Brand, NotFoundError>> {
    const brand = await this.brandRepository.findById(id)

    if (!brand) {
      return err(new NotFoundError('Brand', id))
    }

    return ok(brand)
  }
}
