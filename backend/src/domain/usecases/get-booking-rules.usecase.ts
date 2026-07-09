import { BookingRules, DEFAULT_BOOKING_RULES, SETTINGS_KEYS } from '../entities/Settings'
import { ISettingsRepository } from '../repositories/ISettingsRepository'

export class GetBookingRulesUseCase {
  constructor(private readonly settingsRepository: ISettingsRepository) { }

  async execute(): Promise<BookingRules> {
    const value = await this.settingsRepository.get(SETTINGS_KEYS.bookingRules)
    return (value as BookingRules | null) ?? DEFAULT_BOOKING_RULES
  }
}
