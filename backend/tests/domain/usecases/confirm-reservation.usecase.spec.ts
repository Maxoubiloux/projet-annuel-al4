import { ConfirmReservationUseCase } from '@domain/usecases/confirm-reservation.usecase'
import { IReservationRepository } from '@domain/repositories/IReservationRepository'
import { Reservation } from '@domain/entities/Reservation'

function makeReservation(status: string): Reservation {
  return new Reservation(
    'res-1', 'moto-1', 'cust-1', '2026-08-01', '2026-08-05',
    340, 500, status, 'pending', new Date(),
  )
}

const makeMockRepository = (reservation: Reservation | null): IReservationRepository => ({
  findAll: jest.fn(),
  findRecent: jest.fn(),
  findById: jest.fn(async () => reservation),
  findMotoPricePerDay: jest.fn(),
  hasActiveOverlap: jest.fn(),
  ensureCustomer: jest.fn(),
  save: jest.fn(),
  updateStatus: jest.fn(async (id, status) => makeReservation(status)),
  updatePaymentStatus: jest.fn(),
  updateContract: jest.fn(),
})

describe('ConfirmReservationUseCase', () => {
  it('should confirm a pending reservation', async () => {
    const repo = makeMockRepository(makeReservation('pending'))
    const useCase = new ConfirmReservationUseCase(repo)

    const result = await useCase.execute('res-1')

    expect(result.isOk).toBe(true)
    if (result.isOk) {
      expect(result.value.status).toBe('confirmed')
    }
  })

  it('should return NotFoundError when reservation does not exist', async () => {
    const useCase = new ConfirmReservationUseCase(makeMockRepository(null))

    const result = await useCase.execute('unknown')

    expect(result.isErr).toBe(true)
    if (result.isErr) {
      expect(result.error.code).toBe('NOT_FOUND')
    }
  })

  it('should reject confirming a non-pending reservation', async () => {
    const repo = makeMockRepository(makeReservation('confirmed'))
    const useCase = new ConfirmReservationUseCase(repo)

    const result = await useCase.execute('res-1')

    expect(result.isErr).toBe(true)
    if (result.isErr) {
      expect(result.error.code).toBe('VALIDATION_ERROR')
    }
  })
})
