import { GetAllShopsUseCase } from '@domain/usecases/get-all-shops.usecase'
import { IShopRepository } from '@domain/repositories/IShopRepository'
import { Shop } from '@domain/entities/Shop'

const shopFixture = new Shop(
  'id-1', 'Magasin Paris', '12 rue de Rivoli', 'Paris',
  '75001', 'France', '0102030405', 'paris@moto.fr', new Date(),
)

describe('GetAllShopsUseCase', () => {
  it('should return all shops', async () => {
    const repository: IShopRepository = {
      findAll: jest.fn(async () => [shopFixture]),
      findById: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    }
    const useCase = new GetAllShopsUseCase(repository)

    const result = await useCase.execute()

    expect(result).toHaveLength(1)
    expect(result[0].id).toBe('id-1')
  })

  it('should return empty array when no shops', async () => {
    const repository: IShopRepository = {
      findAll: jest.fn(async () => []),
      findById: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    }
    const useCase = new GetAllShopsUseCase(repository)

    const result = await useCase.execute()

    expect(result).toHaveLength(0)
  })
})
