import { GetReservationContractUseCase } from '@domain/usecases/get-reservation-contract.usecase'
import { IReservationRepository } from '@domain/repositories/IReservationRepository'
import { Reservation } from '@domain/entities/Reservation'
import { customerSummary, motoSummary, shopSummary } from '../../helpers/reservation-fixtures'

const RESERVATION_ID = '748b0ba5-5d32-4c5a-ac67-89dc792c8a4f'
const OTHER_CUSTOMER_ID = '00000000-0000-4000-8000-000000000999'

function makeReservation(contractStatus: string): Reservation {
  return new Reservation(
    RESERVATION_ID,
    motoSummary.id,
    customerSummary.id,
    '2026-08-01',
    '2026-08-05',
    340,
    500,
    'pending',
    'pending',
    new Date(),
    motoSummary,
    customerSummary,
    contractStatus,
    undefined,
    shopSummary,
  )
}

const makeRepository = (reservation: Reservation | null): IReservationRepository => ({
  findAll: jest.fn(),
  findRecent: jest.fn(),
  findById: jest.fn(async () => reservation),
  findMotoPricePerDay: jest.fn(),
  findMotoStatus: jest.fn(),
  hasActiveOverlap: jest.fn(),
  ensureCustomer: jest.fn(),
  save: jest.fn(),
  updateStatus: jest.fn(),
  updatePaymentStatus: jest.fn(),
  updateContract: jest.fn(),
})

describe('GetReservationContractUseCase', () => {
  const owner = { id: customerSummary.id, isAdmin: false }
  const admin = { id: 'admin-1', isAdmin: true }
  const stranger = { id: OTHER_CUSTOMER_ID, isAdmin: false }

  it('should return the file reference to the customer who owns the reservation', async () => {
    const useCase = new GetReservationContractUseCase(makeRepository(makeReservation('ready')))

    const result = await useCase.execute({ reservationId: RESERVATION_ID, requester: owner })

    expect(result.isOk).toBe(true)
    if (result.isOk) {
      expect(result.value.reservationId).toBe(RESERVATION_ID)
      expect(result.value.fileName).toBe(`${RESERVATION_ID}.pdf`)
    }
  })

  it('should allow an administrator to download any contract', async () => {
    const useCase = new GetReservationContractUseCase(makeRepository(makeReservation('ready')))

    const result = await useCase.execute({ reservationId: RESERVATION_ID, requester: admin })

    expect(result.isOk).toBe(true)
  })

  it('should forbid a customer from downloading someone else contract', async () => {
    const useCase = new GetReservationContractUseCase(makeRepository(makeReservation('ready')))

    const result = await useCase.execute({ reservationId: RESERVATION_ID, requester: stranger })

    expect(result.isErr).toBe(true)
    if (result.isErr) expect(result.error.code).toBe('FORBIDDEN')
  })

  it('should not expose a contract that the worker has not produced yet', async () => {
    for (const status of ['pending', 'processing', 'failed']) {
      const useCase = new GetReservationContractUseCase(makeRepository(makeReservation(status)))

      const result = await useCase.execute({ reservationId: RESERVATION_ID, requester: owner })

      expect(result.isErr).toBe(true)
      if (result.isErr) expect(result.error.code).toBe('NOT_FOUND')
    }
  })

  it('should return not found for an unknown reservation', async () => {
    const useCase = new GetReservationContractUseCase(makeRepository(null))

    const result = await useCase.execute({ reservationId: RESERVATION_ID, requester: admin })

    expect(result.isErr).toBe(true)
    if (result.isErr) expect(result.error.code).toBe('NOT_FOUND')
  })
})
