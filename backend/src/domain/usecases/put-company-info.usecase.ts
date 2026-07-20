import { CompanyInfo, SETTINGS_KEYS } from '../entities/Settings'
import { ISettingsRepository } from '../repositories/ISettingsRepository'
import { Result, ok, err } from '@shared/result/Result'
import { ValidationError } from '@shared/errors/DomainError'

export class PutCompanyInfoUseCase {
  constructor(private readonly settingsRepository: ISettingsRepository) { }

  async execute(info: CompanyInfo): Promise<Result<CompanyInfo, ValidationError>> {
    if (!info.name?.trim()) return err(new ValidationError("Le nom de l'entreprise est requis"))
    if (!info.address?.trim()) return err(new ValidationError("L'adresse est requise"))
    if (!info.email?.includes('@')) return err(new ValidationError("L'email est invalide"))
    if (!info.phone?.trim() || info.phone.trim().length < 6) {
      return err(new ValidationError('Le téléphone est invalide'))
    }

    const saved = await this.settingsRepository.set(SETTINGS_KEYS.companyInfo, info)

    return ok(saved as CompanyInfo)
  }
}
