import { CreateBrandUseCase } from './create-brand.usecase'
import { IBrandRepository } from '../repositories/IBrandRepository'
import { Brand } from '../entities/Brand'

const makeMockRepository = (existing: Brand | null = null): IBrandRepository => ({
  findAll: jest.fn(),
  findById: jest.fn(),
  findByName: jest.fn(async () => existing),
  save: jest.fn(async (brand: Brand) => brand),
  update: jest.fn(),
  delete: jest.fn(),
})

describe('CreateBrandUseCase', () => {
  const validParams = { name: 'Yamaha' }

  it('should create a brand successfully', async () => {
    const repository = makeMockRepository()
    const useCase = new CreateBrandUseCase(repository)

    const result = await useCase.execute(validParams)

    expect(result.isOk).toBe(true)
    if (result.isOk) {
      expect(result.value.name).toBe('Yamaha')
      expect(result.value.id).toBeDefined()
    }
    expect(repository.save).toHaveBeenCalledTimes(1)
  })

  it('should reject an empty name', async () => {
    const repository = makeMockRepository()
    const useCase = new CreateBrandUseCase(repository)

    const result = await useCase.execute({ name: '   ' })

    expect(result.isErr).toBe(true)
    if (result.isErr) {
      expect(result.error.code).toBe('VALIDATION_ERROR')
    }
    expect(repository.save).not.toHaveBeenCalled()
  })

  it('should reject a name that already exists', async () => {
    const existing = new Brand('id-existing', 'Yamaha', new Date())
    const repository = makeMockRepository(existing)
    const useCase = new CreateBrandUseCase(repository)

    const result = await useCase.execute(validParams)

    expect(result.isErr).toBe(true)
    if (result.isErr) {
      expect(result.error.code).toBe('VALIDATION_ERROR')
    }
    expect(repository.save).not.toHaveBeenCalled()
  })

  it('should propagate repository error', async () => {
    const repository: IBrandRepository = {
      findAll: jest.fn(),
      findById: jest.fn(),
      findByName: jest.fn(async () => null),
      save: jest.fn(async () => { throw new Error('db down') }),
      update: jest.fn(),
      delete: jest.fn(),
    }
    const useCase = new CreateBrandUseCase(repository)

    await expect(useCase.execute(validParams)).rejects.toThrow('db down')
  })
})
