import { UpdateMotoUseCase } from './update-moto.usecase'
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
  update: jest.fn(async (_id, params) => {
    if (!moto) throw new Error('should not be called')
    return new Moto(
      moto.id, params.brandId ?? moto.brandId, params.model ?? moto.model,
      params.serialNumber ?? moto.serialNumber, params.registration ?? moto.registration,
      params.categoryId ?? moto.categoryId, params.statusId ?? moto.statusId,
      params.currentKm ?? moto.currentKm, params.pricePerDay ?? moto.pricePerDay,
      params.description ?? moto.description, moto.createdAt,
    )
  }),
  delete: jest.fn(),
})

describe('UpdateMotoUseCase', () => {
  it('should update a moto successfully', async () => {
    const repo = makeMockRepository(motoFixture)
    const useCase = new UpdateMotoUseCase(repo)

    const result = await useCase.execute('id-1', { model: 'MT-09' })

    expect(result.isOk).toBe(true)
    if (result.isOk) {
      expect(result.value.model).toBe('MT-09')
    }
  })

  it('should return NotFoundError when moto does not exist', async () => {
    const useCase = new UpdateMotoUseCase(makeMockRepository(null))

    const result = await useCase.execute('unknown', { model: 'MT-09' })

    expect(result.isErr).toBe(true)
    if (result.isErr) {
      expect(result.error.code).toBe('NOT_FOUND')
    }
  })

  it('should reject negative price', async () => {
    const useCase = new UpdateMotoUseCase(makeMockRepository(motoFixture))

    const result = await useCase.execute('id-1', { pricePerDay: -5 })

    expect(result.isErr).toBe(true)
    if (result.isErr) {
      expect(result.error.code).toBe('VALIDATION_ERROR')
    }
  })

  it('should reject negative km', async () => {
    const useCase = new UpdateMotoUseCase(makeMockRepository(motoFixture))

    const result = await useCase.execute('id-1', { currentKm: -1 })

    expect(result.isErr).toBe(true)
    if (result.isErr) {
      expect(result.error.code).toBe('VALIDATION_ERROR')
    }
  })
})
