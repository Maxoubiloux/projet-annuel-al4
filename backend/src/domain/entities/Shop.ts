export interface CreateShopParams {
  name: string
  address: string
  city: string
  zipCode: string
  country: string
  phone: string
  email: string
}

export interface UpdateShopParams {
  name?: string
  address?: string
  city?: string
  zipCode?: string
  country?: string
  phone?: string
  email?: string
}

export class Shop {
  constructor(
    readonly id: string,
    readonly name: string,
    readonly address: string,
    readonly city: string,
    readonly zipCode: string,
    readonly country: string,
    readonly phone: string,
    readonly email: string,
    readonly createdAt: Date
  ) { }

  static create(id: string, params: CreateShopParams): Shop {
    return new Shop(
      id,
      params.name,
      params.address,
      params.city,
      params.zipCode,
      params.country,
      params.phone,
      params.email,
      new Date()
    )
  }
}
