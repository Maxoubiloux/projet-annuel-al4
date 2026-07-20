import { ICustomerRepository, CustomerListParams, CustomerListResult } from '../repositories/ICustomerRepository'

export class GetAllCustomersUseCase {
  constructor(private readonly customerRepository: ICustomerRepository) { }

  async execute(params: CustomerListParams): Promise<CustomerListResult> {
    return this.customerRepository.findAll(params)
  }
}
