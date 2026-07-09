import { Customer, CUSTOMER_STATUSES } from '../entities/Customer'
import { ICustomerRepository } from '../repositories/ICustomerRepository'
import { Result, ok, err } from '@shared/result/Result'
import { DomainError, NotFoundError, ValidationError } from '@shared/errors/DomainError'

export class UpdateCustomerStatusUseCase {
  constructor(private readonly customerRepository: ICustomerRepository) { }

  async execute(id: string, status: string): Promise<Result<Customer, DomainError>> {
    const existing = await this.customerRepository.findById(id)

    if (!existing) {
      return err(new NotFoundError('Customer', id))
    }

    if (!CUSTOMER_STATUSES.includes(status as never)) {
      return err(new ValidationError(`Statut invalide, doit être l'un de : ${CUSTOMER_STATUSES.join(', ')}`))
    }

    const updated = await this.customerRepository.updateStatus(id, status)

    return ok(updated)
  }
}
