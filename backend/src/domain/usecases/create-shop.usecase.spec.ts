import { CreateShopUseCase } from './create-shop.usecase'
import { IShopRepository } from '../repositories/IShopRepository'
import { Shop } from '../entities/Shop'

const makeMockRepository = (): IShopRepository => ({
  findAll: jest.fn(),
  findById: jest.fn(),
  save: jest.fn(async (shop: Shop) => shop),
  update: jest.fn(),
  delete: jest.fn(),
})

describe('CreateShopUseCase', () => {
  const validParams = {
    name: 'Magasin Paris',
    address: '12 rue de Rivoli',
    city: 'Paris',
    zipCode: '75001',
    country: 'France',
    phone: '0102030405',
    email: 'paris@moto.fr',
  }

  it('should create a shop successfully', async () => {
    const repository = makeMockRepository()
    const useCase = new CreateShopUseCase(repository)

    const result = await useCase.execute(validParams)

    expect(result.isOk).toBe(true)
    if (result.isOk) {
      expect(result.value.name).toBe('Magasin Paris')
      expect(result.value.email).toBe('paris@moto.fr')
      expect(result.value.id).toBeDefined()
    }
    expect(repository.save).toHaveBeenCalledTimes(1)
  })

  it('should reject an empty name', async () => {
    const repository = makeMockRepository()
    const useCase = new CreateShopUseCase(repository)

    const result = await useCase.execute({ ...validParams, name: '   ' })

    expect(result.isErr).toBe(true)
    if (result.isErr) {
      expect(result.error.code).toBe('VALIDATION_ERROR')
    }
    expect(repository.save).not.toHaveBeenCalled()
  })

  it('should reject an invalid email', async () => {
    const repository = makeMockRepository()
    const useCase = new CreateShopUseCase(repository)

    const result = await useCase.execute({ ...validParams, email: 'not-an-email' })

    expect(result.isErr).toBe(true)
    if (result.isErr) {
      expect(result.error.code).toBe('VALIDATION_ERROR')
    }
  })
})
