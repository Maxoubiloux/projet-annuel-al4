import { PutBookingRulesUseCase } from '@domain/usecases/put-booking-rules.usecase'
import { ISettingsRepository } from '@domain/repositories/ISettingsRepository'

const makeMockRepository = (): ISettingsRepository => ({
  get: jest.fn(),
  set: jest.fn(async (_key, value) => value),
})

describe('PutBookingRulesUseCase', () => {
  const validRules = { minDays: 1, maxDays: 30, minAge: 21, freeCancelHours: 48 }

  it('should save valid booking rules', async () => {
    const repository = makeMockRepository()
    const useCase = new PutBookingRulesUseCase(repository)

    const result = await useCase.execute(validRules)

    expect(result.isOk).toBe(true)
    expect(repository.set).toHaveBeenCalledWith('booking_rules', validRules)
  })

  it('should reject maxDays lower than minDays', async () => {
    const useCase = new PutBookingRulesUseCase(makeMockRepository())

    const result = await useCase.execute({ ...validRules, minDays: 10, maxDays: 5 })

    expect(result.isErr).toBe(true)
    if (result.isErr) {
      expect(result.error.code).toBe('VALIDATION_ERROR')
    }
  })

  it('should reject a minimum age below 18', async () => {
    const useCase = new PutBookingRulesUseCase(makeMockRepository())

    const result = await useCase.execute({ ...validRules, minAge: 16 })

    expect(result.isErr).toBe(true)
  })

  it('should reject a negative free cancellation window', async () => {
    const useCase = new PutBookingRulesUseCase(makeMockRepository())

    const result = await useCase.execute({ ...validRules, freeCancelHours: -1 })

    expect(result.isErr).toBe(true)
  })
})
