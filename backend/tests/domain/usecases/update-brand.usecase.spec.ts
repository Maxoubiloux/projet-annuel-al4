import { UpdateBrandUseCase } from '@domain/usecases/update-brand.usecase'
import { IBrandRepository } from '@domain/repositories/IBrandRepository'
import { Brand } from '@domain/entities/Brand'

const brandFixture = new Brand('id-1', 'Yamaha', new Date())

const makeMockRepository = (
  brand: Brand | null,
  conflict: Brand | null = null,
): IBrandRepository => ({
  findAll: jest.fn(),
  findById: jest.fn(async () => brand),
  findByName: jest.fn(async () => conflict),
  save: jest.fn(),
  update: jest.fn(async (_id, params) => {
    if (!brand) throw new Error('should not be called')
    return new Brand(brand.id, params.name ?? brand.name, brand.createdAt)
  }),
  delete: jest.fn(),
})

describe('UpdateBrandUseCase', () => {
  it('should update a brand successfully', async () => {
    const repo = makeMockRepository(brandFixture)
    const useCase = new UpdateBrandUseCase(repo)

    const result = await useCase.execute('id-1', { name: 'Honda' })

    expect(result.isOk).toBe(true)
    if (result.isOk) {
      expect(result.value.name).toBe('Honda')
    }
  })

  it('should return NotFoundError when brand does not exist', async () => {
    const useCase = new UpdateBrandUseCase(makeMockRepository(null))

    const result = await useCase.execute('unknown', { name: 'Honda' })

    expect(result.isErr).toBe(true)
    if (result.isErr) {
      expect(result.error.code).toBe('NOT_FOUND')
    }
  })

  it('should reject an empty name', async () => {
    const useCase = new UpdateBrandUseCase(makeMockRepository(brandFixture))

    const result = await useCase.execute('id-1', { name: '   ' })

    expect(result.isErr).toBe(true)
    if (result.isErr) {
      expect(result.error.code).toBe('VALIDATION_ERROR')
    }
  })

  it('should reject a name already used by another brand', async () => {
    const conflicting = new Brand('other-id', 'Honda', new Date())
    const useCase = new UpdateBrandUseCase(makeMockRepository(brandFixture, conflicting))

    const result = await useCase.execute('id-1', { name: 'Honda' })

    expect(result.isErr).toBe(true)
    if (result.isErr) {
      expect(result.error.code).toBe('VALIDATION_ERROR')
    }
  })

  it('should allow keeping the same name', async () => {
    const useCase = new UpdateBrandUseCase(makeMockRepository(brandFixture, brandFixture))

    const result = await useCase.execute('id-1', { name: 'Yamaha' })

    expect(result.isOk).toBe(true)
  })
})
