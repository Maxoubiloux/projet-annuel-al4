import { BookingRules, SETTINGS_KEYS } from '../entities/Settings'
import { ISettingsRepository } from '../repositories/ISettingsRepository'
import { Result, ok, err } from '@shared/result/Result'
import { ValidationError } from '@shared/errors/DomainError'

export class PutBookingRulesUseCase {
  constructor(private readonly settingsRepository: ISettingsRepository) { }

  async execute(rules: BookingRules): Promise<Result<BookingRules, ValidationError>> {
    if (!Number.isInteger(rules.minDays) || rules.minDays < 1) {
      return err(new ValidationError('La durée minimale doit être un entier supérieur ou égal à 1'))
    }
    if (!Number.isInteger(rules.maxDays) || rules.maxDays < rules.minDays) {
      return err(new ValidationError('La durée maximale doit être supérieure ou égale à la durée minimale'))
    }
    if (!Number.isInteger(rules.minAge) || rules.minAge < 18) {
      return err(new ValidationError("L'âge minimum doit être un entier supérieur ou égal à 18"))
    }
    if (!Number.isInteger(rules.freeCancelHours) || rules.freeCancelHours < 0) {
      return err(new ValidationError('Le délai d\'annulation gratuite ne peut pas être négatif'))
    }

    const saved = await this.settingsRepository.set(SETTINGS_KEYS.bookingRules, rules)

    return ok(saved as BookingRules)
  }
}
