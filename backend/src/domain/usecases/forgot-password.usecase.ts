import { IIamClient } from '../repositories/IIamClient'
import { Result, ok, err } from '@shared/result/Result'
import { ValidationError } from '@shared/errors/DomainError'

export class ForgotPasswordUseCase {
  constructor(private readonly iamClient: IIamClient) { }

  async execute(email: string): Promise<Result<void, ValidationError>> {
    if (!email?.includes('@')) {
      return err(new ValidationError("L'email est invalide"))
    }

    try {
      await this.iamClient.sendPasswordResetEmail(email)
    } catch {
      // Volontairement silencieux : ne jamais laisser une erreur IAM révéler
      // si un compte existe pour cet email (anti user-enumeration).
    }

    return ok(undefined)
  }
}
