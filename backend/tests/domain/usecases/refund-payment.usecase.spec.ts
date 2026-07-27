import { RefundPaymentUseCase } from '@domain/usecases/refund-payment.usecase'
import { IPaymentRepository } from '@domain/repositories/IPaymentRepository'
import { Payment } from '@domain/entities/Payment'

function makePayment(status: string): Payment {
  return new Payment('pay-1', 'PAY-001', 'cust-1', 340, 500, 'card', new Date(), status)
}

const makeMockRepository = (payment: Payment | null): IPaymentRepository => ({
  findAll: jest.fn(),
  findById: jest.fn(async () => payment),
  findByBookingId: jest.fn(),
  save: jest.fn(),
  updateStatus: jest.fn(),
  refund: jest.fn(async (id) => makePayment('refunded')),
})

describe('RefundPaymentUseCase', () => {
  it('should refund a paid payment', async () => {
    const useCase = new RefundPaymentUseCase(makeMockRepository(makePayment('paid')))

    const result = await useCase.execute('pay-1')

    expect(result.isOk).toBe(true)
    if (result.isOk) {
      expect(result.value.status).toBe('refunded')
    }
  })

  it('should return NotFoundError when payment does not exist', async () => {
    const useCase = new RefundPaymentUseCase(makeMockRepository(null))

    const result = await useCase.execute('unknown')

    expect(result.isErr).toBe(true)
    if (result.isErr) {
      expect(result.error.code).toBe('NOT_FOUND')
    }
  })

  it('should reject refunding an already refunded payment', async () => {
    const useCase = new RefundPaymentUseCase(makeMockRepository(makePayment('refunded')))

    const result = await useCase.execute('pay-1')

    expect(result.isErr).toBe(true)
    if (result.isErr) {
      expect(result.error.code).toBe('VALIDATION_ERROR')
    }
  })
})
