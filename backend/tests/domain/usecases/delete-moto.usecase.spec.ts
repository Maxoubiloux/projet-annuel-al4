import { DeleteMotoUseCase } from '@domain/usecases/delete-moto.usecase'
import { IMotoRepository } from '@domain/repositories/IMotoRepository'
import { Moto } from '@domain/entities/Moto'

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

describe('DeleteMotoUseCase', () => {
  it('should delete a moto successfully', async () => {
    const repo = makeMockRepository(motoFixture)
    const useCase = new DeleteMotoUseCase(repo)

    const result = await useCase.execute('id-1')

    expect(result.isOk).toBe(true)
    expect(repo.delete).toHaveBeenCalledWith('id-1')
  })

  it('should return NotFoundError when moto does not exist', async () => {
    const useCase = new DeleteMotoUseCase(makeMockRepository(null))

    const result = await useCase.execute('unknown')

    expect(result.isErr).toBe(true)
    if (result.isErr) {
      expect(result.error.code).toBe('NOT_FOUND')
    }
  })
})
