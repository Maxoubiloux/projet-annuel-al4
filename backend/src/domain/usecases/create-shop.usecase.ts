import { v4 as uuidv4 } from 'uuid'
import { Shop, CreateShopParams } from '../entities/Shop'
import { IShopRepository } from '../repositories/IShopRepository'
import { Result, ok, err } from '@shared/result/Result'
import { ValidationError } from '@shared/errors/DomainError'

export class CreateShopUseCase {
  constructor(private readonly shopRepository: IShopRepository) {}

  async execute(params: CreateShopParams): Promise<Result<Shop, ValidationError>> {
    if (!params.name.trim()) {
      return err(new ValidationError('Le nom du magasin est requis'))
    }

    if (!params.email.includes('@')) {
      return err(new ValidationError("L'email du magasin est invalide"))
    }

    const shop = Shop.create(uuidv4(), params)
    const saved = await this.shopRepository.save(shop)

    return ok(saved)
  }
}
