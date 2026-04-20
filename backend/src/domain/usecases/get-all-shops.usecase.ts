import { Shop } from '../entities/Shop'
import { IShopRepository } from '../repositories/IShopRepository'

export class GetAllShopsUseCase {
  constructor(private readonly shopRepository: IShopRepository) {}

  async execute(): Promise<Shop[]> {
    return this.shopRepository.findAll()
  }
}
