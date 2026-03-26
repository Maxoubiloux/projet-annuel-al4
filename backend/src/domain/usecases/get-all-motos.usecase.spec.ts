import { GetAllMotosUseCase } from './get-all-motos.usecase'
import { IMotoRepository } from '../repositories/IMotoRepository'
import { Moto } from '../entities/Moto'

const motoFixture = new Moto(
  'id-1', 'brand-1', 'MT-07', 'VIN001', 'AB-123-CD',
  'cat-1', 'status-1', 15000, 89, 'desc', new Date(),
)

describe('GetAllMotosUseCase', () => {
  it('should return all motos', async () => {
    const repository: IMotoRepository = {
      findAll: jest.fn(async () => [motoFixture]),
      findById: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    }
    const useCase = new GetAllMotosUseCase(repository)

    const result = await useCase.execute()

    expect(result).toHaveLength(1)
    expect(result[0].id).toBe('id-1')
  })

  it('should return empty array when no motos', async () => {
    const repository: IMotoRepository = {
      findAll: jest.fn(async () => []),
      findById: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    }
    const useCase = new GetAllMotosUseCase(repository)

    const result = await useCase.execute()

    expect(result).toHaveLength(0)
  })
})
