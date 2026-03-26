import { IMotoRepository } from '../repositories/IMotoRepository'
import { Result, ok, err } from '@shared/result/Result'
import { NotFoundError } from '@shared/errors/DomainError'

export class DeleteMotoUseCase {
  constructor(private readonly motoRepository: IMotoRepository) {}

  async execute(id: string): Promise<Result<void, NotFoundError>> {
    const existing = await this.motoRepository.findById(id)

    if (!existing) {
      return err(new NotFoundError('Moto', id))
    }

    await this.motoRepository.delete(id)

    return ok(undefined)
  }
}
