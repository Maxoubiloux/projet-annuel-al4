import { Shop, UpdateShopParams } from '../entities/Shop'

export interface IShopRepository {
  findAll(): Promise<Shop[]>
  findById(id: string): Promise<Shop | null>
  save(shop: Shop): Promise<Shop>
  update(id: string, params: UpdateShopParams): Promise<Shop>
  delete(id: string): Promise<void>
}
