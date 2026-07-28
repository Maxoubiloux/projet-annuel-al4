import { PatchPreferencesUseCase } from '@domain/usecases/patch-preferences.usecase'
import { ISettingsRepository } from '@domain/repositories/ISettingsRepository'

const makeMockRepository = (current: unknown = null): ISettingsRepository => ({
  get: jest.fn(async () => current),
  set: jest.fn(async (_key, value) => value),
})

describe('PatchPreferencesUseCase', () => {
  it('should merge the patch with existing preferences', async () => {
    const repository = makeMockRepository({ emailNotifications: true })
    const useCase = new PatchPreferencesUseCase(repository)

    const result = await useCase.execute({ emailNotifications: false })

    expect(result.isOk).toBe(true)
    if (result.isOk) {
      expect(result.value.emailNotifications).toBe(false)
    }
  })

  it('should default to sensible preferences when none exist yet', async () => {
    const useCase = new PatchPreferencesUseCase(makeMockRepository(null))

    const result = await useCase.execute({ emailNotifications: false })

    expect(result.isOk).toBe(true)
    if (result.isOk) {
      expect(result.value.emailNotifications).toBe(false)
    }
  })

  it('should reject a non-boolean emailNotifications', async () => {
    const useCase = new PatchPreferencesUseCase(makeMockRepository())

    const result = await useCase.execute({ emailNotifications: 'yes' as never })

    expect(result.isErr).toBe(true)
    if (result.isErr) {
      expect(result.error.code).toBe('VALIDATION_ERROR')
    }
  })
})
