import { GetAllBrandsUseCase } from './get-all-brands.usecase'
import { IBrandRepository } from '../repositories/IBrandRepository'
import { Brand } from '../entities/Brand'

const brandFixture = new Brand('id-1', 'Yamaha', new Date())

describe('GetAllBrandsUseCase', () => {
  it('should return all brands', async () => {
    const repository: IBrandRepository = {
      findAll: jest.fn(async () => [brandFixture]),
      findById: jest.fn(),
      findByName: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    }
    const useCase = new GetAllBrandsUseCase(repository)

    const result = await useCase.execute()

    expect(result).toHaveLength(1)
    expect(result[0].id).toBe('id-1')
  })

  it('should return empty array when no brands', async () => {
    const repository: IBrandRepository = {
      findAll: jest.fn(async () => []),
      findById: jest.fn(),
      findByName: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    }
    const useCase = new GetAllBrandsUseCase(repository)

    const result = await useCase.execute()

    expect(result).toHaveLength(0)
  })
})
