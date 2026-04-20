import { IShopRepository } from '../repositories/IShopRepository'
import { Result, ok, err } from '@shared/result/Result'
import { NotFoundError } from '@shared/errors/DomainError'

export class DeleteShopUseCase {
  constructor(private readonly shopRepository: IShopRepository) {}

  async execute(id: string): Promise<Result<void, NotFoundError>> {
    const existing = await this.shopRepository.findById(id)

    if (!existing) {
      return err(new NotFoundError('Shop', id))
    }

    await this.shopRepository.delete(id)

    return ok(undefined)
  }
}
