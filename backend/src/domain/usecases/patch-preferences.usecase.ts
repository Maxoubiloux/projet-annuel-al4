import { Preferences, SETTINGS_KEYS } from '../entities/Settings'
import { ISettingsRepository } from '../repositories/ISettingsRepository'
import { Result, ok, err } from '@shared/result/Result'
import { ValidationError } from '@shared/errors/DomainError'

export class PatchPreferencesUseCase {
  constructor(private readonly settingsRepository: ISettingsRepository) { }

  async execute(patch: Partial<Preferences>): Promise<Result<Preferences, ValidationError>> {
    if (patch.emailNotifications !== undefined && typeof patch.emailNotifications !== 'boolean') {
      return err(new ValidationError('emailNotifications doit être un booléen'))
    }

    const current = (await this.settingsRepository.get(SETTINGS_KEYS.preferences)) as Preferences | null
    const merged = { ...(current ?? { emailNotifications: true }), ...patch }

    const saved = await this.settingsRepository.set(SETTINGS_KEYS.preferences, merged)

    return ok(saved as Preferences)
  }
}
