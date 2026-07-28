import { CreateClientReservationUseCase } from '@domain/usecases/create-client-reservation.usecase'
import { IReservationRepository } from '@domain/repositories/IReservationRepository'
import { IPaymentRepository } from '@domain/repositories/IPaymentRepository'
import { IContractQueuePublisher } from '@domain/ports/IContractQueuePublisher'
import { Reservation } from '@domain/entities/Reservation'
import { Payment } from '@domain/entities/Payment'
import { customerSummary, hydrate, motoSummary, shopSummary } from '../../helpers/reservation-fixtures'

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

  it('should publish a contract generation job carrying the denormalized reservation data', async () => {
    const contractPublisher: IContractQueuePublisher = { publishContractGeneration: jest.fn() }
    const useCase = new CreateClientReservationUseCase(
      makeMockReservationRepository(),
      makeMockPaymentRepository(),
      contractPublisher,
    )

    const result = await useCase.execute(validParams)

    expect(result.isOk).toBe(true)
    expect(contractPublisher.publishContractGeneration).toHaveBeenCalledTimes(1)
    const publishedJob = (contractPublisher.publishContractGeneration as jest.Mock).mock.calls[0][0]
    expect(typeof publishedJob.correlationId).toBe('string')
    expect(publishedJob.correlationId.length).toBeGreaterThan(0)
    expect(publishedJob.reservation.motoId).toBe(validParams.motoId)
    expect(publishedJob.reservation.customer).toEqual(customerSummary)
    expect(publishedJob.reservation.moto).toEqual(motoSummary)
    expect(publishedJob.reservation.shop).toEqual(shopSummary)
  })

  it('should still create the reservation when publishing the contract job fails', async () => {
    const reservationRepository = makeMockReservationRepository()
    const paymentRepository = makeMockPaymentRepository()
    const contractPublisher: IContractQueuePublisher = {
      publishContractGeneration: jest.fn(async () => {
        throw new Error('broker unreachable')
      }),
    }
    const useCase = new CreateClientReservationUseCase(
      reservationRepository,
      paymentRepository,
      contractPublisher,
    )

    const result = await useCase.execute(validParams)

    expect(result.isOk).toBe(true)
    expect(reservationRepository.save).toHaveBeenCalledTimes(1)
    expect(paymentRepository.save).toHaveBeenCalledTimes(1)
  })

  it('should not require a publisher (async contract generation is optional)', async () => {
    const useCase = new CreateClientReservationUseCase(
      makeMockReservationRepository(),
      makeMockPaymentRepository(),
    )

    const result = await useCase.execute(validParams)

    expect(result.isOk).toBe(true)
  })
})
