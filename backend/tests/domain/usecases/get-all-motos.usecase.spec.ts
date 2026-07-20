import { GetAllMotosUseCase } from '@domain/usecases/get-all-motos.usecase'
import { IMotoRepository } from '@domain/repositories/IMotoRepository'
import { Moto } from '@domain/entities/Moto'

const motoFixture = new Moto(
  'id-1', 'Yamaha', 'MT-07', 'AB-123-CD', 2024, 'A2',
  15000, 89, 500, 'available', 'Paris — Bastille', 'desc', new Date(),
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
