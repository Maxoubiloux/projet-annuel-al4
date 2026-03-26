import { Moto } from '../entities/Moto'
import { IMotoRepository } from '../repositories/IMotoRepository'
import { Result, ok, err } from '@shared/result/Result'
import { NotFoundError } from '@shared/errors/DomainError'

export class GetMotoByIdUseCase {
  constructor(private readonly motoRepository: IMotoRepository) {}

  async execute(id: string): Promise<Result<Moto, NotFoundError>> {
    const moto = await this.motoRepository.findById(id)

    if (!moto) {
      return err(new NotFoundError('Moto', id))
    }

    return ok(moto)
  }
}
