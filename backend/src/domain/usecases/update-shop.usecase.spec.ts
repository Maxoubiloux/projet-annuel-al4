import { UpdateShopUseCase } from './update-shop.usecase'
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
  update: jest.fn(async (_id, params) => {
    if (!shop) throw new Error('should not be called')
    return new Shop(
      shop.id,
      params.name ?? shop.name,
      params.address ?? shop.address,
      params.city ?? shop.city,
      params.zipCode ?? shop.zipCode,
      params.country ?? shop.country,
      params.phone ?? shop.phone,
      params.email ?? shop.email,
      shop.createdAt,
    )
  }),
  delete: jest.fn(),
})

describe('UpdateShopUseCase', () => {
  it('should update a shop successfully', async () => {
    const repo = makeMockRepository(shopFixture)
    const useCase = new UpdateShopUseCase(repo)

    const result = await useCase.execute('id-1', { name: 'Magasin Lyon' })

    expect(result.isOk).toBe(true)
    if (result.isOk) {
      expect(result.value.name).toBe('Magasin Lyon')
    }
  })

  it('should return NotFoundError when shop does not exist', async () => {
    const useCase = new UpdateShopUseCase(makeMockRepository(null))

    const result = await useCase.execute('unknown', { name: 'Magasin Lyon' })

    expect(result.isErr).toBe(true)
    if (result.isErr) {
      expect(result.error.code).toBe('NOT_FOUND')
    }
  })

  it('should reject an empty name', async () => {
    const useCase = new UpdateShopUseCase(makeMockRepository(shopFixture))

    const result = await useCase.execute('id-1', { name: '   ' })

    expect(result.isErr).toBe(true)
    if (result.isErr) {
      expect(result.error.code).toBe('VALIDATION_ERROR')
    }
  })

  it('should reject an invalid email', async () => {
    const useCase = new UpdateShopUseCase(makeMockRepository(shopFixture))

    const result = await useCase.execute('id-1', { email: 'not-an-email' })

    expect(result.isErr).toBe(true)
    if (result.isErr) {
      expect(result.error.code).toBe('VALIDATION_ERROR')
    }
  })
})
