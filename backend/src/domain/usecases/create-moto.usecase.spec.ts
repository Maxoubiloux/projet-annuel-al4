import { CreateMotoUseCase } from './create-moto.usecase'
import { IMotoRepository } from '../repositories/IMotoRepository'
import { Moto, MotoCategory } from '../entities/Moto'

const makeMockRepository = (): IMotoRepository => ({
  save: jest.fn(async (moto: Moto) => moto),
})

describe('CreateMotoUseCase', () => {
  const validParams = {
    brand: 'Yamaha',
    model: 'MT-07',
    registration: 'AB-123-CD',
    category: MotoCategory.A2,
    currentKm: 15000,
    pricePerDay: 89,
  }

  it('should create a moto with PUBLISHED status', async () => {
    const repository = makeMockRepository()
    const useCase = new CreateMotoUseCase(repository)

    const result = await useCase.execute(validParams)

    expect(result.isOk).toBe(true)
    if (result.isOk) {
      expect(result.value.brand).toBe('Yamaha')
      expect(result.value.model).toBe('MT-07')
      expect(result.value.status).toBe('PUBLISHED')
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
