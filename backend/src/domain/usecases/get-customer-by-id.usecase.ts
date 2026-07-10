import { Customer } from '../entities/Customer'
import { ICustomerRepository } from '../repositories/ICustomerRepository'
import { Result, ok, err } from '@shared/result/Result'
import { NotFoundError } from '@shared/errors/DomainError'

export class GetCustomerByIdUseCase {
  constructor(private readonly customerRepository: ICustomerRepository) {}

  async execute(id: string): Promise<Result<Customer, NotFoundError>> {
    const customer = await this.customerRepository.findById(id)

    if (!customer) {
      return err(new NotFoundError('Customer', id))
    }

    return ok(customer)
  }
}
