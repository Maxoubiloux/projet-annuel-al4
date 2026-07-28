import { UpdateMotoUseCase } from '@domain/usecases/update-moto.usecase'
import { IMotoRepository } from '@domain/repositories/IMotoRepository'
import { Moto } from '@domain/entities/Moto'

const motoFixture = new Moto(
  'id-1', 'Yamaha', 'MT-07', 'AB-123-CD', 2024, 'A2',
  15000, 89, 500, 'available', 'Paris — Bastille', 'desc', new Date(),
)

const makeMockRepository = (moto: Moto | null): IMotoRepository => ({
  findAll: jest.fn(),
  findById: jest.fn(async () => moto),
  findReservedTodayIds: jest.fn(),
  findAvailability: jest.fn(),
  save: jest.fn(),
  update: jest.fn(async (_id, params) => {
    if (!moto) throw new Error('should not be called')
    return new Moto(
      moto.id, params.brand ?? moto.brand, params.model ?? moto.model,
      params.plate ?? moto.plate, params.year ?? moto.year, params.category ?? moto.category,
      params.mileage ?? moto.mileage, params.pricePerDay ?? moto.pricePerDay,
      params.deposit ?? moto.deposit, params.status ?? moto.status,
      params.location ?? moto.location, params.description ?? moto.description, moto.createdAt,
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

  it('should reject negative mileage', async () => {
    const useCase = new UpdateMotoUseCase(makeMockRepository(motoFixture))

    const result = await useCase.execute('id-1', { mileage: -1 })

    expect(result.isErr).toBe(true)
    if (result.isErr) {
      expect(result.error.code).toBe('VALIDATION_ERROR')
    }
  })

  it('should reject an invalid status', async () => {
    const useCase = new UpdateMotoUseCase(makeMockRepository(motoFixture))

    const result = await useCase.execute('id-1', { status: 'published' })

    expect(result.isErr).toBe(true)
    if (result.isErr) {
      expect(result.error.code).toBe('VALIDATION_ERROR')
    }
  })
})
