import { CreateReservationUseCase } from '@domain/usecases/create-reservation.usecase'
import { IReservationRepository } from '@domain/repositories/IReservationRepository'
import { IPaymentRepository } from '@domain/repositories/IPaymentRepository'
import { Reservation } from '@domain/entities/Reservation'
import { Payment } from '@domain/entities/Payment'

const makeMockReservationRepository = (): IReservationRepository => ({
  findAll: jest.fn(),
  findRecent: jest.fn(),
  findById: jest.fn(),
  findMotoPricePerDay: jest.fn(),
  hasActiveOverlap: jest.fn(),
  ensureCustomer: jest.fn(),
  save: jest.fn(async (r: Reservation) => r),
  updateStatus: jest.fn(),
  updatePaymentStatus: jest.fn(),
})

const makeMockPaymentRepository = (): IPaymentRepository => ({
  findAll: jest.fn(),
  findById: jest.fn(),
  findByBookingId: jest.fn(),
  save: jest.fn(async (p: Payment) => p),
  updateStatus: jest.fn(),
  refund: jest.fn(),
})

describe('CreateReservationUseCase', () => {
  const validParams = {
    motoId: '550e8400-e29b-41d4-a716-446655440001',
    customerId: '550e8400-e29b-41d4-a716-446655440002',
    startDate: '2026-08-01',
    endDate: '2026-08-05',
    totalAmount: 340,
    depositAmount: 500,
    status: 'pending',
    paymentStatus: 'pending',
  }

  it('should create a reservation and its linked payment', async () => {
    const reservationRepository = makeMockReservationRepository()
    const paymentRepository = makeMockPaymentRepository()
    const useCase = new CreateReservationUseCase(reservationRepository, paymentRepository)

    const result = await useCase.execute(validParams)

    expect(result.isOk).toBe(true)
    if (result.isOk) {
      expect(result.value.motoId).toBe(validParams.motoId)
      expect(result.value.totalAmount).toBe(340)
    }
    expect(reservationRepository.save).toHaveBeenCalledTimes(1)
    expect(paymentRepository.save).toHaveBeenCalledTimes(1)
  })

  it('should reject an end date before the start date', async () => {
    const useCase = new CreateReservationUseCase(makeMockReservationRepository(), makeMockPaymentRepository())

    const result = await useCase.execute({ ...validParams, endDate: '2026-07-31' })

    expect(result.isErr).toBe(true)
    if (result.isErr) {
      expect(result.error.code).toBe('VALIDATION_ERROR')
    }
  })

  it('should reject a zero total amount', async () => {
    const useCase = new CreateReservationUseCase(makeMockReservationRepository(), makeMockPaymentRepository())

    const result = await useCase.execute({ ...validParams, totalAmount: 0 })

    expect(result.isErr).toBe(true)
  })

  it('should reject a negative deposit', async () => {
    const useCase = new CreateReservationUseCase(makeMockReservationRepository(), makeMockPaymentRepository())

    const result = await useCase.execute({ ...validParams, depositAmount: -1 })

    expect(result.isErr).toBe(true)
  })
})
