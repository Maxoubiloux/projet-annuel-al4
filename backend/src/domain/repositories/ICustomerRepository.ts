import { Customer, UpdateCustomerParams } from '../entities/Customer'

export interface CustomerListParams {
  page?: number
  limit?: number
}

export interface CustomerListResult {
  items: Customer[]
  total: number
}

export interface ICustomerRepository {
  findAll(params: CustomerListParams): Promise<CustomerListResult>
  findById(id: string): Promise<Customer | null>
  findByEmail(email: string): Promise<Customer | null>
  save(customer: Customer): Promise<Customer>
  update(id: string, params: UpdateCustomerParams): Promise<Customer>
  updateStatus(id: string, status: string): Promise<Customer>
}
