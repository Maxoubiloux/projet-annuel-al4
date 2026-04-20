import { GetBrandByIdUseCase } from '@domain/usecases/get-brand-by-id.usecase'
import { IBrandRepository } from '@domain/repositories/IBrandRepository'
import { Brand } from '@domain/entities/Brand'

const brandFixture = new Brand('id-1', 'Yamaha', new Date())

const makeMockRepository = (brand: Brand | null): IBrandRepository => ({
  findAll: jest.fn(),
  findById: jest.fn(async () => brand),
  findByName: jest.fn(),
  save: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
})

describe('GetBrandByIdUseCase', () => {
  it('should return the brand when found', async () => {
    const useCase = new GetBrandByIdUseCase(makeMockRepository(brandFixture))

    const result = await useCase.execute('id-1')

    expect(result.isOk).toBe(true)
    if (result.isOk) {
      expect(result.value.id).toBe('id-1')
    }
  })

  it('should return NotFoundError when brand does not exist', async () => {
    const useCase = new GetBrandByIdUseCase(makeMockRepository(null))

    const result = await useCase.execute('unknown-id')

    expect(result.isErr).toBe(true)
    if (result.isErr) {
      expect(result.error.code).toBe('NOT_FOUND')
    }
  })
})
