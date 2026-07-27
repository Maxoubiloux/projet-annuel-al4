import { RefundReservationUseCase } from '@domain/usecases/refund-reservation.usecase'
import { IReservationRepository } from '@domain/repositories/IReservationRepository'
import { IPaymentRepository } from '@domain/repositories/IPaymentRepository'
import { Reservation } from '@domain/entities/Reservation'
import { Payment } from '@domain/entities/Payment'

function makeReservation(paymentStatus: string): Reservation {
  return new Reservation(
    'res-1', 'moto-1', 'cust-1', '2026-08-01', '2026-08-05',
    340, 500, 'confirmed', paymentStatus, new Date(),
  )
}

const makeMockReservationRepository = (reservation: Reservation | null): IReservationRepository => ({
  findAll: jest.fn(),
  findRecent: jest.fn(),
  findById: jest.fn(async () => reservation),
  findMotoPricePerDay: jest.fn(),
  hasActiveOverlap: jest.fn(),
  ensureCustomer: jest.fn(),
  save: jest.fn(),
  updateStatus: jest.fn(),
  updatePaymentStatus: jest.fn(async (id, paymentStatus) => makeReservation(paymentStatus)),
  updateContract: jest.fn(),
})

const makeMockPaymentRepository = (payment: Payment | null): IPaymentRepository => ({
  findAll: jest.fn(),
  findById: jest.fn(),
  findByBookingId: jest.fn(async () => payment),
  save: jest.fn(),
  updateStatus: jest.fn(),
  refund: jest.fn(async (id) => new Payment(id, 'PAY-1', 'cust-1', 340, 500, 'card', new Date(), 'refunded')),
})

describe('RefundReservationUseCase', () => {
  it('should refund a paid reservation and its linked payment', async () => {
    const reservationRepo = makeMockReservationRepository(makeReservation('paid'))
    const payment = new Payment('pay-1', 'PAY-1', 'cust-1', 340, 500, 'card', new Date(), 'paid', undefined, 'res-1')
    const paymentRepo = makeMockPaymentRepository(payment)
    const useCase = new RefundReservationUseCase(reservationRepo, paymentRepo)

    const result = await useCase.execute('res-1')

    expect(result.isOk).toBe(true)
    if (result.isOk) {
      expect(result.value.paymentStatus).toBe('refunded')
    }
    expect(paymentRepo.refund).toHaveBeenCalledWith('pay-1')
  })

  it('should return NotFoundError when reservation does not exist', async () => {
    const useCase = new RefundReservationUseCase(makeMockReservationRepository(null), makeMockPaymentRepository(null))

    const result = await useCase.execute('unknown')

    expect(result.isErr).toBe(true)
    if (result.isErr) {
      expect(result.error.code).toBe('NOT_FOUND')
    }
  })

  it('should reject refunding an already refunded reservation', async () => {
    const reservationRepo = makeMockReservationRepository(makeReservation('refunded'))
    const useCase = new RefundReservationUseCase(reservationRepo, makeMockPaymentRepository(null))

    const result = await useCase.execute('res-1')

    expect(result.isErr).toBe(true)
    if (result.isErr) {
      expect(result.error.code).toBe('VALIDATION_ERROR')
    }
  })
})
