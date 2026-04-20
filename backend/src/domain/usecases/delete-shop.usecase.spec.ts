import { DeleteShopUseCase } from './delete-shop.usecase'
import { IShopRepository } from '../repositories/IShopRepository'
import { Shop } from '../entities/Shop'

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

describe('DeleteShopUseCase', () => {
  it('should delete a shop successfully', async () => {
    const repo = makeMockRepository(shopFixture)
    const useCase = new DeleteShopUseCase(repo)

    const result = await useCase.execute('id-1')

    expect(result.isOk).toBe(true)
    expect(repo.delete).toHaveBeenCalledWith('id-1')
  })

  it('should return NotFoundError when shop does not exist', async () => {
    const useCase = new DeleteShopUseCase(makeMockRepository(null))

    const result = await useCase.execute('unknown')

    expect(result.isErr).toBe(true)
    if (result.isErr) {
      expect(result.error.code).toBe('NOT_FOUND')
    }
  })
})
