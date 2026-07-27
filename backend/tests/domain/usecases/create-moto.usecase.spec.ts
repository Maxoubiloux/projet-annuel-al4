import { CreateMotoUseCase } from '@domain/usecases/create-moto.usecase'
import { IMotoRepository } from '@domain/repositories/IMotoRepository'
import { Moto } from '@domain/entities/Moto'

const makeMockRepository = (): IMotoRepository => ({
  findAll: jest.fn(async () => []),
  findById: jest.fn(async () => null),
  findReservedTodayIds: jest.fn(),
  findAvailability: jest.fn(),
  save: jest.fn(async (moto: Moto) => moto),
  update: jest.fn(async (_id: string, _params) => ({}) as Moto),
  delete: jest.fn(async () => undefined),
})

describe('CreateMotoUseCase', () => {
  const validParams = {
    brand: 'Yamaha',
    model: 'MT-07',
    plate: 'AB-123-CD',
    year: 2024,
    category: 'A2',
    mileage: 15000,
    pricePerDay: 89,
    deposit: 500,
    status: 'available',
    location: 'Paris — Bastille',
    description: 'Belle moto en bon état',
  }

  it('should create a moto successfully', async () => {
    const repository = makeMockRepository()
    const useCase = new CreateMotoUseCase(repository)

    const result = await useCase.execute(validParams)

    expect(result.isOk).toBe(true)
    if (result.isOk) {
      expect(result.value.brand).toBe('Yamaha')
      expect(result.value.model).toBe('MT-07')
      expect(result.value.plate).toBe('AB-123-CD')
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

  it('should reject negative mileage', async () => {
    const repository = makeMockRepository()
    const useCase = new CreateMotoUseCase(repository)

    const result = await useCase.execute({ ...validParams, mileage: -1 })

    expect(result.isErr).toBe(true)
    if (result.isErr) {
      expect(result.error.code).toBe('VALIDATION_ERROR')
    }
  })

  it('should accept zero mileage', async () => {
    const repository = makeMockRepository()
    const useCase = new CreateMotoUseCase(repository)

    const result = await useCase.execute({ ...validParams, mileage: 0 })

    expect(result.isOk).toBe(true)
  })

  it('should reject an invalid status', async () => {
    const repository = makeMockRepository()
    const useCase = new CreateMotoUseCase(repository)

    const result = await useCase.execute({ ...validParams, status: 'published' })

    expect(result.isErr).toBe(true)
    if (result.isErr) {
      expect(result.error.code).toBe('VALIDATION_ERROR')
    }
  })
})
