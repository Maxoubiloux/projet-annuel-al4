import { PutCompanyInfoUseCase } from '@domain/usecases/put-company-info.usecase'
import { ISettingsRepository } from '@domain/repositories/ISettingsRepository'

const makeMockRepository = (): ISettingsRepository => ({
  get: jest.fn(),
  set: jest.fn(async (_key, value) => value),
})

describe('PutCompanyInfoUseCase', () => {
  const validInfo = {
    name: 'City Moto Yard',
    address: '12 Rue des Motards, 75011 Paris',
    email: 'contact@citymotoyard.fr',
    phone: '+33 1 42 00 00 00',
  }

  it('should save valid company info', async () => {
    const repository = makeMockRepository()
    const useCase = new PutCompanyInfoUseCase(repository)

    const result = await useCase.execute(validInfo)

    expect(result.isOk).toBe(true)
    expect(repository.set).toHaveBeenCalledWith('company_info', validInfo)
  })

  it('should reject an invalid email', async () => {
    const useCase = new PutCompanyInfoUseCase(makeMockRepository())

    const result = await useCase.execute({ ...validInfo, email: 'not-an-email' })

    expect(result.isErr).toBe(true)
    if (result.isErr) {
      expect(result.error.code).toBe('VALIDATION_ERROR')
    }
  })

  it('should reject an empty name', async () => {
    const useCase = new PutCompanyInfoUseCase(makeMockRepository())

    const result = await useCase.execute({ ...validInfo, name: '   ' })

    expect(result.isErr).toBe(true)
  })
})
