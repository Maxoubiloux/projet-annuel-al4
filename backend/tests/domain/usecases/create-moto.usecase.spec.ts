import { CreateMotoUseCase } from '@domain/usecases/create-moto.usecase'
import { IMotoRepository } from '@domain/repositories/IMotoRepository'
import { Moto } from '@domain/entities/Moto'

const makeMockRepository = (): IMotoRepository => ({
  findAll: jest.fn(async () => []),
  findById: jest.fn(async () => null),
  save: jest.fn(async (moto: Moto) => moto),
  update: jest.fn(async (_id: string, _params) => ({}) as Moto),
  delete: jest.fn(async () => undefined),
})

describe('CreateMotoUseCase', () => {
  const validParams = {
    brandId: '550e8400-e29b-41d4-a716-446655440001',
    model: 'MT-07',
    serialNumber: 'VIN123456789',
    registration: 'AB-123-CD',
    categoryId: '550e8400-e29b-41d4-a716-446655440002',
    statusId: '550e8400-e29b-41d4-a716-446655440003',
    currentKm: 15000,
    pricePerDay: 89,
    description: 'Belle moto en bon état',
  }

  it('should create a moto successfully', async () => {
    const repository = makeMockRepository()
    const useCase = new CreateMotoUseCase(repository)

    const result = await useCase.execute(validParams)

    expect(result.isOk).toBe(true)
    if (result.isOk) {
      expect(result.value.brandId).toBe(validParams.brandId)
      expect(result.value.model).toBe('MT-07')
      expect(result.value.serialNumber).toBe('VIN123456789')
      expect(result.value.id).toBeDefined()
    }
    expect(repository.save).toHaveBeenCalledTimes(1)
  })

  it('should reject a negative price per day', async () => {
    const repository = makeMockRepository()
    const useCase = new CreateMotoUseCase(repository)

    const result = await useCase.execute({ ...validParams, pricePerDay: -10 })

    expect(result.isErr).toBe(true)
    if (result.isErr) {
      expect(result.error.code).toBe('VALIDATION_ERROR')
    }
    expect(repository.save).not.toHaveBeenCalled()
  })

  it('should reject a zero price per day', async () => {
    const repository = makeMockRepository()
    const useCase = new CreateMotoUseCase(repository)

    const result = await useCase.execute({ ...validParams, pricePerDay: 0 })

    expect(result.isErr).toBe(true)
  })

  it('should reject negative km', async () => {
    const repository = makeMockRepository()
    const useCase = new CreateMotoUseCase(repository)

    const result = await useCase.execute({ ...validParams, currentKm: -1 })

    expect(result.isErr).toBe(true)
    if (result.isErr) {
      expect(result.error.code).toBe('VALIDATION_ERROR')
    }
  })

  it('should accept zero km', async () => {
    const repository = makeMockRepository()
    const useCase = new CreateMotoUseCase(repository)

    const result = await useCase.execute({ ...validParams, currentKm: 0 })

    expect(result.isOk).toBe(true)
  })
})
