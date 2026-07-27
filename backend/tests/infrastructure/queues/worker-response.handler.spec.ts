import { handleContractResponse } from '@infrastructure/queues/worker-response.consumer'
import { IReservationRepository } from '@domain/repositories/IReservationRepository'
import { Reservation } from '@domain/entities/Reservation'

const makeMockRepository = (updateImpl?: () => Promise<Reservation>): IReservationRepository => ({
  findAll: jest.fn(),
  findRecent: jest.fn(),
  findById: jest.fn(),
  save: jest.fn(),
  updateStatus: jest.fn(),
  updatePaymentStatus: jest.fn(),
  updateContract: jest.fn(updateImpl ?? (async () => ({} as Reservation)))
})

describe('handleContractResponse', () => {
  it('marks the contract as ready with the generated URL on success', async () => {
    const repo = makeMockRepository()
    const result = await handleContractResponse(
      { correlation_id: 'c-1', reservation_id: 'res-1', success: true, url: 's3://bucket/contract.pdf' },
      repo,
    )

    expect(result.ack).toBe(true)
    expect(repo.updateContract).toHaveBeenCalledWith('res-1', 'ready', 's3://bucket/contract.pdf')
  })

  it('marks the contract as failed on a worker failure response', async () => {
    const repo = makeMockRepository()
    const result = await handleContractResponse(
      { correlation_id: 'c-2', reservation_id: 'res-2', success: false, error: 'pdf engine crashed' },
      repo,
    )

    expect(result.ack).toBe(true)
    expect(repo.updateContract).toHaveBeenCalledWith('res-2', 'failed', null)
  })

  it('rejects a malformed message to the dead-letter queue without touching the repository', async () => {
    const repo = makeMockRepository()

    expect((await handleContractResponse({ nonsense: true }, repo)).ack).toBe(false)
    expect((await handleContractResponse(null, repo)).ack).toBe(false)
    // success sans url = invalide
    expect((await handleContractResponse({ reservation_id: 'x', success: true }, repo)).ack).toBe(false)
    expect(repo.updateContract).not.toHaveBeenCalled()
  })

  it('routes to the dead-letter queue when the repository update fails (no infinite requeue)', async () => {
    const repo = makeMockRepository(async () => {
      throw new Error('db connection lost')
    })

    const result = await handleContractResponse(
      { correlation_id: 'c-3', reservation_id: 'res-3', success: true, url: 's3://bucket/x.pdf' },
      repo,
    )

    expect(result.ack).toBe(false)
  })
})
