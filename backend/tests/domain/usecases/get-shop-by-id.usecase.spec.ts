import { GetShopByIdUseCase } from '@domain/usecases/get-shop-by-id.usecase'
import { IShopRepository } from '@domain/repositories/IShopRepository'
import { Shop } from '@domain/entities/Shop'

const shopFixture = new Shop(
  'id-1', 'Magasin Paris', '12 rue de Rivoli', 'Paris',
  '75001', 'France', '0102030405', 'paris@moto.fr', new Date(),
)

const makeMockRepository = (shop: Shop | null): IShopRepository => ({
  findAll: jest.fn(),
  findById: jest.fn(async () => shop),
  save: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
})

describe('GetShopByIdUseCase', () => {
  it('should return the shop when found', async () => {
    const useCase = new GetShopByIdUseCase(makeMockRepository(shopFixture))

    const result = await useCase.execute('id-1')

    expect(result.isOk).toBe(true)
    if (result.isOk) {
      expect(result.value.id).toBe('id-1')
    }
  })

  it('should return NotFoundError when shop does not exist', async () => {
    const useCase = new GetShopByIdUseCase(makeMockRepository(null))

    const result = await useCase.execute('unknown-id')

    expect(result.isErr).toBe(true)
    if (result.isErr) {
      expect(result.error.code).toBe('NOT_FOUND')
    }
  })
})
