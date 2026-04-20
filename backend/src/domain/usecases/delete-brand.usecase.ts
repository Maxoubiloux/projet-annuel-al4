import { IBrandRepository } from '../repositories/IBrandRepository'
import { Result, ok, err } from '@shared/result/Result'
import { NotFoundError } from '@shared/errors/DomainError'

export class DeleteBrandUseCase {
  constructor(private readonly brandRepository: IBrandRepository) {}

  async execute(id: string): Promise<Result<void, NotFoundError>> {
    const existing = await this.brandRepository.findById(id)

    if (!existing) {
      return err(new NotFoundError('Brand', id))
    }

    await this.brandRepository.delete(id)

    return ok(undefined)
  }
}
