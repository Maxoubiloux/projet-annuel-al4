import { CreateReservationUseCase } from '@domain/usecases/create-reservation.usecase'
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
  findMotoPricePerDay: jest.fn(),
  hasActiveOverlap: jest.fn(),
  ensureCustomer: jest.fn(),
  save: jest.fn(async (r: Reservation) => r),
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

  it('should publish a contract generation job with a correlation id and the reservation data', async () => {
    const reservationRepository = makeMockReservationRepository()
    const contractPublisher: IContractQueuePublisher = { publishContractGeneration: jest.fn() }
    const useCase = new CreateReservationUseCase(
      reservationRepository,
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
    expect(publishedJob.reservation.customerId).toBe(validParams.customerId)
    expect(publishedJob.reservation.totalAmount).toBe(validParams.totalAmount)
  })

  it('should join the denormalized customer, moto and shop data to the contract job', async () => {
    // Le worker est isolé (aucun accès BDD) : tout ce qui doit figurer sur le
    // contrat doit partir dans le message, à partir de la réservation hydratée
    // renvoyée par le repository.
    const reservationRepository = makeMockReservationRepository()
    reservationRepository.save = jest.fn(async (r: Reservation) => hydrate(r))
    const contractPublisher: IContractQueuePublisher = { publishContractGeneration: jest.fn() }
    const useCase = new CreateReservationUseCase(
      reservationRepository,
      makeMockPaymentRepository(),
      contractPublisher,
    )

    await useCase.execute(validParams)

    const publishedJob = (contractPublisher.publishContractGeneration as jest.Mock).mock.calls[0][0]
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
    const useCase = new CreateReservationUseCase(reservationRepository, paymentRepository, contractPublisher)

    const result = await useCase.execute(validParams)

    expect(result.isOk).toBe(true)
    expect(reservationRepository.save).toHaveBeenCalledTimes(1)
    expect(paymentRepository.save).toHaveBeenCalledTimes(1)
  })

  it('should not require a publisher (async contract generation is optional)', async () => {
    const useCase = new CreateReservationUseCase(makeMockReservationRepository(), makeMockPaymentRepository())

    const result = await useCase.execute(validParams)

    expect(result.isOk).toBe(true)
  })
})
