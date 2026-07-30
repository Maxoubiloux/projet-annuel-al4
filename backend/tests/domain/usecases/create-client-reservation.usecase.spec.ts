import { CreateClientReservationUseCase } from '@domain/usecases/create-client-reservation.usecase'
import { IReservationRepository } from '@domain/repositories/IReservationRepository'
import { IPaymentRepository } from '@domain/repositories/IPaymentRepository'
import { Reservation } from '@domain/entities/Reservation'
import { Payment } from '@domain/entities/Payment'
import { customerSummary, hydrate, motoSummary } from '../../helpers/reservation-fixtures'

const makeMockReservationRepository = (): IReservationRepository => ({
  findAll: jest.fn(),
  findRecent: jest.fn(),
  findById: jest.fn(),
  findMotoPricePerDay: jest.fn(async () => 85),
  hasActiveOverlap: jest.fn(async () => false),
  ensureCustomer: jest.fn(),
  save: jest.fn(async (r: Reservation) => hydrate(r)),
  updateStatus: jest.fn(),
  updatePaymentStatus: jest.fn(),
  updateContract: jest.fn(),
})

const makeMockPaymentRepository = (): IPaymentRepository => ({
  findAll: jest.fn(),
  findById: jest.fn(),
  findByBookingId: jest.fn(),
  save: jest.fn(async (p: Payment) => p),
  updateStatus: jest.fn(),
  refund: jest.fn(),
})

/** Deux jours à partir de demain : le use-case refuse les dates passées. */
function futureDate(daysFromNow: number): string {
  const d = new Date()
  d.setDate(d.getDate() + daysFromNow)
  return d.toISOString().slice(0, 10)
}

describe('CreateClientReservationUseCase', () => {
  const validParams = {
    userId: customerSummary.id,
    motoId: motoSummary.id,
    startDate: futureDate(1),
    endDate: futureDate(3),
    email: customerSummary.email,
    firstName: customerSummary.firstName,
    lastName: customerSummary.lastName,
    phone: customerSummary.phone,
  }

  it('should create the reservation and its linked payment', async () => {
    const reservationRepository = makeMockReservationRepository()
    const paymentRepository = makeMockPaymentRepository()
    const useCase = new CreateClientReservationUseCase(reservationRepository, paymentRepository)

    const result = await useCase.execute(validParams)

    expect(result.isOk).toBe(true)
    expect(reservationRepository.save).toHaveBeenCalledTimes(1)
    expect(paymentRepository.save).toHaveBeenCalledTimes(1)
  })
})
