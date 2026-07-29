import { ConfirmClientReservationPaymentUseCase } from '@domain/usecases/confirm-client-reservation-payment.usecase'
import { IReservationRepository } from '@domain/repositories/IReservationRepository'
import { IPaymentRepository } from '@domain/repositories/IPaymentRepository'
import { IPaymentGateway, CheckoutSessionStatus } from '@domain/repositories/IPaymentGateway'
import { IContractQueuePublisher } from '@domain/ports/IContractQueuePublisher'
import { Reservation } from '@domain/entities/Reservation'
import { Payment } from '@domain/entities/Payment'
import { customerSummary, hydrate, motoSummary, shopSummary } from '../../helpers/reservation-fixtures'

const bookingId = '550e8400-e29b-41d4-a716-446655440099'
const sessionId = 'cs_test_123'

function makePendingReservation(): Reservation {
  return hydrate(
    new Reservation(
      bookingId,
      motoSummary.id,
      customerSummary.id,
      '2026-08-01',
      '2026-08-05',
      340,
      500,
      'pending',
      'pending',
      new Date(),
    ),
  )
}

const makeMockReservationRepository = (): IReservationRepository => ({
  findAll: jest.fn(),
  findRecent: jest.fn(),
  findById: jest.fn(async () => makePendingReservation()),
  findMotoPricePerDay: jest.fn(),
  hasActiveOverlap: jest.fn(),
  ensureCustomer: jest.fn(),
  save: jest.fn(),
  updateStatus: jest.fn(async () => hydrate({ ...makePendingReservation(), status: 'confirmed', paymentStatus: 'paid' } as Reservation)),
  updatePaymentStatus: jest.fn(),
  updateContract: jest.fn(),
})

const makeMockPaymentRepository = (): IPaymentRepository => ({
  findAll: jest.fn(),
  findById: jest.fn(),
  findByBookingId: jest.fn(async () => Payment.create('pay-1', {
    ref: 'PAY-TEST',
    bookingId,
    customerId: customerSummary.id,
    amount: 340,
    deposit: 500,
    method: 'card',
    status: 'pending',
  })),
  save: jest.fn(),
  updateStatus: jest.fn(),
  refund: jest.fn(),
})

const makeMockPaymentGateway = (): IPaymentGateway => ({
  createCheckoutSession: jest.fn(),
  retrieveCheckoutSession: jest.fn(async (): Promise<CheckoutSessionStatus> => ({
    id: sessionId,
    reservationId: bookingId,
    paymentStatus: 'paid',
  })),
})

describe('ConfirmClientReservationPaymentUseCase', () => {
  it('should publish a contract generation job once the payment is confirmed as paid', async () => {
    const contractPublisher: IContractQueuePublisher = { publishContractGeneration: jest.fn() }
    const useCase = new ConfirmClientReservationPaymentUseCase(
      makeMockReservationRepository(),
      makeMockPaymentRepository(),
      makeMockPaymentGateway(),
      contractPublisher,
    )

    const result = await useCase.execute(bookingId, customerSummary.id, sessionId)

    expect(result.isOk).toBe(true)
    expect(contractPublisher.publishContractGeneration).toHaveBeenCalledTimes(1)
    const publishedJob = (contractPublisher.publishContractGeneration as jest.Mock).mock.calls[0][0]
    expect(publishedJob.reservation.id).toBe(bookingId)
    expect(publishedJob.reservation.customer).toEqual(customerSummary)
    expect(publishedJob.reservation.moto).toEqual(motoSummary)
    expect(publishedJob.reservation.shop).toEqual(shopSummary)
  })

  it('should not publish a contract job when the Stripe session is not paid', async () => {
    const contractPublisher: IContractQueuePublisher = { publishContractGeneration: jest.fn() }
    const paymentGateway: IPaymentGateway = {
      createCheckoutSession: jest.fn(),
      retrieveCheckoutSession: jest.fn(async (): Promise<CheckoutSessionStatus> => ({
        id: sessionId,
        reservationId: bookingId,
        paymentStatus: 'unpaid',
      })),
    }
    const useCase = new ConfirmClientReservationPaymentUseCase(
      makeMockReservationRepository(),
      makeMockPaymentRepository(),
      paymentGateway,
      contractPublisher,
    )

    const result = await useCase.execute(bookingId, customerSummary.id, sessionId)

    expect(result.isErr).toBe(true)
    expect(contractPublisher.publishContractGeneration).not.toHaveBeenCalled()
  })

  it('should still confirm the payment when publishing the contract job fails', async () => {
    const contractPublisher: IContractQueuePublisher = {
      publishContractGeneration: jest.fn(async () => {
        throw new Error('broker unreachable')
      }),
    }
    const useCase = new ConfirmClientReservationPaymentUseCase(
      makeMockReservationRepository(),
      makeMockPaymentRepository(),
      makeMockPaymentGateway(),
      contractPublisher,
    )

    const result = await useCase.execute(bookingId, customerSummary.id, sessionId)

    expect(result.isOk).toBe(true)
  })

  it('should not require a publisher (async contract generation is optional)', async () => {
    const useCase = new ConfirmClientReservationPaymentUseCase(
      makeMockReservationRepository(),
      makeMockPaymentRepository(),
      makeMockPaymentGateway(),
    )

    const result = await useCase.execute(bookingId, customerSummary.id, sessionId)

    expect(result.isOk).toBe(true)
  })
})
