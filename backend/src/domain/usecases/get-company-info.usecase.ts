import { CompanyInfo, DEFAULT_COMPANY_INFO, SETTINGS_KEYS } from '../entities/Settings'
import { ISettingsRepository } from '../repositories/ISettingsRepository'

export class GetCompanyInfoUseCase {
  constructor(private readonly settingsRepository: ISettingsRepository) { }

  async execute(): Promise<CompanyInfo> {
    const value = await this.settingsRepository.get(SETTINGS_KEYS.companyInfo)
    return (value as CompanyInfo | null) ?? DEFAULT_COMPANY_INFO
  }
}
