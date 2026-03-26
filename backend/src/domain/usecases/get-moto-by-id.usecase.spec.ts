import { GetMotoByIdUseCase } from './get-moto-by-id.usecase'
import { IMotoRepository } from '../repositories/IMotoRepository'
import { Moto } from '../entities/Moto'

const motoFixture = new Moto(
  'id-1', 'brand-1', 'MT-07', 'VIN001', 'AB-123-CD',
  'cat-1', 'status-1', 15000, 89, 'desc', new Date(),
)

const makeMockRepository = (moto: Moto | null): IMotoRepository => ({
  findAll: jest.fn(),
  findById: jest.fn(async () => moto),
  save: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
})

describe('GetMotoByIdUseCase', () => {
  it('should return the moto when found', async () => {
    const useCase = new GetMotoByIdUseCase(makeMockRepository(motoFixture))

    const result = await useCase.execute('id-1')

    expect(result.isOk).toBe(true)
    if (result.isOk) {
      expect(result.value.id).toBe('id-1')
    }
  })

  it('should return NotFoundError when moto does not exist', async () => {
    const useCase = new GetMotoByIdUseCase(makeMockRepository(null))

    const result = await useCase.execute('unknown-id')

    expect(result.isErr).toBe(true)
    if (result.isErr) {
      expect(result.error.code).toBe('NOT_FOUND')
    }
  })
})
