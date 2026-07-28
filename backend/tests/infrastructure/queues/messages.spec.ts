import {
  CONTRACT_JOB_TYPE,
  parseContractJobResponse,
  toContractJobRequest,
} from '@infrastructure/queues/messages'
import { ContractGenerationRequest } from '@domain/ports/IContractQueuePublisher'
import { customerSummary, motoSummary, shopSummary } from '../../helpers/reservation-fixtures'

const baseRequest: ContractGenerationRequest = {
  correlationId: 'corr-1',
  reservation: {
    id: 'res-1',
    motoId: motoSummary.id,
    customerId: customerSummary.id,
    startDate: '2026-08-01',
    endDate: '2026-08-05',
    totalAmount: 340,
    depositAmount: 500,
  },
}

describe('toContractJobRequest', () => {
  it('should map the business request to the snake_case wire format', () => {
    const message = toContractJobRequest(baseRequest)

    expect(message).toEqual({
      correlation_id: 'corr-1',
      job_type: CONTRACT_JOB_TYPE,
      reservation_id: 'res-1',
      data: {
        moto_id: motoSummary.id,
        customer_id: customerSummary.id,
        start_date: '2026-08-01',
        end_date: '2026-08-05',
        total_amount: 340,
        deposit_amount: 500,
      },
    })
  })

  it('should join the denormalized blocks when the reservation is hydrated', () => {
    const message = toContractJobRequest({
      ...baseRequest,
      reservation: {
        ...baseRequest.reservation,
        customer: customerSummary,
        moto: motoSummary,
        shop: shopSummary,
      },
    })

    expect(message.data.customer).toEqual({
      first_name: 'Camille',
      last_name: 'Durand',
      email: 'camille.durand@example.com',
      phone: '+33600000000',
    })
    expect(message.data.moto).toEqual({
      brand: 'Yamaha',
      model: 'MT-07',
      plate: 'AB-123-CD',
      category: 'Roadster',
    })
    expect(message.data.shop).toEqual({ name: 'Plein Gaz Loc', city: 'Paris' })
  })

  it('should omit an absent moto category rather than emit an undefined key', () => {
    const message = toContractJobRequest({
      ...baseRequest,
      reservation: {
        ...baseRequest.reservation,
        moto: { ...motoSummary, category: undefined },
      },
    })

    expect(message.data.moto).toEqual({ brand: 'Yamaha', model: 'MT-07', plate: 'AB-123-CD' })
    expect('category' in (message.data.moto ?? {})).toBe(false)
  })
})

describe('parseContractJobResponse', () => {
  it('should accept a successful worker response', () => {
    const parsed = parseContractJobResponse({
      correlation_id: 'corr-1',
      reservation_id: 'res-1',
      success: true,
      url: 'http://localhost:3000/uploads/contracts/res-1.pdf',
    })

    expect(parsed).toEqual({
      correlation_id: 'corr-1',
      reservation_id: 'res-1',
      success: true,
      url: 'http://localhost:3000/uploads/contracts/res-1.pdf',
      error: undefined,
    })
  })

  it('should accept a failed worker response without url', () => {
    const parsed = parseContractJobResponse({
      correlation_id: 'corr-1',
      reservation_id: 'res-1',
      success: false,
      error: 'pdf generation failed',
    })

    expect(parsed?.success).toBe(false)
    expect(parsed?.error).toBe('pdf generation failed')
  })

  it.each([
    ['not an object', 'nope'],
    ['null', null],
    ['missing reservation_id', { success: true, url: 'x' }],
    ['empty reservation_id', { reservation_id: '', success: true, url: 'x' }],
    ['non-boolean success', { reservation_id: 'res-1', success: 'yes' }],
    ['success without url', { reservation_id: 'res-1', success: true }],
  ])('should reject %s', (_label, raw) => {
    expect(parseContractJobResponse(raw)).toBeNull()
  })
})
