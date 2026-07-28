export const CUSTOMER_STATUSES = ['active', 'suspended'] as const
export type CustomerStatusName = (typeof CUSTOMER_STATUSES)[number]

export interface CreateCustomerParams {
  firstName: string
  lastName: string
  email: string
  phone: string
  licenseNumber: string
  licenseVerified: boolean
  status: string
}

export type UpdateCustomerParams = Partial<CreateCustomerParams>

export class Customer {
  constructor(
    readonly id: string,
    readonly firstName: string,
    readonly lastName: string,
    readonly email: string,
    readonly phone: string,
    readonly licenseNumber: string,
    readonly licenseVerified: boolean,
    readonly status: string,
    readonly createdAt: Date,
    readonly totalRentals?: number,
    readonly totalSpent?: number,
  ) { }

  static create(id: string, params: CreateCustomerParams): Customer {
    return new Customer(
      id,
      params.firstName,
      params.lastName,
      params.email,
      params.phone,
      params.licenseNumber,
      params.licenseVerified,
      params.status,
      new Date(),
    )
  }
}
