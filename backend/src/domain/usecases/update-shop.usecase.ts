import { Shop, UpdateShopParams } from '../entities/Shop'
import { IShopRepository } from '../repositories/IShopRepository'
import { Result, ok, err } from '@shared/result/Result'
import { NotFoundError, ValidationError } from '@shared/errors/DomainError'
import { DomainError } from '@shared/errors/DomainError'

export class UpdateShopUseCase {
  constructor(private readonly shopRepository: IShopRepository) {}

  async execute(id: string, params: UpdateShopParams): Promise<Result<Shop, DomainError>> {
    const existing = await this.shopRepository.findById(id)

    if (!existing) {
      return err(new NotFoundError('Shop', id))
    }

    if (params.name !== undefined && !params.name.trim()) {
      return err(new ValidationError('Le nom du magasin ne peut pas être vide'))
    }

    if (params.email !== undefined && !params.email.includes('@')) {
      return err(new ValidationError("L'email du magasin est invalide"))
    }

    const updated = await this.shopRepository.update(id, params)

    return ok(updated)
  }
}
