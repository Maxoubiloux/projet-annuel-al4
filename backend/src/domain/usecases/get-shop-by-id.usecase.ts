import { Shop } from '../entities/Shop'
import { IShopRepository } from '../repositories/IShopRepository'
import { Result, ok, err } from '@shared/result/Result'
import { NotFoundError } from '@shared/errors/DomainError'

export class GetShopByIdUseCase {
  constructor(private readonly shopRepository: IShopRepository) {}

  async execute(id: string): Promise<Result<Shop, NotFoundError>> {
    const shop = await this.shopRepository.findById(id)

    if (!shop) {
      return err(new NotFoundError('Shop', id))
    }

    return ok(shop)
  }
}
