import { Customer, UpdateCustomerParams, CUSTOMER_STATUSES } from '../entities/Customer'
import { ICustomerRepository } from '../repositories/ICustomerRepository'
import { Result, ok, err } from '@shared/result/Result'
import { DomainError, NotFoundError, ValidationError } from '@shared/errors/DomainError'

export class UpdateCustomerUseCase {
  constructor(private readonly customerRepository: ICustomerRepository) { }

  async execute(id: string, params: UpdateCustomerParams): Promise<Result<Customer, DomainError>> {
    const existing = await this.customerRepository.findById(id)

    if (!existing) {
      return err(new NotFoundError('Customer', id))
    }

    if (params.email !== undefined) {
      if (!params.email.includes('@')) {
        return err(new ValidationError("L'email est invalide"))
      }
      const other = await this.customerRepository.findByEmail(params.email)
      if (other && other.id !== id) {
        return err(new ValidationError('Un client avec cet email existe déjà'))
      }
    }

    if (params.status !== undefined && !CUSTOMER_STATUSES.includes(params.status as never)) {
      return err(new ValidationError(`Statut invalide, doit être l'un de : ${CUSTOMER_STATUSES.join(', ')}`))
    }

    const updated = await this.customerRepository.update(id, params)

    return ok(updated)
  }
}
