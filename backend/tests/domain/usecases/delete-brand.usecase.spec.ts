import { DeleteBrandUseCase } from '@domain/usecases/delete-brand.usecase'
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

describe('DeleteBrandUseCase', () => {
  it('should delete a brand successfully', async () => {
    const repo = makeMockRepository(brandFixture)
    const useCase = new DeleteBrandUseCase(repo)

    const result = await useCase.execute('id-1')

    expect(result.isOk).toBe(true)
    expect(repo.delete).toHaveBeenCalledWith('id-1')
  })

  it('should return NotFoundError when brand does not exist', async () => {
    const useCase = new DeleteBrandUseCase(makeMockRepository(null))

    const result = await useCase.execute('unknown')

    expect(result.isErr).toBe(true)
    if (result.isErr) {
      expect(result.error.code).toBe('NOT_FOUND')
    }
  })
})
